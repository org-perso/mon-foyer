import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Connexion</h1>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </>
  );
}
