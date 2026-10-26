import Link from "next/link";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
      <Link href="/" className="text-lg font-semibold">
        Mon-Foyer
      </Link>
      {children}
    </main>
  );
}
