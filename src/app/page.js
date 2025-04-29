"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function Home() {
  const [result, setResult] = useState("");
  const [ready, setReady] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);

  const worker = useRef(null);

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL("./worker.js", import.meta.url), {
        type: "module",
      });

      const onMessageReceived = (e) => {
        switch (e.data.status) {
          case "progress":
            setProgress(e.data.message);
            break;
          case "ready":
            setReady(true);
            setProgress(null);
            break;
          case "complete":
            setResult(e.data.output[0]);
            setProgress(null);
            break;
          case "error":
            setError(e.data.message);
            setProgress(null);
            break;
        }
      };

      worker.current.addEventListener("message", onMessageReceived);
      worker.current.postMessage({ action: "init" });
    }

    return () => {
      if (worker.current) {
        worker.current.terminate();
      }
    };
  }, []);

  const classify = useCallback((text) => {
    if (worker.current && ready) {
      setResult("");
      setError(null);
      worker.current.postMessage({ action: "classify", text });
    }
  }, [ready]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      <h1 className="text-5xl font-bold mb-2 text-center">Transformers.js</h1>
      <h2 className="text-2xl mb-4 text-center">Next.js template</h2>

      <input
        className="w-full max-w-xs p-2 border border-gray-300 rounded mb-4"
        type="text"
        placeholder="Enter text here"
        onInput={(e) => {
          classify(e.target.value);
        }}
      />

      {progress && (
        <pre className="bg-gray-100 p-2 rounded">
          Loading: {JSON.stringify(progress, null, 2)}
        </pre>
      )}
      {error && (
        <pre className="bg-red-100 p-2 rounded text-red-500">
          Error: {error}
        </pre>
      )}
      {result && (
        <pre className="bg-gray-100 p-2 rounded text-black">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
