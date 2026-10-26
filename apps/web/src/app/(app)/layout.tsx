import { MobileNav, SideNav } from "@/components/navigation/app-nav";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1">
      <SideNav />
      {/* pb-24 : espace pour la navigation mobile fixe */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6 pb-24 md:px-8 md:pb-10">{children}</main>
      <MobileNav />
    </div>
  );
}
