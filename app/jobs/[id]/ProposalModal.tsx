"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { z } from "zod";

import { Button, Field, inputStyles, panelStyles } from "../../components/Ui";
import { useAuth } from "../../context/AuthContext";
import { proposalSchema } from "../../lib/Validation";

type Errors = Record<string, string[] | undefined>;

export default function ProposalModal({
  jobId,
  onClose,
  onDone,
}: {
  jobId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const { authHeaders } = useAuth();
  const dialog = useRef<HTMLDivElement>(null);

  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");

  // Escape closes, and focus moves into the dialog when it opens
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    dialog.current?.querySelector("textarea")?.focus();

    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async (event: React.SyntheticEvent): Promise<void> => {
    event.preventDefault();

    const form = new FormData(event.target as HTMLFormElement);
    const parsed = proposalSchema.safeParse({
      jobId,
      note: form.get("note"),
      quote: form.get("quote"),
      timeline: form.get("timeline"),
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
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(parsed.data),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        setErrors(body?.fields ?? {});
        setMessage(body?.error ?? "Could not submit your proposal.");
        return;
      }

      onDone();
    } catch {
      setMessage("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  };

  // Rendered through a portal, so the dialog sits above the page rather than
  // inside the scrolling card it was opened from
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Dialog Placeholder"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
    >
      <div
        ref={dialog}
        onClick={(event) => event.stopPropagation()}
        className={`${panelStyles} w-full max-w-lg p-5`}
      >
        <div className="flex items-start justify-between mb-1">
          <h2 className="font-semibold">Dialog Heading</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-xl leading-none cursor-pointer hover:opacity-70"
          >
            &times;
          </button>
        </div>
        <p className="text-sm text-dim mb-5">
          Subtitle placeholder text.
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Field label="Label One" htmlFor="note" error={errors.note?.[0]}>
            <textarea
              id="note"
              name="note"
              rows={6}
              placeholder="Placeholder"
              className={`${inputStyles} resize-y`}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Label Two" htmlFor="quote" error={errors.quote?.[0]}>
              <input
                id="quote"
                name="quote"
                type="number"
                min={50}
                placeholder="Placeholder"
                className={`${inputStyles} num`}
              />
            </Field>

            <Field label="Label Three" htmlFor="timeline" error={errors.timeline?.[0]}>
              <input
                id="timeline"
                name="timeline"
                type="text"
                placeholder="Placeholder"
                className={inputStyles}
              />
            </Field>
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Pending..." : "Button Placeholder"}
          </Button>

          {message && (
            <p aria-live="polite" className="text-sm text-danger">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>,
    document.body
  );
}
