import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/states";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-sm" />}>
      <SignIn path="/login" signUpUrl="/register" />
    </Suspense>
  );
}
