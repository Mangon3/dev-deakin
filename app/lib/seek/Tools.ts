import { listJobs, type JobRecord } from "../Jobs";

// Both tools run server side and are handed public job data only

const MAX_RECOMMENDATIONS = 5;

export type ToolName = "general_enquiry" | "job_recommendation";

export type ToolArgs = {
  question?: string;
  skills?: string[];
  keywords?: string;
  minBudget?: number;
};

// The only platform facts Seek may state
const KNOWLEDGE: { topic: string; text: string }[] = [
  {
    topic: "account register signup signin login password user",
    text: "One DEV@Deakin account covers both sides: the same user can post jobs as a client and send proposals as a developer. Passwords are hashed before storage and a signed token keeps the session.",
  },
  {
    topic: "post posting job client budget deadline skills create",
    text: "A signed in user posts a job with a title, description, budget, required skills and a deadline, which cannot be in the past. The job stays open until the client accepts a proposal.",
  },
  {
    topic: "proposal propose bid apply quote timeline submit withdraw",
    text: "A developer sends one proposal per job containing a cover note, a quoted price and an estimated timeline. It can be withdrawn while the job is open. Clients cannot bid on their own jobs.",
  },
  {
    topic: "privacy private see visible hidden who read secure security",
    text: "A proposal is readable only by the developer who wrote it and the client who owns the job. The server decides this, so proposals a user may not read are never sent to their browser at all.",
  },
  {
    topic: "message messaging thread chat negotiate talk contact",
    text: "Every proposal has a private thread for negotiating terms. Only the job's client and that proposal's developer can read or post in it. Anyone else receives a 403.",
  },
  {
    topic: "contract milestone payment deliver approve complete accept",
    text: "Accepting a proposal creates a contract recording the agreed price and timeline, split into milestones. The developer marks a milestone delivered, the client approves it, and the contract completes when all are approved.",
  },
  {
    topic: "search browse filter find work jobs list",
    text: "The Find work page lists open jobs and filters by skill, by maximum budget, and by keywords matched against the title and description.",
  },
  {
    topic: "dashboard track status overview",
    text: "The dashboard shows both sides of an account: jobs you posted with their proposal counts, proposals you sent with their status, and any active contracts.",
  },
];

// Prefix match, so "milestones" still finds "milestone"
function related(word: string, topicWord: string): boolean {
  const shortest = Math.min(word.length, topicWord.length);

  if (shortest < 4) return word === topicWord;

  return word.slice(0, shortest) === topicWord.slice(0, shortest);
}

export function generalEnquiry(question: string) {
  const words = question
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((word) => word.length > 3);

  const matches = KNOWLEDGE.map((entry) => {
    const topicWords = entry.topic.split(" ");

    return {
      entry,
      score: words.filter((word) =>
        topicWords.some((topicWord) => related(word, topicWord))
      ).length,
    };
  })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((match) => match.entry.text);

  return { knowledge: matches };
}

// Scored, not filtered, so a multi-skill request still returns close matches
function score(job: JobRecord, args: ToolArgs) {
  const skills = (args.skills ?? []).map((skill) => skill.toLowerCase());
  const keywords = (args.keywords ?? "").toLowerCase().trim();
  const jobSkills = job.skills.map((skill) => skill.toLowerCase());
  const haystack = `${job.title} ${job.description}`.toLowerCase();

  const matched = skills.filter((skill) =>
    jobSkills.some((each) => each.includes(skill) || skill.includes(each))
  );

  let total = matched.length * 2;
  if (keywords && haystack.includes(keywords)) total += 1;
  if (!skills.length && !keywords) total += 1;

  return { total, matched };
}

export async function jobRecommendation(args: ToolArgs) {
  const jobs = await listJobs();

  const results = jobs
    .filter((job) => job.status === "open")
    .filter((job) => !args.minBudget || job.budget >= args.minBudget)
    .map((job) => ({ job, ...score(job, args) }))
    .filter((entry) => entry.total > 0)
    .sort((a, b) => b.total - a.total || b.job.budget - a.job.budget)
    .slice(0, MAX_RECOMMENDATIONS)
    .map(({ job, matched }) => ({
      // Public fields only
      id: job.id,
      title: job.title,
      budget: job.budget,
      deadline: job.deadline,
      skills: job.skills,
      matchedSkills: matched,
      summary: job.description.slice(0, 200),
    }));

  return { jobs: results, totalOpen: jobs.filter((j) => j.status === "open").length };
}

export async function runTool(name: ToolName, args: ToolArgs) {
  if (name === "general_enquiry") return generalEnquiry(args.question ?? "");
  if (name === "job_recommendation") return jobRecommendation(args);

  return { error: "Unknown tool." };
}

export const TOOL_LABELS: Record<ToolName, string> = {
  general_enquiry: "Looking up how DEV@Deakin works",
  job_recommendation: "Searching open jobs",
};
