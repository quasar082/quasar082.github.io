import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-white px-8 text-center text-[#111111]">
      <div>
        <h1 className="m-0 mb-4 text-3xl">404</h1>
        <p className="m-0 mb-6">Page not found.</p>
        <Link href="/" className="text-inherit underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
