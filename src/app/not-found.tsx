import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffaf7] px-6 py-16">
      {/* Background Decorations */}
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-rose-100/60 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-orange-100/60 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
        {/* Icon */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-rose-100 text-5xl shadow-sm">
          💍
        </div>

        {/* Error Code */}
        <h1 className="text-8xl font-black tracking-tight text-rose-500 sm:text-9xl">
          404
        </h1>

        <h2 className="mt-5 text-2xl font-bold text-gray-900 sm:text-4xl">
          Oops! This Page Is Missing
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-gray-600 sm:text-lg">
          Looks like this page has gone missing! Don't worry, your perfect
          wedding journey is still waiting for you. Let's get you back on track.
        </p>

        {/* Buttons */}
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="rounded-full bg-rose-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-rose-200 transition hover:-translate-y-1 hover:bg-rose-600"
          >
            Back to Home →
          </Link>

          <Link
            href="/services"
            className="rounded-full border border-rose-200 bg-white px-8 py-3.5 font-semibold text-rose-600 transition hover:-translate-y-1 hover:bg-rose-50"
          >
            Explore Services
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-16 text-sm text-gray-400">
          © 2026 WedPlan. Making Your Special Day Perfect.
        </p>
      </div>
    </main>
  );
}
