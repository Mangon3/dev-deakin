import { resolveParty } from "../../../../lib/Access";
import { fail, ok } from "../../../../lib/Http";
import { setJobStatus } from "../../../../lib/Jobs";
import { userFromRequest } from "../../../../lib/Jwt";
import { declineOthers, setProposalStatus } from "../../../../lib/Proposals";
import { createContract } from "../../../../lib/Contracts";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const caller = await userFromRequest(request);
  const party = await resolveParty(id, caller?.sub ?? null);

  if (!party) return fail("You do not have access to that proposal.", 403);

  // Being a party is not enough: only the client may accept
  if (!party.isClient) {
    return fail("Only the client who posted the job can accept a proposal.", 403);
  }

  if (party.job.status !== "open") {
    return fail("That job already has an accepted proposal.", 409);
  }

  try {
    const contractId = await createContract({
      jobId: party.job.id,
      jobTitle: party.job.title,
      proposalId: party.proposal.id,
      clientId: party.job.clientId,
      clientName: party.job.clientName,
      devId: party.proposal.devId,
      devName: party.proposal.devName,
      agreedPrice: party.proposal.quote,
      timeline: party.proposal.timeline,
    });

    await setProposalStatus(party.proposal.id, "accepted");
    await declineOthers(party.job.id, party.proposal.id);
    await setJobStatus(party.job.id, "contracted");

    return ok({ contractId, message: "Proposal accepted." }, 201);
  } catch (error) {
    console.error("Could not accept proposal:", error);
    return fail("Could not accept that proposal. Please try again.", 500);
  }
}
