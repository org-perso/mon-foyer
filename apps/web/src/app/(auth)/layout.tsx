import Link from "next/link";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] px-5 pt-10 pb-20 text-white">
        <div aria-hidden className="absolute -top-16 -right-16 size-48 rounded-full bg-white/10" />
        <Link href="/" className="relative mx-auto flex max-w-md items-center gap-2 text-lg font-bold">
          <span className="flex size-9 items-center justify-center rounded-xl bg-white/15 text-sm">MF</span>
          Mon-Foyer
        </Link>
      </div>
      <div className="-mt-14 flex flex-1 justify-center px-4 pb-10">{children}</div>
    </main>
  );
}
