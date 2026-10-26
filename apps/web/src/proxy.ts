import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/transactions(.*)",
  "/reports(.*)",
  "/household(.*)",
  "/settings(.*)",
]);

/**
 * Sans session Clerk valide, les pages de l'application redirigent vers /login.
 * Les données restent protégées par l'API, qui revérifie le jeton à chaque requête.
 */
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Toutes les pages sauf les fichiers statiques et internes de Next.js
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
