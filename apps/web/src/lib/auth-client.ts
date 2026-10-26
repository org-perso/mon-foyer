import { createAuthClient } from "better-auth/react";

// Même origine que l'application : les appels /api/auth/* passent par le proxy Next.js.
export const authClient = createAuthClient();
