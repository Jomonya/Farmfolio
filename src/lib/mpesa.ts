import "server-only";

// M-Pesa STK push (Safaricom Daraja). Falls back to a simulated flow when
// there are no credentials so checkout still works locally.

const ENV = process.env.MPESA_ENV === "production" ? "production" : "sandbox";
const BASE_URL =
  ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY ?? "";
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET ?? "";
const PASSKEY = process.env.MPESA_PASSKEY ?? "";
const SHORTCODE = process.env.MPESA_SHORTCODE ?? "174379";
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL ?? "";
const TRANSACTION_TYPE =
  process.env.MPESA_TRANSACTION_TYPE ?? "CustomerPayBillOnline";

export function isSimulated() {
  if (process.env.MPESA_SIMULATE === "true") return true;
  if (process.env.MPESA_SIMULATE === "false") return false;
  return !(CONSUMER_KEY && CONSUMER_SECRET && PASSKEY && CALLBACK_URL);
}

export class MpesaError extends Error {}

// 07.., +2547.., 7.. -> 2547XXXXXXXX
export function normalisePhone(input: string): string {
  const digits = (input || "").replace(/\D/g, "");
  if (/^254(7|1)\d{8}$/.test(digits)) return digits;
  if (/^0(7|1)\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^(7|1)\d{8}$/.test(digits)) return `254${digits}`;
  throw new MpesaError("Enter a valid Safaricom number, e.g. 0712345678");
}

function timestamp(d = new Date()): string {
  // EAT (UTC+3)
  const eat = new Date(d.getTime() + 3 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${eat.getUTCFullYear()}${p(eat.getUTCMonth() + 1)}${p(eat.getUTCDate())}` +
    `${p(eat.getUTCHours())}${p(eat.getUTCMinutes())}${p(eat.getUTCSeconds())}`
  );
}

function b64(s: string) {
  return Buffer.from(s).toString("base64");
}

async function getAccessToken(): Promise<string> {
  const res = await fetch(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${b64(`${CONSUMER_KEY}:${CONSUMER_SECRET}`)}` },
      cache: "no-store",
    },
  );
  if (!res.ok) {
    throw new MpesaError(`M-Pesa auth failed (${res.status})`);
  }
  const body = (await res.json()) as { access_token?: string };
  if (!body.access_token) throw new MpesaError("M-Pesa auth returned no token");
  return body.access_token;
}

export type StkPushInput = {
  phone: string;
  amount: number;
  accountReference: string;
  description: string;
};

export type StkPushResult = {
  merchantRequestId: string;
  checkoutRequestId: string;
  customerMessage: string;
  simulated: boolean;
};

export async function stkPush(input: StkPushInput): Promise<StkPushResult> {
  const phone = normalisePhone(input.phone);
  const amount = Math.max(1, Math.round(input.amount));

  if (isSimulated()) {
    return {
      merchantRequestId: `SIM-${Date.now()}`,
      checkoutRequestId: `ws_CO_SIM_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
      customerMessage:
        "Simulated STK push sent. The payment will complete automatically in a few seconds.",
      simulated: true,
    };
  }

  const ts = timestamp();
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      BusinessShortCode: SHORTCODE,
      Password: b64(`${SHORTCODE}${PASSKEY}${ts}`),
      Timestamp: ts,
      TransactionType: TRANSACTION_TYPE,
      Amount: amount,
      PartyA: phone,
      PartyB: SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: CALLBACK_URL,
      AccountReference: input.accountReference.slice(0, 12),
      TransactionDesc: input.description.slice(0, 20) || "Payment",
    }),
  });

  const body = (await res.json()) as {
    MerchantRequestID?: string;
    CheckoutRequestID?: string;
    ResponseCode?: string;
    CustomerMessage?: string;
    errorMessage?: string;
  };

  if (!res.ok || body.ResponseCode !== "0" || !body.CheckoutRequestID) {
    throw new MpesaError(
      body.errorMessage || body.CustomerMessage || "M-Pesa did not accept the request",
    );
  }

  return {
    merchantRequestId: body.MerchantRequestID ?? "",
    checkoutRequestId: body.CheckoutRequestID,
    customerMessage:
      body.CustomerMessage ?? "Check your phone and enter your M-Pesa PIN.",
    simulated: false,
  };
}

export type StkStatus = {
  resultCode: string;
  resultDesc: string;
  paid: boolean;
};

// used as a fallback when the callback can't reach us (e.g. localhost)
export async function stkQuery(checkoutRequestId: string): Promise<StkStatus | null> {
  if (isSimulated()) return null;

  const ts = timestamp();
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      BusinessShortCode: SHORTCODE,
      Password: b64(`${SHORTCODE}${PASSKEY}${ts}`),
      Timestamp: ts,
      CheckoutRequestID: checkoutRequestId,
    }),
  });

  const body = (await res.json()) as {
    ResultCode?: string;
    ResultDesc?: string;
  };

  if (body.ResultCode === undefined) return null; // still processing
  return {
    resultCode: String(body.ResultCode),
    resultDesc: body.ResultDesc ?? "",
    paid: String(body.ResultCode) === "0",
  };
}

export type StkCallbackBody = {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string;
      CheckoutRequestID?: string;
      ResultCode?: number;
      ResultDesc?: string;
      CallbackMetadata?: { Item?: { Name: string; Value?: string | number }[] };
    };
  };
};

export function parseCallback(body: StkCallbackBody) {
  const cb = body.Body?.stkCallback;
  const items = cb?.CallbackMetadata?.Item ?? [];
  const get = (name: string) =>
    items.find((i) => i.Name === name)?.Value;

  return {
    merchantRequestId: cb?.MerchantRequestID ?? "",
    checkoutRequestId: cb?.CheckoutRequestID ?? "",
    resultCode: String(cb?.ResultCode ?? ""),
    resultDesc: cb?.ResultDesc ?? "",
    paid: Number(cb?.ResultCode) === 0,
    mpesaReceipt: String(get("MpesaReceiptNumber") ?? ""),
    amount: Number(get("Amount") ?? 0),
    phone: String(get("PhoneNumber") ?? ""),
  };
}
