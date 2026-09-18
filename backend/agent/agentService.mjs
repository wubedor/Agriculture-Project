import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import {
  createAgentSession,
  DefaultResourceLoader,
  ModelRuntime,
  SessionManager,
  getAgentDir,
  createSyntheticSourceInfo,
} from "@earendil-works/pi-coding-agent";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AGENT_HOME = path.resolve(__dirname, "..", "agent-home");
const MEMORY_DIR = path.join(AGENT_HOME, "memory");

async function pickGroqModel(modelRuntime, preferredIds) {
  for (const id of preferredIds) {
    const base = modelRuntime.getModel("groq", id);
    if (!base) continue;
    // Groq's chat-completions endpoint rejects the "developer" system role
    // that the SDK sends for reasoning models. Send a normal system prompt
    // by disabling reasoning so the request does not fail with a 400.
    return { ...base, reasoning: false };
  }
  const available = await modelRuntime.getAvailable();
  const fallback = available.find((m) => m.provider === "groq") ?? null;
  return fallback ? { ...fallback, reasoning: false } : null;
}
function seedMemory(listing, buyerDemands) {
  fs.writeFileSync(
    path.join(MEMORY_DIR, "listings.json"),
    JSON.stringify(listing, null, 2),
  );
  fs.writeFileSync(
    path.join(MEMORY_DIR, "buyers.json"),
    JSON.stringify(buyerDemands, null, 2),
  );
}
let sessionPromise = null;

async function createSession() {
  const modelRuntime = await ModelRuntime.create();
  const preferred = ["qwen/qwen3.8-27b", "openai/gpt-oss-20b"];
  const model = await pickGroqModel(modelRuntime, preferred);
  if (!model) throw new Error("No Groq model found. Check GROQ_API_KEY.");
  const loader = new DefaultResourceLoader({
    cwd: AGENT_HOME,
    agentDir: getAgentDir(),
    // Lean system prompt for a single-turn match: skip loading AGENTS.md,
    // brain, skills and workspace context files so the request stays small
    // (avoids multi-turn file reads and rate-limit waits).
    noContextFiles: true,
    systemPromptOverride: () =>
      "You are the AgriConnect AI selling assistant for a farmer. " +
      "The farmer's produce listing and all candidate buyer requests are " +
      "provided in the user message. Match the listing against the buyers. " +
      "Do NOT use any tools, do NOT read any files, and do NOT ask clarifying " +
      "questions. Reply with ONLY one JSON object and nothing else, shaped as: " +
      '{"matches":[{"buyer":"buyer name","offer":3.55,"fitScore":85,"reason":"short reason"}],' +
      '"bestMatch":{"buyer":"buyer name","offer":3.55,"fitScore":85,"reason":"short reason"},' +
      '"outreachDraft":"a short, warm outreach message to the best buyer"}',
  });
  await loader.reload();
  const { session } = await createAgentSession({
    cwd: AGENT_HOME,
    model,
    modelRuntime,
    resourceLoader: loader,
    tools: [],
    sessionManager: SessionManager.inMemory(),
    thinkingLevel: "off",
  });
  sessionPromise = session;
  return session;
}

async function getSession() {
  if (sessionPromise) return sessionPromise;
  return createSession();
}

