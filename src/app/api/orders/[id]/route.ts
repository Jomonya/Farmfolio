import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ok, fail, handleRouteError } from "@/lib/api";
import { stkQuery } from "@/lib/mpesa";

// If still pending after a bit, ask Daraja directly (covers a missed callback).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) return handleRouteError(new Error("UNAUTHORIZED"));

    const { id } = await params;
    let order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: true, payment: true },
    });

    if (!order || order.userId !== session.id) {
      return fail("Order not found", 404);
    }

    if (
      order.status === "PENDING" &&
      order.payment &&
      !order.payment.simulated &&
      Date.now() - order.payment.createdAt.getTime() > 8000
    ) {
      try {
        const status = await stkQuery(order.payment.checkoutRequestId);
        if (status) {
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: order.payment.id },
              data: {
                status: status.paid ? "PAID" : "FAILED",
                resultCode: status.resultCode,
                resultDesc: status.resultDesc,
              },
            }),
            prisma.order.update({
              where: { id: order.id },
              data: { status: status.paid ? "PAID" : "FAILED" },
            }),
          ]);
          order = await prisma.order.findUnique({
            where: { id: order.id },
            include: { items: true, payment: true },
          });
        }
      } catch {
        /* leave as PENDING; the client keeps polling */
      }
    }

    return ok(order);
  } catch (err) {
    return handleRouteError(err);
  }
}
