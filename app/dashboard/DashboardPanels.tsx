"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { money, panelStyles, Status } from "../components/Ui";
import { useAuth } from "../context/AuthContext";
import type { ContractRecord } from "../lib/Contracts";
import type { JobRecord } from "../lib/Jobs";
import type { ProposalRecord } from "../lib/Proposals";

type Payload = {
  jobs: JobRecord[];
  proposals: ProposalRecord[];
  contracts: ContractRecord[];
};

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={`${panelStyles} p-4`}>
      <h2 className="text-xs uppercase tracking-wider text-dim mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-dim py-3">{children}</p>;
}

export default function DashboardPanels() {
  const { user, ready, authHeaders } = useAuth();

  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready || !user) return;

    let active = true;

    fetch("/api/dashboard", { headers: authHeaders() })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!active) return;

        if (!response.ok) {
          setError(body?.error ?? "Could not load your dashboard.");
          return;
        }

        setData(body);
        setError("");
      })
      .catch(() => active && setError("Could not reach the server."));

    return () => {
      active = false;
    };
  }, [ready, user, authHeaders]);

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

  if (error) {
    return <p className={`${panelStyles} p-8 text-center text-sm text-danger`}>{error}</p>;
  }

  if (!data) {
    return <p className="py-12 text-center text-sm text-dim">Loading...</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Panel One">
          {data.jobs.length === 0 ? (
            <Empty>
              Empty state placeholder{" "}
              <Link href="/jobs/new" className="text-link hover:underline">
                Link Placeholder
              </Link>
              .
            </Empty>
          ) : (
            <ul>
              {data.jobs.map((job) => (
                <li
                  key={job.id}
                  className="flex items-baseline gap-2.5 py-2.5 border-b border-line last:border-b-0"
                >
                  <Link href={`/jobs/${job.id}`} className="text-sm text-link hover:underline truncate">
                    {job.title}
                  </Link>
                  <span className="num ml-auto text-sm text-dim whitespace-nowrap">
                    {job.proposalCount} items
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Panel Two">
          {data.proposals.length === 0 ? (
            <Empty>Empty State Placeholder</Empty>
          ) : (
            <ul>
              {data.proposals.map((proposal) => (
                <li
                  key={proposal.id}
                  className="flex items-baseline gap-2.5 py-2.5 border-b border-line last:border-b-0"
                >
                  <Link
                    href={`/threads/${proposal.id}`}
                    className="text-sm text-link hover:underline truncate"
                  >
                    {money(proposal.quote)} &middot; {proposal.timeline}
                  </Link>
                  <span className="ml-auto">
                    <Status state={proposal.status} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Panel Three">
          {data.contracts.length === 0 ? (
            <Empty>Empty State Placeholder</Empty>
          ) : (
            <ul>
              {data.contracts.map((contract) => {
                const done = contract.milestones.filter((m) => m.state === "approved").length;

                return (
                  <li
                    key={contract.id}
                    className="flex items-baseline gap-2.5 py-2.5 border-b border-line last:border-b-0"
                  >
                    <Link
                      href={`/contracts/${contract.id}`}
                      className="text-sm text-link hover:underline truncate"
                    >
                      {contract.jobTitle}
                    </Link>
                    <span className="num ml-auto text-sm text-dim whitespace-nowrap">
                      {done} of {contract.milestones.length} items
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Panel Four">
          <div className="flex items-baseline gap-2.5 py-2.5 border-b border-line">
            <span className="text-sm">Label One</span>
            <span className="ml-auto text-sm text-dim">{user?.name}</span>
          </div>
          <div className="flex items-baseline gap-2.5 py-2.5">
            <span className="text-sm">Label Two</span>
            <span className="ml-auto text-sm text-dim">{user?.email}</span>
          </div>
        </Panel>
    </div>
  );
}
