import { fail, fieldErrors, ok, readJson } from "../../lib/Http";
import { findJobById, incrementProposalCount } from "../../lib/Jobs";
import { userFromRequest } from "../../lib/Jwt";
import { createProposal, findProposalByDev } from "../../lib/Proposals";
import { proposalSchema } from "../../lib/Validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const caller = await userFromRequest(request);
  if (!caller) return fail("Please sign in to submit a proposal.", 401);

  const body = await readJson(request);
  if (body === null) return fail("Request body must be valid JSON.", 400);

  const parsed = proposalSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Please check the details you entered.", 400, fieldErrors(parsed.error));
  }

  const { jobId, note, quote, timeline } = parsed.data;

  try {
    const job = await findJobById(jobId);
    if (!job) return fail("That job does not exist.", 404);

    if (job.status !== "open") {
      return fail("That job is no longer accepting proposals.", 409);
    }

    // A client cannot bid on their own job
    if (job.clientId === caller.sub) {
      return fail("You cannot submit a proposal to your own job.", 403);
    }

    if (await findProposalByDev(jobId, caller.sub)) {
      return fail("You have already submitted a proposal to this job.", 409);
    }

    const id = await createProposal({
      jobId,
      devId: caller.sub,
      devName: caller.name,
      note,
      quote,
      timeline,
    });

    await incrementProposalCount(jobId);

    return ok({ id, message: "Proposal submitted." }, 201);
  } catch (error) {
    console.error("Could not submit proposal:", error);
    return fail("Could not submit your proposal. Please try again.", 500);
  }
}
