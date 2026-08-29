import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validation";
import { ok, fail, handleRouteError } from "@/lib/api";
import { stkPush, normalisePhone, MpesaError } from "@/lib/mpesa";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return handleRouteError(new Error("UNAUTHORIZED"));

    const { phone, buyerName, items } = checkoutSchema.parse(await req.json());

    let normalisedPhone: string;
    try {
      normalisedPhone = normalisePhone(phone);
    } catch (e) {
      return fail(e instanceof MpesaError ? e.message : "Invalid phone", 422);
    }

    // don't trust prices from the client
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    const lineItems = items
      .map((i) => {
        const p = byId.get(i.productId);
        return p
          ? {
              name: p.name,
              unitPrice: p.price,
              quantity: i.quantity,
              productId: p.id,
            }
          : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (lineItems.length === 0) {
      return fail("None of those products are available any more", 409);
    }

    const totalAmount = lineItems.reduce(
      (n, l) => n + l.unitPrice * l.quantity,
      0,
    );

    const order = await prisma.order.create({
      data: {
        userId: session.id,
        status: "PENDING",
        totalAmount,
        buyerName: buyerName ?? session.name ?? "",
        buyerPhone: normalisedPhone,
        items: { create: lineItems },
      },
    });

    try {
      const push = await stkPush({
        phone: normalisedPhone,
        amount: totalAmount,
        accountReference: `FF${order.id}`,
        description: `FarmFolio ${order.id}`,
      });

      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          phone: normalisedPhone,
          merchantRequestId: push.merchantRequestId,
          checkoutRequestId: push.checkoutRequestId,
          simulated: push.simulated,
          status: "PENDING",
        },
      });

      return ok(
        {
          orderId: order.id,
          simulated: push.simulated,
          message: push.customerMessage,
        },
        201,
      );
    } catch (e) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      });
      return fail(
        e instanceof MpesaError ? e.message : "Could not start the M-Pesa payment",
        502,
      );
    }
  } catch (err) {
    return handleRouteError(err);
  }
}
