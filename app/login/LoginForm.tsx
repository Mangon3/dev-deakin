"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import { loginSchema } from "../lib/Validation";

const inputStyles =
  "w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-teal-500 transition-colors";

export default function LoginForm({ registered }: { registered: boolean }) {
  const { signIn } = useAuth();
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.SyntheticEvent): Promise<void> => {
    event.preventDefault();

    const form = new FormData(event.target as HTMLFormElement);
    const parsed = loginSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error || "Could not log you in. Please try again.");
        return;
      }

      // The signed JWT becomes the session
      signIn(data.token);
      router.push("/");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="w-full max-w-md border border-zinc-200 dark:border-zinc-800 rounded-xl p-8">
      <div className="flex justify-end mb-6">
        <Link
          href="/signup"
          className="px-4 py-1.5 text-sm font-semibold rounded-lg border border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors"
        >
          Sign up
        </Link>
      </div>

      {/* Post-signup notice */}
      {registered && (
        <p className="mb-6 text-sm text-teal-600 dark:text-teal-400">
          Account created. Please log in to continue.
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div>
          <label htmlFor="email" className="block text-sm mb-1">
            Your email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={inputStyles}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm mb-1">
            Your password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className={inputStyles}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {pending ? "Logging in..." : "Login"}
        </button>

        {error && (
          <p aria-live="polite" className="text-sm text-red-500">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
