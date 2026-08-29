import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { ok, fail, handleRouteError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return fail("An account with that email already exists", 409);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash: await hashPassword(password),
      },
    });

    await createSession(user.id);
    return ok(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      201,
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
