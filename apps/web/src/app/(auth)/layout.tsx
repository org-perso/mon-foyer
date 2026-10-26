import Link from "next/link";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-5 py-12">
      <Link href="/" className="text-lg font-semibold">
        Mon-Foyer
      </Link>
      {children}
    </main>
  );
}
