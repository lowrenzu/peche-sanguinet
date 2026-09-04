"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-signal-bad/40 bg-ink-800 p-6">
      <p className="text-signal-bad">Erreur d&apos;affichage</p>
      <p className="mt-2 text-sm text-mist-500">{error.message}</p>
      <button type="button" onClick={reset} className="mt-4 rounded-xl bg-teal px-4 py-2 text-ink-950">
        Réessayer
      </button>
    </div>
  );
}
