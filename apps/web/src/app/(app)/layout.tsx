import { TopBar } from "@/components/layout/top-bar";
import { MobileNav, SideNav } from "@/components/navigation/app-nav";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1">
      <SideNav />
      {/* pb-28 : espace pour la barre mobile fixe et son bouton central */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-2 pb-28 md:px-8 md:pt-8 md:pb-10">
        <TopBar />
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
