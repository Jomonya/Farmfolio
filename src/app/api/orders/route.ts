import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ok, handleRouteError } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return handleRouteError(new Error("UNAUTHORIZED"));

    const orders = await prisma.order.findMany({
      where: { userId: session.id },
      include: { items: true, payment: true },
      orderBy: { createdAt: "desc" },
    });
    return ok(orders);
  } catch (err) {
    return handleRouteError(err);
  }
}