function resetSessionForNewRun() {
  sessionPromise = null;
}
async function promptWithRetry(session, text, maxTries = 5) {
  const rateLimitMessage = () => {
    const lastAssistant = [...session.messages]
      .reverse()
      .find((m) => m.role === "assistant");
    if (
      lastAssistant?.stopReason === "error" &&
      /\brate_limit_exceeded\b/i.test(lastAssistant?.errorMessage ?? "")
    ) {
      return lastAssistant.errorMessage;
    }
    return null;
  };
  for (let attempt = 1; attempt <= maxTries; attempt++) {
    try {
      await session.prompt(text);
    } catch (err) {
      const msg = err?.message ?? String(err);
      const wait = /\btry again in\s+([\d.]+)\s*s\b/i.exec(msg);
      if (!wait || attempt >= maxTries) throw err;
      const seconds = Number(wait[1]) + 2;
      console.log(
        `Rate limited. Waiting ${seconds}s (attempt ${attempt}/${maxTries})...`,
      );
      await new Promise((r) => setTimeout(r, seconds * 1000));
      continue;
    }
    // The SDK can embed the 429 as a message instead of throwing. Detect it
    // and re-prompt the same session so work already done is not lost.
    const limitMsg = rateLimitMessage();
    if (!limitMsg) return;
    if (attempt >= maxTries) throw new Error(limitMsg);
    const wait = /\btry again in\s+([\d.]+)\s*s\b/i.exec(limitMsg);
    const seconds = wait ? Number(wait[1]) + 2 : 10;
    console.log(
      `Rate limited. Waiting ${seconds}s (attempt ${attempt}/${maxTries})...`,
    );
    await new Promise((r) => setTimeout(r, seconds * 1000));
    text =
      "A rate limit error interrupted you. Continue from where you stopped " +
      "and reply with ONLY the required JSON.";
  }
  throw new Error(`Agent did not finish after ${maxTries} attempts`);
}
export async function runAgent(listing, buyerDemands) {
  seedMemory(listing, buyerDemands);
  resetSessionForNewRun();
  const session = await getSession();
  const events = [];
  const unsub = session.subscribe((event) => {
    events.push(
      event.type +
        (event.assistantMessageEvent?.type
          ? `/${event.assistantMessageEvent.type}`
          : ""),
    );
  });
  try {
    await promptWithRetry(
      session,
      "The farmer wants to sell produce. Match the listing against the buyer " +
        "requests below. " +
        "Price eligibility: a buyer must offer at or above this listing's " +
        "minPrice. Score every eligible buyer 0-100 by fit, rank the top 3 " +
        "best to worst, pick the best overall match, and draft a short warm " +
        "outreach message for that best buyer. All data is complete and " +
        "inline — do not read any files.\n\n" +
        "LISTING:\n" +
        JSON.stringify(listing, null, 2) +
        "\n\nBUYER REQUESTS:\n" +
        JSON.stringify(buyerDemands, null, 2) +
        "\n\nReply with ONLY the JSON object and nothing else: " +
        '{"matches":[{"buyer":"buyer name","offer":3.55,"fitScore":85,"reason":"..."}],' +
        '"bestMatch":{"buyer":"buyer name","offer":3.55,"fitScore":85,"reason":"..."},' +
        '"outreachDraft":"the drafted message here"}',
    );
  } finally {
    unsub();
  }
  console.log("EVENTS:", JSON.stringify(events));
  console.log(
    "MESSAGES:",
    JSON.stringify(
      session.messages.map((m) => ({
        role: m.role,
        stopReason: m.stopReason,
        errorMessage: m.errorMessage,
        contentTypes: Array.isArray(m.content)
          ? m.content.map((b) => b.type)
          : m.content,
        contentLength: Array.isArray(m.content) ? m.content.length : null,
      })),
      null,
      2,
    ),
  );
  const text = session.messages
    .filter((m) => m.role === "assistant")
    .flatMap((m) => {
      if (typeof m.content === "string") return [m.content];
      if (!Array.isArray(m.content)) return [];
      return m.content
        .flatMap((b) => {
          if (b?.type === "text") return b.text;
          if (typeof b?.text === "string") return b.text;
          return [];
        })
        .filter((t) => typeof t === "string");
    })
    .join("\n");
  const trimmed = text.trim();
  try {
    const parsed = parseJsonReply(trimmed);
    if (!parsed) throw new Error("no JSON object found");
    return {
      matches: Array.isArray(parsed.matches) ? parsed.matches : [],
      bestMatch: parsed.bestMatch ?? null,
      outreachDraft: parsed.outreachDraft ?? "",
    };
  } catch {
    return {
      success: false,
      message:
        "The agent did not return usable buyer matches. Look at the raw reply below and try again.",
      matches: [],
      bestMatch: null,
      outreachDraft: "",
      raw: trimmed,
    };
  }
}

function parseJsonReply(raw) {
  const text = String(raw)
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/g, "");
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

