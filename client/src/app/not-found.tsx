import Link from "next/link";
export default function NotFound() {
  return (
    <main className="standalone">
      <span className="eyebrow">404 · Lost in the hive</span>
      <h1>This page doesn’t exist.</h1>
      <p>Let’s get you back to building.</p>
      <Link className="button primary" href="/dashboard">
        Go to dashboard
      </Link>
    </main>
  );
}
