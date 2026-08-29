import { prisma } from "@/lib/prisma";
import { parseCallback, type StkCallbackBody } from "@/lib/mpesa";

// Daraja posts the STK result here. Public, and must always ack or it retries.
export async function POST(req: Request) {
  const ack = Response.json({ ResultCode: 0, ResultDesc: "Accepted" });

  let body: StkCallbackBody;
  try {
    body = (await req.json()) as StkCallbackBody;
  } catch {
    return ack;
  }

  const result = parseCallback(body);
  if (!result.checkoutRequestId) return ack;

  const payment = await prisma.payment.findUnique({
    where: { checkoutRequestId: result.checkoutRequestId },
  });
  if (!payment || payment.status === "PAID") return ack;

  await prisma.$transaction([
    prisma.payment.update({
      where: { checkoutRequestId: result.checkoutRequestId },
      data: {
        status: result.paid ? "PAID" : "FAILED",
        resultCode: result.resultCode,
        resultDesc: result.resultDesc,
        mpesaReceipt: result.mpesaReceipt,
        rawCallback: JSON.stringify(body).slice(0, 4000),
      },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: { status: result.paid ? "PAID" : "FAILED" },
    }),
  ]);

  return ack;
}
