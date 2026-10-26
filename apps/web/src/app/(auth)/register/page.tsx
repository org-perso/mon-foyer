import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Inscription" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Créer un compte</h1>
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </>
  );
}
