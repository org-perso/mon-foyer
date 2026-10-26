import type { Metadata } from "next";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Réglages" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Réglages" />
      <SignOutButton />
    </>
  );
}
