import { listContractsForUser } from "../../lib/Contracts";
import { fail, ok } from "../../lib/Http";
import { listJobsByClient } from "../../lib/Jobs";
import { userFromRequest } from "../../lib/Jwt";
import { listProposalsByDev } from "../../lib/Proposals";

export const runtime = "nodejs";

// Everything here is scoped to the caller by their token, never by an id
// supplied in the request
export async function GET(request: Request) {
  const caller = await userFromRequest(request);
  if (!caller) return fail("Please sign in.", 401);

  try {
    const [jobs, proposals, contracts] = await Promise.all([
      listJobsByClient(caller.sub),
      listProposalsByDev(caller.sub),
      listContractsForUser(caller.sub),
    ]);

    return ok({ jobs, proposals, contracts });
  } catch (error) {
    console.error("Could not load dashboard:", error);
    return fail("Could not load your dashboard.", 500);
  }
}
