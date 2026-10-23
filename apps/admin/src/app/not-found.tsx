import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-bg text-brand-text">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-brand-muted">Page not found</p>
      <Link
        href="/"
        className="mt-4 rounded-lg bg-brand-cyan/10 px-4 py-2 text-sm font-medium text-brand-cyan hover:bg-brand-cyan/20"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
