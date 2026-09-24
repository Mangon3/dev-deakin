"use client";

import { useEffect, useRef, useState } from "react";

import { Button, panelStyles } from "./Ui";

type Turn = { role: "user" | "model"; text: string; tools?: string[] };

type Progress = { message: string; percent: number } | null;

const OPENERS = [
  "What jobs suit React?",
  "How do proposals work?",
  "Who can read my messages?",
];

// Seek panel section, mounted by both the floating assistant and the demo
export default function SeekPanel({
  endpoint,
  onClose,
}: {
  endpoint: string;
  onClose?: () => void;
}) {
  const [history, setHistory] = useState<Turn[]>([]);
  const [progress, setProgress] = useState<Progress>(null);
  const [tools, setTools] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  // Carries the plan from its event to the reply that follows
  const planRef = useRef<string[]>([]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [history.length, progress]);

  const ask = async (text: string): Promise<void> => {
    if (!text.trim() || busy) return;

    setHistory((current) => [...current, { role: "user", text }]);
    setProgress({ message: "Starting", percent: 5 });
    setTools([]);
    planRef.current = [];
    setError("");
    setBusy(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Transcript only, never a session token
        body: JSON.stringify({
          message: text,
          history: history.map(({ role, text: each }) => ({ role, text: each })),
        }),
      });

      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "Seek could not answer just now.");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // One event per line, so a partial chunk is held over
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;

          const event = JSON.parse(line);

          if (event.type === "progress") {
            setProgress({ message: event.message, percent: event.percent });
          } else if (event.type === "plan") {
            planRef.current = event.tools;
            setTools(event.tools);
          } else if (event.type === "reply") {
            setHistory((current) => [
              ...current,
              { role: "model", text: event.text, tools: planRef.current },
            ]);
          } else if (event.type === "error") {
            setError(event.message);
          }
        }
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setProgress(null);
      setBusy(false);
    }
  };

  const send = (event: React.SyntheticEvent): void => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const input = form.elements.namedItem("text") as HTMLInputElement;
    const text = input.value;

    input.value = "";
    ask(text);
  };

  return (
    <section
      aria-label="Seek assistant"
      className={`${panelStyles} flex flex-col h-full`}
    >
      <header className="flex items-center gap-2 px-4 py-3 border-b border-line">
        <span className="font-semibold">Seek</span>
        <span className="text-xs text-dim">Assistant</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-auto text-xl leading-none cursor-pointer hover:opacity-70"
          >
            &times;
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-4">
        {history.length === 0 && !busy && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-dim">
              Ask how DEV@Deakin works, or what jobs might suit you.
            </p>
            {OPENERS.map((opener) => (
              <button
                key={opener}
                type="button"
                onClick={() => ask(opener)}
                className="text-left text-sm px-3 py-2 rounded-sm border border-line hover:bg-surface-2 cursor-pointer"
              >
                {opener}
              </button>
            ))}
          </div>
        )}

        {history.map((turn, index) => (
          <div
            key={index}
            className={`max-w-[85%] ${turn.role === "user" ? "self-end" : "self-start"}`}
          >
            <p
              className={`px-3 py-2 text-sm rounded-sm border whitespace-pre-wrap ${
                turn.role === "user"
                  ? "bg-accent text-accent-ink border-transparent"
                  : "bg-surface-2 border-line"
              }`}
            >
              {turn.text}
            </p>
            {/* Which tools produced the answer, rather than hiding the work */}
            {turn.tools && turn.tools.length > 0 && (
              <p className="mt-1 text-xs text-dim">
                Used {turn.tools.join(" and ").replace(/_/g, " ")}
              </p>
            )}
          </div>
        ))}

        {/* Live view of the agent's steps */}
        {progress && (
          <div className="self-start w-full max-w-[85%]">
            <p className="text-sm text-dim mb-1.5">{progress.message}...</p>
            <div className="h-1 w-full bg-surface-2 rounded-sm overflow-hidden">
              <div
                className="h-full bg-accent transition-[width] duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            {tools.length > 0 && (
              <p className="mt-1.5 text-xs text-dim">
                Plan: {tools.join(", ").replace(/_/g, " ")}
              </p>
            )}
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 px-4 py-3 border-t border-line">
        <input
          name="text"
          type="text"
          autoComplete="off"
          maxLength={600}
          disabled={busy}
          placeholder="Ask Seek..."
          className="flex-1 px-2.5 py-2 text-sm bg-surface border border-line-strong rounded-sm disabled:opacity-50"
        />
        <Button type="submit" disabled={busy}>
          Send
        </Button>
      </form>
    </section>
  );
}
