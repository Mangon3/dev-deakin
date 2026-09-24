"use client";

import { useTheme, type Theme } from "../context/ThemeContext";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "system", label: "Auto" },
  { value: "dark", label: "Dark" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className="flex border border-line-strong"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setTheme(option.value)}
          aria-pressed={theme === option.value}
          className={`px-2.5 py-1 text-xs border-r border-line-strong last:border-r-0 cursor-pointer ${
            theme === option.value
              ? "bg-ink text-surface font-semibold"
              : "text-dim hover:text-ink hover:bg-surface-2"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
