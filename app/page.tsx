import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Collaborative Garden</h1>
      <p className="text-slate-600">A slow-social platform for collaborative, deterministic plants.</p>
      <div className="space-x-4">
        <Link href="/garden" className="px-4 py-2 bg-green-600 text-white rounded">Open Garden</Link>
        <Link href="/docs" className="px-4 py-2 border rounded">Docs</Link>
      </div>
    </div>
  );
}
