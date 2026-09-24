"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button, money, Notice, panelStyles, Status } from "../../components/Ui";
import { useAuth } from "../../context/AuthContext";
import type { ContractRecord } from "../../lib/Contracts";

export default function Contract({ contractId }: { contractId: string }) {
  const { ready, authHeaders } = useAuth();

  const [contract, setContract] = useState<ContractRecord | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(-1);

  useEffect(() => {
    if (!ready) return;

    let active = true;

    fetch(`/api/contracts/${contractId}`, { headers: authHeaders() })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!active) return;

        if (!response.ok) {
          setError(body?.error ?? "Could not load that contract.");
          return;
        }

        setContract(body.contract);
        setIsClient(body.isClient);
        setError("");
      })
      .catch(() => active && setError("Could not reach the server."));

    return () => {
      active = false;
    };
  }, [contractId, ready, authHeaders]);

  const update = async (index: number, state: string): Promise<void> => {
    setBusy(index);

    try {
      const response = await fetch(`/api/contracts/${contractId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ index, state }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        setError(body?.error ?? "Could not update that milestone.");
        return;
      }

      setContract(body.contract);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(-1);
    }
  };

  if (error) {
    return (
      <div className={`${panelStyles} p-8 text-center`}>
        <p className="text-sm text-danger mb-4">{error}</p>
        <Link href="/dashboard" className="text-sm text-link hover:underline">
          Link Placeholder
        </Link>
      </div>
    );
  }

  if (!contract) {
    return <p className="py-12 text-center text-sm text-dim">Loading...</p>;
  }

  const approved = contract.milestones
    .filter((m) => m.state === "approved")
    .reduce((total, m) => total + m.fee, 0);

  return (
    <>
      <Link href="/dashboard" className="inline-block mb-3.5 text-sm text-link hover:underline">
        &larr; Link Placeholder
      </Link>

      <div className="mb-4">
        <Notice title="Notice Placeholder.">
          Notice body placeholder, viewing as{" "}
          {isClient ? "role one" : "role two"}.
        </Notice>
      </div>

      <article className={`${panelStyles} p-5 mb-4`}>
        <div className="flex flex-wrap items-baseline gap-3 mb-1.5">
          <h1 className="text-xl font-semibold">{contract.jobTitle}</h1>
          <Status state={contract.status} />
        </div>
        <p className="text-sm text-dim">
          {contract.clientName} and {contract.devName} &middot;{" "}
          <span className="num">{money(contract.agreedPrice)}</span> over{" "}
          {contract.timeline}
        </p>

        <div className="flex flex-wrap gap-6 mt-4 pt-3.5 border-t border-line">
          <div>
            <p className="text-xs uppercase tracking-wider text-dim">Fact One</p>
            <p className="num font-semibold">{money(approved)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-dim">Fact Two</p>
            <p className="num font-semibold">{money(contract.agreedPrice - approved)}</p>
          </div>
        </div>
      </article>

      <h2 className="text-base font-semibold mb-2.5">Section Heading</h2>

      <ul className={panelStyles}>
        {contract.milestones.map((milestone, index) => (
          <li
            key={milestone.name}
            className="flex flex-wrap items-center gap-3 px-4 py-3.5 border-b border-line last:border-b-0"
          >
            <span className="font-semibold">{milestone.name}</span>
            <Status state={milestone.state} />
            <span className="num ml-auto font-semibold">{money(milestone.fee)}</span>

            {!isClient && milestone.state === "open" && (
              <Button
                variant="secondary"
                className="px-3 py-1.5"
                disabled={busy === index}
                onClick={() => update(index, "delivered")}
              >
                Button Placeholder One
              </Button>
            )}

            {isClient && milestone.state === "delivered" && (
              <Button
                className="px-3 py-1.5"
                disabled={busy === index}
                onClick={() => update(index, "approved")}
              >
                Button Placeholder Two
              </Button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
