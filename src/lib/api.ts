import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, init?: number) {
  return NextResponse.json(data, { status: init ?? 200 });
}

export function fail(message: string, status = 400, extra?: unknown) {
  return NextResponse.json({ error: message, details: extra }, { status });
}

export function fromZodError(err: ZodError) {
  const first = err.issues[0];
  return fail(first?.message ?? "Invalid input", 422, err.flatten().fieldErrors);
}

export function handleRouteError(err: unknown) {
  if (err instanceof ZodError) return fromZodError(err);
  if (err instanceof Error && err.message === "UNAUTHORIZED") {
    return fail("You need to sign in to do that", 401);
  }
  console.error(err);
  return fail("Something went wrong", 500);
}
