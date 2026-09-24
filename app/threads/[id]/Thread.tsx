"use client";

import Link from "next/link";
import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";

import { Button, money, Notice, panelStyles } from "../../components/Ui";
import { useAuth } from "../../context/AuthContext";
import type { JobRecord } from "../../lib/Jobs";
import type { MessageRecord } from "../../lib/Messages";
import type { ProposalRecord } from "../../lib/Proposals";

type Payload = {
  messages: MessageRecord[];
  proposal: ProposalRecord;
  job: JobRecord;
  isClient: boolean;
};

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleString("en-AU", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Thread({ proposalId }: { proposalId: string }) {
  const { user, ready, authHeaders } = useAuth();

  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  const messages = data?.messages ?? [];

  // A sent message is shown immediately, marked pending, and replaced by the
  // stored message once the server confirms it
  const [shown, addOptimistic] = useOptimistic(
    messages,
    (current: MessageRecord[], text: string) => [
      ...current,
      {
        id: `pending-${current.length}`,
        proposalId,
        fromId: user?.id ?? "",
        fromName: user?.name ?? "",
        text,
        createdAt: "",
      },
    ]
  );

  useEffect(() => {
    if (!ready) return;

    let active = true;

    const load = () =>
      fetch(`/api/proposals/${proposalId}/messages`, { headers: authHeaders() })
        .then(async (response) => {
          const body = await response.json().catch(() => null);
          if (!active) return;

          if (!response.ok) {
            setError(body?.error ?? "You do not have access to that thread.");
            return;
          }

          setData(body);
          setError("");
        })
        .catch(() => active && setError("Could not reach the server."));

    load();

    // Polled so a reply from the other party appears without a refresh
    const timer = setInterval(load, 5000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [proposalId, ready, authHeaders]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [shown.length]);

  const send = async (event: React.SyntheticEvent): Promise<void> => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const input = form.elements.namedItem("text") as HTMLInputElement;
    const text = input.value.trim();

    if (!text) return;

    input.value = "";

    startTransition(async () => {
      addOptimistic(text);

      try {
        const response = await fetch(`/api/proposals/${proposalId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ text }),
        });

        const body = await response.json().catch(() => null);

        if (!response.ok) {
          setError(body?.error ?? "Could not send that message.");
          return;
        }

        setData((current) =>
          current ? { ...current, messages: [...current.messages, body.message] } : current
        );
      } catch {
        setError("Could not reach the server.");
      }
    });
  };

  if (error) {
    return (
      <div className={`${panelStyles} p-8 text-center`}>
        <p className="text-sm text-danger mb-4">{error}</p>
        <Link href="/jobs" className="text-sm text-link hover:underline">
          Link Placeholder
        </Link>
      </div>
    );
  }

  if (!data) {
    return <p className="py-12 text-center text-sm text-dim">Loading...</p>;
  }

  const other = data.isClient ? data.proposal.devName : data.job.clientName;

  return (
    <>
      <Link
        href={`/jobs/${data.job.id}`}
        className="inline-block mb-3.5 text-sm text-link hover:underline"
      >
        &larr; Link Placeholder
      </Link>

      <div className="mb-4">
        <Notice title="Notice Placeholder.">
          Notice body placeholder text.
        </Notice>
      </div>

      <section className={panelStyles}>
        <header className="flex flex-wrap items-baseline gap-2.5 px-4 py-3 border-b border-line">
          <span className="font-semibold">{other}</span>
          <span className="text-sm text-dim truncate">{data.job.title}</span>
          <span className="num ml-auto text-sm text-dim">
            {money(data.proposal.quote)} &middot; {data.proposal.timeline}
          </span>
        </header>

        <div className="flex flex-col gap-3 p-4 min-h-60 max-h-[26rem] overflow-y-auto">
          {shown.length === 0 && (
            <p className="text-sm text-dim m-auto">
              Empty State Placeholder
            </p>
          )}

          {shown.map((message) => {
            const mine = message.fromId === user?.id;
            const sending = message.createdAt === "";

            return (
              <div
                key={message.id}
                className={`max-w-[78%] ${mine ? "self-end" : "self-start"}`}
              >
                <p
                  className={`px-3 py-2 text-sm rounded-sm border whitespace-pre-wrap ${
                    mine
                      ? "bg-accent text-accent-ink border-transparent"
                      : "bg-surface-2 border-line"
                  } ${sending ? "opacity-55" : ""}`}
                >
                  {message.text}
                </p>
                <p
                  className={`text-xs text-dim mt-1 ${
                    mine ? "text-right" : ""
                  }`}
                >
                  {sending ? "Pending..." : timeLabel(message.createdAt)}
                </p>
              </div>
            );
          })}

          <div ref={endRef} />
        </div>

        <form onSubmit={send} className="flex gap-2 px-4 py-3 border-t border-line">
          <input
            name="text"
            type="text"
            autoComplete="off"
            placeholder="Placeholder"
            className="flex-1 px-2.5 py-2 text-sm bg-surface border border-line-strong rounded-sm"
          />
          <Button type="submit">Button Placeholder</Button>
        </form>
      </section>
    </>
  );
}
