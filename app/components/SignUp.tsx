"use client";

import { useState } from "react";
import { subscribeSchema } from "../lib/Validation";

const SUBSCRIBE_URL = "/api/subscribe";
const REQUEST_TIMEOUT_MS = 15000;

type Status = "idle" | "submitting" | "success" | "error";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    // Validate before the round trip
    const parsed = subscribeSchema.safeParse({ email });

    if (!parsed.success) {
      setStatus("error");
      setFeedback(parsed.error.issues[0].message);
      return;
    }

    setStatus("submitting");
    setFeedback("");

    // Cancel if server never responds
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      // Express sends email
      const response = await fetch(SUBSCRIBE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: controller.signal,
      });

      // Throw crashed server HTML
      const data = await response.json().catch(() => null);

      if (response.ok) {
        setStatus("success");
        setFeedback(data?.message || "You're subscribed!");
        setEmail("");
        return;
      }

      setStatus("error");

      if (response.status === 400) {
        setFeedback(data?.error || "Please check the email you entered.");
      } else if (response.status === 502) {
        setFeedback(
          data?.error || "Our email service is unavailable. Please try later."
        );
      } else {
        setFeedback(
          data?.error || `Something went wrong (error ${response.status}).`
        );
      }
    } catch (error) {
      setStatus("error");

      if (error instanceof DOMException && error.name === "AbortError") {
        setFeedback("The server took too long to respond. Please try again.");
      } else {
        setFeedback("Could not reach the server. Is the backend running?");
      }
    } finally {
      clearTimeout(timeout);
    }
  };

  const isSubmitting = status === "submitting";

  return (
    // Form section
    <section id="contact" className="w-full bg-zinc-900 text-white py-16 mt-4">
      <div className="max-w-xl mx-auto px-8 text-center">
        <h2 className="text-3xl font-bold mb-2 tracking-tight">SIGN UP FOR OUR DAILY INSIDER</h2>
        <p className="text-zinc-400 mb-8">The latest news, articles, and resources, sent to your inbox.</p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row gap-3 justify-center">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (!isSubmitting) {  // Clear stale feedback
                setStatus("idle");
                setFeedback("");
              }
            }}
            disabled={isSubmitting}
            aria-invalid={status === "error"}
            className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Sending..." : "Subscribe"}
          </button>
        </form>

        {/* Request outcome */}
        <p role="status" aria-live="polite" className="min-h-6 mt-4 text-sm">
          {feedback && (
            <span className={status === "success" ? "text-teal-400" : "text-red-400"}>
              {feedback}
            </span>
          )}
        </p>
      </div>
    </section>
  );
}
