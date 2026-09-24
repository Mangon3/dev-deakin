import { findContractById, setMilestoneState } from "../../../../lib/Contracts";
import { fail, ok, readJson } from "../../../../lib/Http";
import { userFromRequest } from "../../../../lib/Jwt";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const caller = await userFromRequest(request);
  if (!caller) return fail("Please sign in.", 401);

  const contract = await findContractById(id);
  if (!contract || (contract.clientId !== caller.sub && contract.devId !== caller.sub)) {
    return fail("You do not have access to that contract.", 403);
  }

  const body = (await readJson(request)) as { index?: number; state?: string } | null;
  const index = body?.index;
  const state = body?.state;

  if (typeof index !== "number" || !contract.milestones[index]) {
    return fail("That milestone does not exist.", 400);
  }

  // The two sides can take different actions on a milestone
  const isClient = contract.clientId === caller.sub;

  if (state === "delivered" && isClient) {
    return fail("Only the developer can mark work as delivered.", 403);
  }

  if (state === "approved" && !isClient) {
    return fail("Only the client can approve a milestone.", 403);
  }

  if (state !== "delivered" && state !== "approved") {
    return fail("That is not a valid milestone state.", 400);
  }

  try {
    const updated = await setMilestoneState(id, index, state);
    return ok({ contract: updated });
  } catch (error) {
    console.error("Could not update milestone:", error);
    return fail("Could not update that milestone.", 500);
  }
}
