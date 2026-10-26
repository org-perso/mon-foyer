import { UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Réglages" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Réglages" />
      <div className="flex flex-col gap-3">
        <Card className="flex items-center justify-between gap-3">
          <div>
            <p className="font-medium">Mon compte</p>
            <p className="text-sm text-muted">Profil, e-mail, mot de passe et sécurité</p>
          </div>
          <UserButton />
        </Card>
        <SignOutButton />
      </div>
    </>
  );
}
