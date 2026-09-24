import { findContractById } from "../../../lib/Contracts";
import { fail, ok } from "../../../lib/Http";
import { userFromRequest } from "../../../lib/Jwt";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const caller = await userFromRequest(request);
  if (!caller) return fail("Please sign in.", 401);

  const contract = await findContractById(id);

  // A contract is readable only by its two parties, and a non-party is told
  // the same thing whether or not the contract exists
  if (!contract || (contract.clientId !== caller.sub && contract.devId !== caller.sub)) {
    return fail("You do not have access to that contract.", 403);
  }

  return ok({ contract, isClient: contract.clientId === caller.sub });
}
