import Link from "next/link";
import { Logo, TestModeBadge } from "./ui";

export function PublicFrame({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-paper">
      <header className="no-print flex h-16 items-center gap-3 px-5 sm:px-8">
        <Link href="/" aria-label="AGNCY home">
          <Logo />
        </Link>
        <div className="flex-1" />
        <TestModeBadge />
        {right}
      </header>
      <main className="mx-auto w-full max-w-[1040px] flex-1 px-4 pb-16 pt-4 sm:px-6">{children}</main>
      <footer className="no-print pb-8 text-center text-xs text-ink/40">AGNCY · payments for the creative economy</footer>
    </div>
  );
}
