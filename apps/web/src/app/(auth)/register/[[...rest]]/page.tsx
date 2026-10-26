import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/states";

export const metadata: Metadata = { title: "Inscription" };

export default function RegisterPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[30rem] w-full max-w-sm" />}>
      <SignUp path="/register" signInUrl="/login" />
    </Suspense>
  );
}
