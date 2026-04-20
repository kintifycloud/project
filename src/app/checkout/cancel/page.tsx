import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Maybe later
        </h1>
        <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
          You can keep using the free tier and upgrade when unlimited fixes, faster responses, and full history access start saving enough time.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/fix"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
          >
            Back to /fix
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing?checkout=cancel"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
          >
            View pricing again
          </Link>
        </div>
      </div>
    </main>
  );
}
