import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="text-center">
          <p className="text-6xl font-bold text-brand-cyan">404</p>
          <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
          <p className="mt-2 text-brand-muted">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center rounded-lg bg-brand-cyan px-5 py-2.5 text-sm font-semibold text-brand-bg transition-all hover:shadow-lg hover:shadow-brand-cyan/20"
          >
            Go home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
