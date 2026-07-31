import { NextRequest, NextResponse } from "next/server";

const GENERIC_ERROR = { error: "Unable to generate Creative DNA." };

export async function POST(request: NextRequest) {
  // ── 1. Parse & validate browser payload ──────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { ideaSource, creativeSpark, outputLang, otherLanguage } =
    body as Record<string, unknown>;

  if (typeof creativeSpark !== "string" || creativeSpark.trim() === "") {
    return NextResponse.json({ error: "creativeSpark is required." }, { status: 400 });
  }
  if (typeof ideaSource !== "string") {
    return NextResponse.json({ error: "ideaSource is required." }, { status: 400 });
  }
  if (typeof outputLang !== "string") {
    return NextResponse.json({ error: "outputLang is required." }, { status: 400 });
  }
  if (outputLang === "other") {
    if (typeof otherLanguage !== "string" || otherLanguage.trim() === "") {
      return NextResponse.json(
        { error: "otherLanguage is required when outputLang is 'other'." },
        { status: 400 }
      );
    }
  }

  // ── 2. Require all four env vars ──────────────────────────────────────────
  const apiKey = process.env.WATSONX_API_KEY;
  const projectId = process.env.WATSONX_PROJECT_ID;
  const baseUrl = process.env.WATSONX_URL;
  const modelId = process.env.WATSONX_MODEL_ID;

  if (!apiKey || !projectId || !baseUrl || !modelId) {
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  // ── 3. Resolve output language ────────────────────────────────────────────
  const LANG_NAMES: Record<string, string> = {
    en: "English",
    pt: "Portuguese",
    es: "Spanish",
    zh: "Chinese (Simplified)",
  };

  /** Deterministically detect the language of a text from the four supported
   *  output languages. Chinese is identified by CJK codepoints; the Romance
   *  languages and English are identified by weighted common-word / character
   *  heuristics. The text analysed is ONLY the creativeSpark. */
  function detectLang(text: string): string {
    // Chinese: any CJK Unified Ideograph block character present
    if (/[\u4E00-\u9FFF\u3400-\u4DBF]/.test(text)) return "Chinese (Simplified)";

    const lower = text.toLowerCase();

    const ptTokens = ["não", "ção", "ções", "ã", "õ", "de", "que", "para",
      "uma", "com", "criar", "ideia", "vídeo", "meu", "minha", "com"];
    const esTokens = ["ñ", "¿", "¡", "que", "para", "una", "con", "crear",
      "idea", "vídeo", "el", "la", "los", "las"];
    const enTokens = ["the", "and", "with", "create", "idea", "video", "my",
      "how", "world", "is", "of", "to", "an", "a"];

    function score(tokens: string[]): number {
      return tokens.reduce((n, t) => {
        // single characters: substring match; words: whole-word match
        const re = t.length === 1
          ? new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
          : new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        return n + (re.test(lower) ? 1 : 0);
      }, 0);
    }

    const scores: [string, number][] = [
      ["Portuguese", score(ptTokens)],
      ["Spanish",    score(esTokens)],
      ["English",    score(enTokens)],
    ];
    scores.sort((a, b) => b[1] - a[1]);
    // Fall back to English when all scores are 0
    return scores[0][1] > 0 ? scores[0][0] : "English";
  }

  let langInstruction: string;
  if (outputLang === "same") {
    const detected = detectLang(creativeSpark as string);
    langInstruction =
      `Respond in ${detected}. Every textual value in the JSON response must be in ${detected}.`;
  } else if (outputLang === "other") {
    langInstruction = `Respond in ${(otherLanguage as string).trim()}.`;
  } else {
    const langName = LANG_NAMES[outputLang] ?? outputLang;
    langInstruction = `Respond in ${langName}.`;
  }

  // ── 4. Build prompts ──────────────────────────────────────────────────────
  const systemPrompt = `You are WishIdea AI, a creative strategist helping content creators turn raw ideas into structured creative plans.
Given a creative spark and its source, produce a Creative DNA analysis with the following sections:
1. Core idea — one sentence, poetic but concrete.
2. The spark interpretation — Message (what the content communicates) and Mood (3 words joined by ·).
3. Audience & voice — Audience (specific description) and Tone (2–3 sentences).
4. Creative plan — Creative direction (2–3 sentences), Suggested formats (3 to 5 relevant items), Recommended platforms (3 to 5 relevant platforms).

${langInstruction}

Respond ONLY with a valid JSON object using exactly these keys:
{
  "coreIdea": string,
  "message": string,
  "mood": string,
  "audience": string,
  "tone": string,
  "creativeDirection": string,
  "suggestedFormats": string[],
  "recommendedPlatforms": string[]
}`;

  const userMessage = `Idea source: ${ideaSource}\nCreative spark: ${creativeSpark.trim()}`;

  // ── 5. Exchange API key for IAM bearer token (server-side only) ───────────
  let iamToken: string;
  try {
    const iamRes = await fetch("https://iam.cloud.ibm.com/identity/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${encodeURIComponent(apiKey)}`,
    });
    if (!iamRes.ok) {
      console.error("[creative-dna] IAM auth failed — status:", iamRes.status);
      return NextResponse.json(GENERIC_ERROR, { status: 500 });
    }
    const iamData = await iamRes.json();
    if (typeof iamData.access_token !== "string" || iamData.access_token.trim() === "") {
      console.error("[creative-dna] IAM auth failed — access_token missing or empty in response");
      return NextResponse.json(GENERIC_ERROR, { status: 500 });
    }
    iamToken = iamData.access_token;
  } catch (err) {
    console.error("[creative-dna] IAM auth fetch threw:", err);
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  // ── 6. Call watsonx.ai Chat API ───────────────────────────────────────────
  let modelRes: Response;
  try {
    modelRes = await fetch(
      `${baseUrl}/ml/v1/text/chat?version=2025-10-25`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${iamToken}`,
        },
        body: JSON.stringify({
          model_id: modelId,
          project_id: projectId,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          max_completion_tokens: 3072,
          response_format: { type: "json_object" },
        }),
      }
    );
  } catch (err) {
    console.error("[creative-dna] Watsonx fetch threw:", err);
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  if (!modelRes.ok) {
    let errorBody = "(could not read body)";
    try { errorBody = await modelRes.text(); } catch { /* ignore */ }
    console.error("[creative-dna] Watsonx HTTP error — status:", modelRes.status, "body:", errorBody);
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  // ── 7. Extract model text ─────────────────────────────────────────────────
  let raw: string;
  try {
    const modelData = await modelRes.json();
    const choice = modelData.choices?.[0];
    raw = choice?.message?.content ?? "";
    if (!raw) {
      console.error(
        "[creative-dna] Empty/missing model content — choices length:",
        modelData.choices?.length ?? "undefined",
        "choice[0]:", JSON.stringify(choice ?? null),
      );
    }
  } catch (err) {
    console.error("[creative-dna] Failed to parse Watsonx JSON response:", err);
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  // ── 8. Parse JSON — strip optional markdown code fence defensively ────────
  const jsonText = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    console.error("[creative-dna] JSON.parse failed on model output — raw content:", raw, "error:", err);
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  // ── 9. Validate Creative DNA schema ──────────────────────────────────────
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    console.error("[creative-dna] Schema validation failed — parsed value is not a plain object:", typeof parsed);
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  const result = parsed as Record<string, unknown>;

  for (const field of [
    "coreIdea",
    "message",
    "mood",
    "audience",
    "tone",
    "creativeDirection",
  ] as const) {
    if (typeof result[field] !== "string") {
      console.error(`[creative-dna] Schema validation failed — field "${field}" is ${typeof result[field]}, value:`, result[field]);
      return NextResponse.json(GENERIC_ERROR, { status: 500 });
    }
  }

  // Normalize suggestedFormats / recommendedPlatforms: Watsonx sometimes
  // returns a single delimited string instead of string[].
  for (const field of ["suggestedFormats", "recommendedPlatforms"] as const) {
    if (typeof result[field] === "string") {
      result[field] = (result[field] as string)
        .split(/[,、;；\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }
  }

  for (const field of ["suggestedFormats", "recommendedPlatforms"] as const) {
    if (
      !Array.isArray(result[field]) ||
      !(result[field] as unknown[]).every((item) => typeof item === "string")
    ) {
      console.error(`[creative-dna] Schema validation failed — field "${field}":`, JSON.stringify(result[field]));
      return NextResponse.json(GENERIC_ERROR, { status: 500 });
    }
  }

  // ── 10. Return validated Creative DNA ────────────────────────────────────
  return NextResponse.json({
    coreIdea: result.coreIdea as string,
    message: result.message as string,
    mood: result.mood as string,
    audience: result.audience as string,
    tone: result.tone as string,
    creativeDirection: result.creativeDirection as string,
    suggestedFormats: result.suggestedFormats as string[],
    recommendedPlatforms: result.recommendedPlatforms as string[],
  });
}
