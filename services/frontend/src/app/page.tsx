/** Temporary Phase 1 placeholder for `/`; the Home sections replace it in Phase 5. */
export default function HomePage() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center gap-4 px-6"
    >
      <p className="text-sm">Phase 1 — project foundation</p>
      <h1 className="text-4xl font-semibold">INDEX Eco Resort</h1>
      <p>
        The premium Next.js frontend is being built phase by phase. Every path this app does not own
        yet is served by the existing site through the Laravel fallback.
      </p>
    </main>
  );
}
