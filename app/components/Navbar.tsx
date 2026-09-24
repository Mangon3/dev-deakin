"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "../context/AuthContext";

const linkStyles =
  "px-4 py-1.5 text-sm font-semibold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap";

// Navbar section
export default function Navbar() {
  const { user, ready, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = (): void => {
    signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="w-full border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-4 px-8 py-3 max-w-5xl mx-auto">
        <Link href="/" className="font-bold tracking-tight whitespace-nowrap">
          DEV<span className="text-teal-500">@</span>Deakin
        </Link>

        {/* Search bar */}
        <div className="flex-1 relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-4.34-4.34M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
            />
          </svg>
          <input
            type="search"
            placeholder="Search..."
            aria-label="Search"
            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 placeholder-zinc-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        <Link href="/jobs" className={linkStyles}>
          Jobs
        </Link>

        <Link href="/browse" className={linkStyles}>
          Browse Posts
        </Link>

        <Link href="/pricing" className={linkStyles}>
          Pricing
        </Link>

        <Link href="/post" className={linkStyles}>
          Post
        </Link>

        {/* Session controls, hidden until localStorage has been read */}
        {!ready ? null : user ? (
          <>
            <span className="flex items-center gap-2 text-sm whitespace-nowrap">
              {user.name}
              <span
                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  user.plan === "paid"
                    ? "bg-teal-500 text-white"
                    : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              >
                {user.plan === "paid" ? "Paid" : "Free"}
              </span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
