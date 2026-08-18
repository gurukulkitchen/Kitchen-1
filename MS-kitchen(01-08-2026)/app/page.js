"use client";

import { useEffect, useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => setMessage('Error fetching data'));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="p-10 bg-card dark:bg-gray-800 rounded-xl shadow-2xl text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mb-6">
          Next.js + Tailwind + Backend
        </h1>
        <p className="text-lg text-foreground dark:text-slate-600 mb-4">
          API Response:
        </p>
        <div className="text-2xl font-mono text-green-600 font-bold p-4 bg-muted dark:bg-gray-700 rounded-lg border border-border dark:border-gray-600">
          {message}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Built with strict JavaScript & Tailwind.
        </p>
      </div>
    </div>
  );
}
