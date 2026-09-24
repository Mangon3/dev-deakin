"use client";

import { useState } from "react";
import { z } from "zod";

import { useAuth } from "../context/AuthContext";
import { paymentSchema } from "../lib/Validation";

const inputStyles =
  "w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-teal-500 transition-colors";

type Errors = Record<string, string[] | undefined>;

// Groups digits as you type
function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export default function UpgradeModal({ onClose }: { onClose: () => void }) {
  const { token, signIn } = useAuth();

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.SyntheticEvent): Promise<void> => {
    event.preventDefault();

    const form = new FormData(event.target as HTMLFormElement);
    // Validate before sending to backend
    const parsed = paymentSchema.safeParse({
      cardName: form.get("cardName"),
      cardNumber: form.get("cardNumber"),
      expiry: form.get("expiry"),
      cvc: form.get("cvc"),
    });

    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors);
      setMessage("");
      return;
    }

    setPending(true);
    setErrors({});
    setMessage("");

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setErrors(data?.fields ?? {});
        setMessage(data?.error || "Could not upgrade your plan.");
        return;
      }

      // New token carries the plan
      signIn(data.token);
      onClose();
    } catch {
      setMessage("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Upgrade to the Paid plan"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6"
      >
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-lg font-bold">Upgrade to Paid</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-xl leading-none cursor-pointer hover:opacity-70"
          >
            &times;
          </button>
        </div>
        <p className="text-sm text-zinc-500 mb-6">
          Enter your payment details to unlock paid posts.
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div>
            <label htmlFor="cardName" className="block text-sm mb-1">
              Name on card
            </label>
            <input
              id="cardName"
              name="cardName"
              type="text"
              placeholder="Vu Hoang Lam"
              className={inputStyles}
            />
            {errors.cardName && (
              <p className="mt-1 text-sm text-red-500">{errors.cardName[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="cardNumber" className="block text-sm mb-1">
              Card number
            </label>
            <input
              id="cardNumber"
              name="cardNumber"
              type="text"
              inputMode="numeric"
              value={cardNumber}
              onChange={(event) =>
                setCardNumber(formatCardNumber(event.target.value))
              }
              placeholder="4242 4242 4242 4242"
              className={inputStyles}
            />
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.cardNumber[0]}</p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="expiry" className="block text-sm mb-1">
                Expiry
              </label>
              <input
                id="expiry"
                name="expiry"
                type="text"
                inputMode="numeric"
                value={expiry}
                onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                placeholder="MM/YY"
                className={inputStyles}
              />
              {errors.expiry && (
                <p className="mt-1 text-sm text-red-500">{errors.expiry[0]}</p>
              )}
            </div>

            <div className="flex-1">
              <label htmlFor="cvc" className="block text-sm mb-1">
                CVC
              </label>
              <input
                id="cvc"
                name="cvc"
                type="text"
                inputMode="numeric"
                placeholder="123"
                className={inputStyles}
              />
              {errors.cvc && (
                <p className="mt-1 text-sm text-red-500">{errors.cvc[0]}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full mt-2 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {pending ? "Upgrading..." : "Confirm upgrade"}
          </button>

          {message && (
            <p aria-live="polite" className="text-sm text-red-500">
              {message}
            </p>
          )}

          <p className="text-xs text-zinc-500 text-center">
            Card details are validated then discarded. Nothing is stored or
            charged.
          </p>
        </form>
      </div>
    </div>
  );
}
