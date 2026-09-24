import { resolveParty } from "../../../../lib/Access";
import { fail, fieldErrors, ok, readJson } from "../../../../lib/Http";
import { userFromRequest } from "../../../../lib/Jwt";
import { createMessage, listMessages } from "../../../../lib/Messages";
import { messageSchema } from "../../../../lib/Validation";

export const runtime = "nodejs";

// A thread belongs to exactly two people. resolveParty returns null for anyone
// else, and for a proposal that does not exist, so the two cases are
// indistinguishable to a caller probing for valid ids.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const caller = await userFromRequest(request);
  const party = await resolveParty(id, caller?.sub ?? null);

  if (!party) return fail("You do not have access to that thread.", 403);

  try {
    return ok({
      messages: await listMessages(id),
      proposal: party.proposal,
      job: party.job,
      isClient: party.isClient,
    });
  } catch (error) {
    console.error("Could not load messages:", error);
    return fail("Could not load that thread.", 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const caller = await userFromRequest(request);
  const party = await resolveParty(id, caller?.sub ?? null);

  if (!party || !caller) return fail("You do not have access to that thread.", 403);

  const body = await readJson(request);
  if (body === null) return fail("Request body must be valid JSON.", 400);

  const parsed = messageSchema.safeParse({ ...(body as object), proposalId: id });
  if (!parsed.success) {
    return fail("Please write a message.", 400, fieldErrors(parsed.error));
  }

  try {
    const message = await createMessage({
      proposalId: id,
      fromId: caller.sub,
      fromName: caller.name,
      text: parsed.data.text,
    });

    return ok({ message }, 201);
  } catch (error) {
    console.error("Could not send message:", error);
    return fail("Could not send your message. Please try again.", 500);
  }
}
