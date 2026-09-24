import { fail, fieldErrors, ok, readJson } from "../../lib/Http";
import { createJob, listJobs } from "../../lib/Jobs";
import { userFromRequest } from "../../lib/Jwt";
import { jobSchema, splitSkills } from "../../lib/Validation";

export const runtime = "nodejs";

// Job listings are public, so a visitor can browse before signing up
export async function GET() {
  try {
    return ok({ jobs: await listJobs() });
  } catch (error) {
    console.error("Could not load jobs:", error);
    return fail("Could not load jobs.", 500);
  }
}

export async function POST(request: Request) {
  const caller = await userFromRequest(request);
  if (!caller) return fail("Please sign in to post a job.", 401);

  const body = await readJson(request);
  if (body === null) return fail("Request body must be valid JSON.", 400);

  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Please check the details you entered.", 400, fieldErrors(parsed.error));
  }

  try {
    const id = await createJob({
      ...parsed.data,
      skills: splitSkills(parsed.data.skills),
      clientId: caller.sub,
      clientName: caller.name,
    });

    return ok({ id, message: "Job posted." }, 201);
  } catch (error) {
    console.error("Could not create job:", error);
    return fail("Could not post your job. Please try again.", 500);
  }
}
