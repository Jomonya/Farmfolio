import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ok, fail, handleRouteError } from "@/lib/api";
import { isSimulated } from "@/lib/mpesa";

// stands in for the Daraja callback in simulate mode. body: { outcome }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) return handleRouteError(new Error("UNAUTHORIZED"));

    if (!isSimulated()) {
      return fail("Live M-Pesa is configured; use the real STK prompt", 400);
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { payment: true },
    });

    if (!order || order.userId !== session.id) return fail("Order not found", 404);
    if (!order.payment?.simulated) {
      return fail("This order is not a simulated payment", 400);
    }
    if (order.status !== "PENDING") {
      return ok({ status: order.status });
    }

    const outcome = await req
      .json()
      .then((b) => (b?.outcome === "fail" ? "fail" : "success"))
      .catch(() => "success");

    const paid = outcome === "success";
    const receipt = paid
      ? `SIM${Math.random().toString(36).slice(2, 10).toUpperCase()}`
      : "";

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          status: paid ? "PAID" : "FAILED",
          resultCode: paid ? "0" : "1032",
          resultDesc: paid
            ? "The service request is processed successfully."
            : "Request cancelled by user.",
          mpesaReceipt: receipt,
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { status: paid ? "PAID" : "FAILED" },
      }),
    ]);

    return ok({ status: paid ? "PAID" : "FAILED", mpesaReceipt: receipt });
  } catch (err) {
    return handleRouteError(err);
  }
}
