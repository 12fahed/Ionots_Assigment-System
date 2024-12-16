
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
      <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
      <p className="text-xl text-slate-700 mb-8">Page Not Found</p>
      <Link href="/landing" className="text-slate-500 hover:underline">
        Go back to Home
      </Link>
    </div>
  );
}
