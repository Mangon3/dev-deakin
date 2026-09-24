import { GoogleGenAI } from "@google/genai";

import { PERSONA, PLANNING, SYNTHESIS } from "./Prompts";
import { runTool, TOOL_LABELS, type ToolArgs, type ToolName } from "./Tools";

// Three steps: plan, run the chosen tools, write the answer. Each emits progress.

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const HISTORY_FOR_PLANNING = 6;

export type SeekTurn = { role: "user" | "model"; text: string };

export type SeekEvent =
  | { type: "progress"; step: string; message: string; percent: number }
  | { type: "plan"; intent: string; tools: string[] }
  | { type: "reply"; text: string }
  | { type: "error"; message: string };

type Plan = {
  intent: string;
  tools: ToolName[];
  args: ToolArgs;
};

const VALID_TOOLS: ToolName[] = ["general_enquiry", "job_recommendation"];

function client(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");

  return new GoogleGenAI({ apiKey });
}

function historyBlock(history: SeekTurn[]): string {
  const recent = history.slice(-HISTORY_FOR_PLANNING);

  if (recent.length === 0) return "(nothing yet)";

  return recent
    .map((turn) => `${turn.role === "user" ? "User" : "Seek"}: ${turn.text}`)
    .join("\n");
}

// Models sometimes wrap JSON in fences anyway
function parsePlan(raw: string): Plan {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as Partial<Plan>;

    return {
      intent: typeof parsed.intent === "string" ? parsed.intent : "UNKNOWN",
      // An invented tool name is discarded
      tools: Array.isArray(parsed.tools)
        ? (parsed.tools.filter((tool) =>
            VALID_TOOLS.includes(tool as ToolName)
          ) as ToolName[])
        : [],
      args: (parsed.args ?? {}) as ToolArgs,
    };
  } catch {
    // Unparseable plan falls back to the safer tool
    return { intent: "UNKNOWN", tools: ["general_enquiry"], args: {} };
  }
}

export async function* askSeek(
  history: SeekTurn[],
  message: string
): AsyncGenerator<SeekEvent> {
  const ai = client();

  yield { type: "progress", step: "plan", message: "Reading your question", percent: 15 };

  const planning = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: `User request: ${message}` }] }],
    config: {
      systemInstruction: PLANNING.replace("{history}", historyBlock(history)),
      responseMimeType: "application/json",
    },
  });

  const plan = parsePlan(planning.text ?? "");

  yield { type: "plan", intent: plan.intent, tools: plan.tools };

  // Small talk needs no tool
  if (plan.tools.length === 0) {
    yield { type: "progress", step: "reply", message: "Writing a reply", percent: 70 };

    const chat = await ai.models.generateContent({
      model: MODEL,
      contents: [
        ...history.map((turn) => ({
          role: turn.role,
          parts: [{ text: turn.text }],
        })),
        { role: "user", parts: [{ text: message }] },
      ],
      config: { systemInstruction: PERSONA },
    });

    yield { type: "progress", step: "done", message: "Done", percent: 100 };
    yield { type: "reply", text: chat.text ?? "" };
    return;
  }

  const results: Record<string, unknown> = {};
  const total = plan.tools.length;

  for (const [index, tool] of plan.tools.entries()) {
    yield {
      type: "progress",
      step: tool,
      message: TOOL_LABELS[tool],
      percent: 25 + Math.round((index / total) * 45),
    };

    results[tool] = await runTool(tool, {
      ...plan.args,
      question: plan.args.question ?? message,
    });
  }

  yield { type: "progress", step: "synthesise", message: "Writing an answer", percent: 80 };

  const answer = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: SYNTHESIS.replace("{question}", message).replace(
              "{results}",
              JSON.stringify(results, null, 2)
            ),
          },
        ],
      },
    ],
    config: { systemInstruction: PERSONA },
  });

  yield { type: "progress", step: "done", message: "Done", percent: 100 };
  yield { type: "reply", text: answer.text ?? "" };
}
