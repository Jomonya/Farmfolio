import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ok, fail, handleRouteError } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { seller: { select: { name: true, email: true } } },
    });
    if (!product) return fail("Product not found", 404);
    return ok(product);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) return handleRouteError(new Error("UNAUTHORIZED"));

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!product) return fail("Product not found", 404);
    if (product.sellerId !== session.id) {
      return fail("You can only remove your own listings", 403);
    }

    await prisma.product.delete({ where: { id: Number(id) } });
    return ok({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
