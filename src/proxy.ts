import { NextResponse, type NextRequest } from "next/server";

// quick redirect if there's no session cookie; the pages still verify it
export function proxy(req: NextRequest) {
  const hasSession = req.cookies.has("farmfolio_session");
  if (!hasSession) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/checkout", "/orders/:path*"],
};
