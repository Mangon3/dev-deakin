"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { signUpSchema } from "../lib/Validation";

const fields = [
  { name: "name", label: "Name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
  },
  {
    name: "confirmPassword",
    label: "Confirm password",
    type: "password",
    autoComplete: "new-password",
  },
] as const;

type Errors = Record<string, string[] | undefined>;

export default function SignUpForm() {
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.SyntheticEvent): Promise<void> => {
    event.preventDefault();

    const form = new FormData(event.target as HTMLFormElement);
    const parsed = signUpSchema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      confirmPassword: form.get("confirmPassword"),
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setErrors(data?.fields ?? {});
        setMessage(data?.error || "Could not create your account.");
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setMessage("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="w-full max-w-lg border border-zinc-200 dark:border-zinc-800 rounded-xl p-8">
      <h1 className="text-xl font-bold text-center text-teal-600 dark:text-teal-400 mb-8">
        Create a DEV@Deakin Account
      </h1>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm mb-1">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              className="w-full px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-teal-500 transition-colors"
            />
            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-500">
                {errors[field.name]?.[0]}
              </p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={pending}
          className="w-full mt-2 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {pending ? "Creating account..." : "Create account"}
        </button>

        {message && (
          <p aria-live="polite" className="text-sm text-red-500">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
