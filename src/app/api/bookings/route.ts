import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { bookingSchema } from "@/lib/validation";
import { ok, fail, handleRouteError } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return handleRouteError(new Error("UNAUTHORIZED"));

    const bookings = await prisma.booking.findMany({
      where: { userId: session.id },
      include: { veterinarian: true },
      orderBy: { createdAt: "desc" },
    });
    return ok(bookings);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return handleRouteError(new Error("UNAUTHORIZED"));

    const body = await req.json();
    const data = bookingSchema.parse(body);

    const vet = await prisma.veterinarian.findUnique({
      where: { id: data.veterinarianId },
    });
    if (!vet) return fail("That veterinarian is not available", 404);

    const clash = await prisma.booking.findFirst({
      where: {
        veterinarianId: data.veterinarianId,
        date: data.date,
        timeSlot: data.timeSlot,
        status: { not: "CANCELLED" },
      },
    });
    if (clash) return fail("That slot is already booked", 409);

    const booking = await prisma.booking.create({
      data: {
        userId: session.id,
        veterinarianId: data.veterinarianId,
        date: data.date,
        timeSlot: data.timeSlot,
        notes: data.notes ?? "",
      },
      include: { veterinarian: true },
    });

    return ok(booking, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
