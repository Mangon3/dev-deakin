"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import UpgradeModal from "./UpgradeModal";

// Free and Paid feature lists
const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "Read all free questions and articles",
      "Post up to 5 questions or articles a month",
      "Up to 3 tags per post",
      "Images up to 1 MB",
      "Community support",
    ],
    missing: ["Access to paid posts", "Early access to new articles"],
  },
  {
    name: "Paid",
    price: "$9",
    period: "per month",
    features: [
      "Everything in Free",
      "Read paid questions and articles",
      "Early access to new articles",
      "Unlimited posts a month",
      "Priority support",
    ],
    missing: [],
  },
] as const;

function Tick() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className="w-4 h-4 shrink-0 mt-0.5 text-teal-500"
    >
      <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" />
    </svg>
  );
}

function Cross() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400"
    >
      <path d="M6.7 5.3a1 1 0 0 0-1.4 1.4L8.6 10l-3.3 3.3a1 1 0 1 0 1.4 1.4L10 11.4l3.3 3.3a1 1 0 0 0 1.4-1.4L11.4 10l3.3-3.3a1 1 0 0 0-1.4-1.4L10 8.6Z" />
    </svg>
  );
}

export default function PricingPlans() {
  const { user, ready } = useAuth();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const isPaid = user?.plan === "paid";

  const handleUpgrade = (): void => {
    // Paid users are told, not shown
    if (isPaid) {
      setNotice("You are already on the Paid plan.");
      return;
    }

    setNotice("");
    setOpen(true);
  };

  return (
    <>
      {/* Current plan */}
      {ready && user && (
        <p className="mb-8 text-sm">
          Signed in as <span className="font-semibold">{user.name}</span> on the{" "}
          <span
            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
              isPaid ? "bg-teal-500 text-white" : "bg-zinc-200 dark:bg-zinc-700"
            }`}
          >
            {isPaid ? "Paid" : "Free"}
          </span>{" "}
          plan.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {PLANS.map((plan) => {
          const highlighted = plan.name === "Paid";

          return (
            <div
              key={plan.name}
              className={`flex flex-col rounded-xl border p-6 ${
                highlighted
                  ? "border-teal-500"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold">{plan.name}</h2>
                {isPaid && highlighted && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-500 text-white">
                    Your plan
                  </span>
                )}
                {ready && !isPaid && !highlighted && user && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-zinc-200 dark:bg-zinc-700">
                    Your plan
                  </span>
                )}
              </div>

              <p className="mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>{" "}
                <span className="text-sm text-zinc-500">{plan.period}</span>
              </p>

              <ul className="flex flex-col gap-2 text-sm mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Tick />
                    {feature}
                  </li>
                ))}
                {plan.missing.map((feature) => (
                  <li key={feature} className="flex gap-2 text-zinc-400">
                    <Cross />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {highlighted ? (
                  ready && !user ? (
                    <Link
                      href="/login"
                      className="block w-full py-2 text-center bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
                    >
                      Log in to upgrade
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={handleUpgrade}
                      disabled={!ready || isPaid}
                      className="w-full py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isPaid ? "Current plan" : "Upgrade Plan"}
                    </button>
                  )
                ) : (
                  <p className="text-sm text-center text-zinc-500 py-2">
                    Included by default
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {notice && (
        <p role="status" className="mt-6 text-sm text-teal-600 dark:text-teal-400">
          {notice}
        </p>
      )}

      {open && <UpgradeModal onClose={() => setOpen(false)} />}
    </>
  );
}
