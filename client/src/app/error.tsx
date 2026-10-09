"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="standalone">
      <h1>Something went wrong.</h1>
      <p>Please try again. Your saved work is still in your workspace.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
