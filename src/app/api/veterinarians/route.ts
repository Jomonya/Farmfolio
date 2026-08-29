import { prisma } from "@/lib/prisma";
import { ok, handleRouteError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    const vets = await prisma.veterinarian.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q } },
              { specialization: { contains: q } },
              { location: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { name: "asc" },
    });

    return ok(vets);
  } catch (err) {
    return handleRouteError(err);
  }
}
