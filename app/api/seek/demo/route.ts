import { fail, fieldErrors, readJson } from "../../../lib/Http";
import { generalEnquiry, jobRecommendation } from "../../../lib/seek/Tools";
import { money } from "../../../components/Ui";
import { seekSchema } from "../../../lib/Validation";

export const runtime = "nodejs";

// Needs no model or API key. Same steps, same events and the same two tools
// against real data, with only the planning and wording scripted.

const PAUSE = 450;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const JOB_WORDS = /\b(job|jobs|work|gig|hire|hiring|budget|pay|paid|react|node|test|design|available|suit|recommend)\b/i;
const HELP_WORDS = /\b(how|what|who|why|can|does|proposal|message|thread|contract|milestone|privacy|private|account|post|dashboard)\b/i;

// Mirrors the planning step, using rules rather than the model
function plan(message: string): { intent: string; tools: string[] } {
  const jobs = JOB_WORDS.test(message);
  const help = HELP_WORDS.test(message);

  if (jobs && help) {
    return { intent: "BOTH", tools: ["general_enquiry", "job_recommendation"] };
  }
  if (jobs) return { intent: "JOB_SEARCH", tools: ["job_recommendation"] };
  if (help) return { intent: "ENQUIRY", tools: ["general_enquiry"] };

  return { intent: "GENERAL_CHAT", tools: [] };
}

function skillsFrom(message: string): string[] {
  const known = ["React", "TypeScript", "Node", "Testing", "Accessibility", "Design", "Postgres", "Serverless", "Playwright"];

  return known.filter((skill) => message.toLowerCase().includes(skill.toLowerCase()));
}

export async function POST(request: Request) {
  const body = await readJson(request);
  if (body === null) return fail("Request body must be valid JSON.", 400);

  const parsed = seekSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Please check your message.", 400, fieldErrors(parsed.error));
  }

  const message = parsed.data.message;
  const chosen = plan(message);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: unknown) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

      try {
        send({ type: "progress", step: "plan", message: "Reading your question", percent: 15 });
        await wait(PAUSE);
        send({ type: "plan", intent: chosen.intent, tools: chosen.tools });

        if (chosen.tools.length === 0) {
          send({ type: "progress", step: "reply", message: "Writing a reply", percent: 70 });
          await wait(PAUSE);
          send({ type: "progress", step: "done", message: "Done", percent: 100 });
          send({
            type: "reply",
            text: "I am Seek, the assistant for DEV@Deakin. I can explain how the platform works, or find open jobs that suit your skills. What would you like?",
          });
          return;
        }

        const parts: string[] = [];

        if (chosen.tools.includes("general_enquiry")) {
          send({ type: "progress", step: "general_enquiry", message: "Looking up how DEV@Deakin works", percent: 35 });
          await wait(PAUSE);

          const { knowledge } = generalEnquiry(message);

          parts.push(
            knowledge.length > 0
              ? knowledge[0]
              : "I could not find anything on that. I can help with accounts, posting jobs, proposals, privacy, messaging, contracts and the dashboard."
          );
        }

        if (chosen.tools.includes("job_recommendation")) {
          send({ type: "progress", step: "job_recommendation", message: "Searching open jobs", percent: 60 });
          await wait(PAUSE);

          const skills = skillsFrom(message);
          const { jobs, totalOpen } = await jobRecommendation({ skills });

          if (jobs.length === 0) {
            parts.push(
              totalOpen === 0
                ? "There are no open jobs on DEV@Deakin right now."
                : "Nothing open matches that at the moment. Try widening the skills."
            );
          } else {
            const lines = jobs.map((job) => {
              const why = job.matchedSkills.length
                ? `matches ${job.matchedSkills.join(" and ")}`
                : "currently open";

              return `- ${job.title} (${money(job.budget)}), ${why}.`;
            });

            parts.push(
              `Here ${jobs.length === 1 ? "is" : "are"} ${jobs.length} of the ${totalOpen} open jobs:\n${lines.join("\n")}\n\nOpen any job to read the full description.`
            );
          }
        }

        send({ type: "progress", step: "synthesise", message: "Writing an answer", percent: 85 });
        await wait(PAUSE);
        send({ type: "progress", step: "done", message: "Done", percent: 100 });
        send({ type: "reply", text: parts.join("\n\n") });
      } catch (error) {
        console.error("Seek demo failed:", error);
        send({ type: "error", message: "The demo could not run just now." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
