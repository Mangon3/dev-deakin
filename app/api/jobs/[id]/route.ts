import { filterProposals } from "../../../lib/Access";
import { fail, ok } from "../../../lib/Http";
import { findJobById } from "../../../lib/Jobs";
import { userFromRequest } from "../../../lib/Jwt";
import { listProposalsForJob } from "../../../lib/Proposals";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const caller = await userFromRequest(request);

  try {
    const job = await findJobById(id);
    if (!job) return fail("That job does not exist.", 404);

    const all = await listProposalsForJob(id);

    // The count is public, the contents are not. Proposals the caller may not
    // read are removed here, so they are never serialised into the response.
    const visible = filterProposals(job, all, caller?.sub ?? null);

    return ok({
      job,
      proposals: visible,
      proposalCount: all.length,
      viewer: caller ? { id: caller.sub, isClient: job.clientId === caller.sub } : null,
    });
  } catch (error) {
    console.error("Could not load job:", error);
    return fail("Could not load that job.", 500);
  }
}
