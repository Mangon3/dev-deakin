"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";

import { Button, Field, inputStyles, panelStyles } from "../../components/Ui";
import { useAuth } from "../../context/AuthContext";
import { jobSchema } from "../../lib/Validation";

type Errors = Record<string, string[] | undefined>;

export default function NewJobForm() {
  const { user, ready, authHeaders } = useAuth();
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.SyntheticEvent): Promise<void> => {
    event.preventDefault();

    const form = new FormData(event.target as HTMLFormElement);
    const parsed = jobSchema.safeParse({
      title: form.get("title"),
      description: form.get("description"),
      budget: form.get("budget"),
      deadline: form.get("deadline"),
      skills: form.get("skills"),
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
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setErrors(data?.fields ?? {});
        setMessage(data?.error ?? "Could not post your job.");
        return;
      }

      router.push(`/jobs/${data.id}`);
    } catch {
      setMessage("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  };

  // Posting requires a session, so visitors are sent to sign in instead
  if (ready && !user) {
    return (
      <div className={`${panelStyles} max-w-md mx-auto p-8 text-center`}>
        <p className="text-sm text-dim mb-5">
          Empty State Placeholder
        </p>
        <Link
          href="/login"
          className="inline-block px-4 py-2 text-sm font-semibold rounded-sm bg-accent text-accent-ink hover:bg-accent-hover"
        >
          Button Placeholder
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field label="Label One" htmlFor="title" error={errors.title?.[0]}>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Placeholder"
            className={inputStyles}
          />
        </Field>

        <Field
          label="Label Two"
          htmlFor="description"
          error={errors.description?.[0]}
        >
          <textarea
            id="description"
            name="description"
            rows={8}
            placeholder="Placeholder"
            className={`${inputStyles} resize-y`}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Label Three" htmlFor="budget" error={errors.budget?.[0]}>
            <input
              id="budget"
              name="budget"
              type="number"
              min={50}
              placeholder="Placeholder"
              className={`${inputStyles} num`}
            />
          </Field>

          <Field label="Label Four" htmlFor="deadline" error={errors.deadline?.[0]}>
            <input id="deadline" name="deadline" type="date" className={inputStyles} />
          </Field>
        </div>

        <Field
          label="Label Five"
          htmlFor="skills"
          error={errors.skills?.[0]}
        >
          <input
            id="skills"
            name="skills"
            type="text"
            placeholder="Placeholder"
            className={inputStyles}
          />
        </Field>

        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Pending..." : "Button Placeholder"}
          </Button>
        </div>

        {message && (
          <p aria-live="polite" className="text-sm text-danger">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
