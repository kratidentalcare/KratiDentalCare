import { APP_DESCRIPTION, APP_NAME } from "@/constants";

export default function HomePage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-gradient-to-b from-sky-50 via-white to-teal-50/40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.12),_transparent_55%)]"
      />

      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16 sm:px-8 sm:py-24">
        <p className="text-sm font-medium tracking-wide text-sky-700 uppercase">
          Clinic management
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          {APP_NAME}
        </h1>

        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          {APP_DESCRIPTION} Authentication foundation is wired — feature
          modules come next.
        </p>
      </div>
    </main>
  );
}
