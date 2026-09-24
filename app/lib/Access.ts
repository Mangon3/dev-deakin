import { findJobById, type JobRecord } from "./Jobs";
import { findProposalById, type ProposalRecord } from "./Proposals";

// The access rules of the application, kept in one file so they can be read
// and audited together rather than being scattered through the route handlers.
//
//   1. A proposal is readable by its author and by the owner of the job.
//   2. A message thread is readable and writable only by those same two people.
//   3. Only the job owner may accept a proposal.
//
// Every rule is evaluated against the identity in the request's signed token,
// never against anything the client sends in the body or query string.

export type Party = {
  job: JobRecord;
  proposal: ProposalRecord;
  isClient: boolean;
  isDeveloper: boolean;
};

export function canReadProposal(
  job: JobRecord,
  proposal: ProposalRecord,
  userId: string | null
): boolean {
  if (!userId) return false;

  return proposal.devId === userId || job.clientId === userId;
}

// Resolves a proposal together with the caller's relationship to it. Returns
// null when the proposal does not exist or the caller is not a party to it, so
// callers cannot tell those two cases apart.
export async function resolveParty(
  proposalId: string,
  userId: string | null
): Promise<Party | null> {
  if (!userId) return null;

  const proposal = await findProposalById(proposalId);
  if (!proposal) return null;

  const job = await findJobById(proposal.jobId);
  if (!job) return null;

  if (!canReadProposal(job, proposal, userId)) return null;

  return {
    job,
    proposal,
    isClient: job.clientId === userId,
    isDeveloper: proposal.devId === userId,
  };
}

// What a given viewer is allowed to see of a job's proposals
export function filterProposals(
  job: JobRecord,
  proposals: ProposalRecord[],
  userId: string | null
): ProposalRecord[] {
  if (!userId) return [];
  if (job.clientId === userId) return proposals;

  return proposals.filter((p) => p.devId === userId);
}
