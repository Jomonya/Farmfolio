import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { productSchema } from "@/lib/validation";
import { ok, handleRouteError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const category = searchParams.get("category")?.trim();

    const products = await prisma.product.findMany({
      where: {
        AND: [
          category && category !== "All" ? { category } : {},
          q
            ? {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                  { location: { contains: q, mode: "insensitive" } },
                ],
              }
            : {},
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(products);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return handleRouteError(new Error("UNAUTHORIZED"));
    }

    const body = await req.json();
    const data = productSchema.parse(body);

    const product = await prisma.product.create({
      data: { ...data, sellerId: session.id },
    });

    return ok(product, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
