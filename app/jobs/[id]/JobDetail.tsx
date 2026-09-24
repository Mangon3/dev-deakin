"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Button,
  Chip,
  money,
  Notice,
  panelStyles,
  sinceLabel,
  Status,
} from "../../components/Ui";
import { useAuth } from "../../context/AuthContext";
import type { JobRecord } from "../../lib/Jobs";
import type { ProposalRecord } from "../../lib/Proposals";
import ProposalModal from "./ProposalModal";

type Payload = {
  job: JobRecord;
  proposals: ProposalRecord[];
  proposalCount: number;
  viewer: { id: string; isClient: boolean } | null;
};

export default function JobDetail({ jobId }: { jobId: string }) {
  const { user, ready, authHeaders } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [accepting, setAccepting] = useState("");

  // Refetches when the session changes, because the backend returns a
  // different set of proposals depending on who is asking
  useEffect(() => {
    if (!ready) return;

    let active = true;

    fetch(`/api/jobs/${jobId}`, { headers: authHeaders() })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!active) return;

        if (!response.ok) {
          setError(body?.error ?? "Could not load that job.");
          return;
        }

        setData(body);
        setError("");
      })
      .catch(() => active && setError("Could not reach the server."));

    return () => {
      active = false;
    };
  }, [jobId, ready, authHeaders]);

  const accept = async (proposalId: string): Promise<void> => {
    setAccepting(proposalId);

    try {
      const response = await fetch(`/api/proposals/${proposalId}/accept`, {
        method: "POST",
        headers: authHeaders(),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        setError(body?.error ?? "Could not accept that proposal.");
        return;
      }

      router.push(`/contracts/${body.contractId}`);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setAccepting("");
    }
  };

  if (error) {
    return <p className={`${panelStyles} p-8 text-center text-sm text-danger`}>{error}</p>;
  }

  if (!data) {
    return <p className="py-12 text-center text-sm text-dim">Loading...</p>;
  }

  const { job, proposals, proposalCount, viewer } = data;
  const mine = proposals.find((p) => p.devId === viewer?.id);
  const canPropose = user && !viewer?.isClient && !mine && job.status === "open";

  return (
    <>
      <Link href="/jobs" className="inline-block mb-3.5 text-sm text-link hover:underline">
        &larr; Link Placeholder
      </Link>

      <div className="mb-4">
        <Notice title="Notice Placeholder.">
          {viewer?.isClient
            ? "Notice body placeholder, variant one."
            : user
              ? "Notice body placeholder, variant two."
              : "Notice body placeholder, variant three."}
        </Notice>
      </div>

      <article className={`${panelStyles} p-5 mb-4`}>
        <h1 className="text-xl font-semibold mb-1.5">{job.title}</h1>
        <p className="text-sm text-dim">
          Caption placeholder &middot; {sinceLabel(job.createdAt)}
        </p>

        <p className="text-sm my-4 whitespace-pre-wrap">{job.description}</p>

        <div className="flex flex-wrap gap-6 pt-3.5 border-t border-line">
          <div>
            <p className="text-xs uppercase tracking-wider text-dim">Fact One</p>
            <p className="num font-semibold">{money(job.budget)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-dim">Fact Two</p>
            <p className="font-semibold">{job.deadline}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-dim">Fact Three</p>
            <p><Status state={job.status} /></p>
          </div>
          <div className="min-w-40">
            <p className="text-xs uppercase tracking-wider text-dim mb-1">Fact Four</p>
            <span className="flex flex-wrap gap-1.5">
              {job.skills.map((each) => <Chip key={each}>{each}</Chip>)}
            </span>
          </div>
        </div>
      </article>

      <div className="flex items-baseline gap-2.5 mb-2.5">
        <h2 className="text-base font-semibold">Section Heading</h2>
        <span className="text-sm text-dim num">
          {proposalCount} items
          {!viewer?.isClient && proposalCount > 0 && ", caption placeholder"}
        </span>
        {canPropose && (
          <Button className="ml-auto" onClick={() => setShowModal(true)}>
            Button Placeholder
          </Button>
        )}
      </div>

      {proposals.length === 0 ? (
        <p className={`${panelStyles} border-dashed p-7 text-center text-sm text-dim`}>
          {proposalCount === 0
            ? "Empty State Placeholder One"
            : user
              ? "Empty State Placeholder Two"
              : "Empty State Placeholder Three"}
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {proposals.map((proposal) => (
            <li key={proposal.id} className={`${panelStyles} p-4`}>
              <div className="flex flex-wrap items-baseline gap-3 mb-2">
                <span className="font-semibold">{proposal.devName}</span>
                <Status state={proposal.status} />
                <span className="num ml-auto font-semibold">
                  {money(proposal.quote)} &middot; {proposal.timeline}
                </span>
              </div>

              <p className="text-sm text-dim mb-3 whitespace-pre-wrap">
                {proposal.note}
              </p>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/threads/${proposal.id}`}
                  className="px-3 py-1.5 text-sm font-semibold rounded-sm border border-line-strong hover:bg-surface-2"
                >
                  Link Placeholder
                </Link>

                {viewer?.isClient && job.status === "open" && proposal.status === "pending" && (
                  <Button
                    onClick={() => accept(proposal.id)}
                    disabled={accepting === proposal.id}
                    className="px-3 py-1.5"
                  >
                    {accepting === proposal.id ? "Pending..." : "Button Placeholder"}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <ProposalModal
          jobId={job.id}
          onClose={() => setShowModal(false)}
          onDone={() => {
            setShowModal(false);
            router.refresh();
            location.reload();
          }}
        />
      )}
    </>
  );
}
