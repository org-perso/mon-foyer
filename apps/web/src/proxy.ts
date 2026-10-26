import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"];

/**
 * Redirection optimiste : sans cookie de session, inutile d'afficher l'app.
 * Ce n'est PAS un contrôle de sécurité : l'API vérifie la session à chaque requête.
 */
export function proxy(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (!hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/reports/:path*",
    "/household/:path*",
    "/settings/:path*",
  ],
};
