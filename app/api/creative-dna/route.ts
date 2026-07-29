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
  const apiKey    = process.env.WATSONX_API_KEY;
  const projectId = process.env.WATSONX_PROJECT_ID;
  const baseUrl   = process.env.WATSONX_URL;
  const modelId   = process.env.WATSONX_MODEL_ID;

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

  let langInstruction: string;
  if (outputLang === "same") {
    langInstruction = "Respond in the same language as the creative spark.";
  } else if (outputLang === "other") {
    langInstruction = `Respond in ${(otherLanguage as string).trim()}.`;
  } else {
    const langName = LANG_NAMES[outputLang] ?? outputLang;
    langInstruction = `Respond in ${langName}.`;
  }

  // ── 4. Build prompts ──────────────────────────────────────────────────────
  const systemPrompt = `You are WishCraft AI, a creative strategist helping content creators turn raw ideas into structured creative plans.
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
      return NextResponse.json(GENERIC_ERROR, { status: 500 });
    }
    const iamData = await iamRes.json();
    if (typeof iamData.access_token !== "string" || iamData.access_token.trim() === "") {
      return NextResponse.json(GENERIC_ERROR, { status: 500 });
    }
    iamToken = iamData.access_token;
  } catch {
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
            { role: "user",   content: userMessage  },
          ],
          max_completion_tokens: 1024,
          response_format: { type: "json_object" },
        }),
      }
    );
  } catch {
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  if (!modelRes.ok) {
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  // ── 7. Extract model text ─────────────────────────────────────────────────
  let raw: string;
  try {
    const modelData = await modelRes.json();
    raw = modelData.choices?.[0]?.message?.content ?? "";
  } catch {
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
  } catch {
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  // ── 9. Validate Creative DNA schema ──────────────────────────────────────
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  const result = parsed as Record<string, unknown>;

  for (const field of ["coreIdea", "message", "mood", "audience", "tone", "creativeDirection"] as const) {
    if (typeof result[field] !== "string") {
      return NextResponse.json(GENERIC_ERROR, { status: 500 });
    }
  }

  for (const field of ["suggestedFormats", "recommendedPlatforms"] as const) {
    if (
      !Array.isArray(result[field]) ||
      !(result[field] as unknown[]).every((item) => typeof item === "string")
    ) {
      return NextResponse.json(GENERIC_ERROR, { status: 500 });
    }
  }

  // ── 10. Return validated Creative DNA ────────────────────────────────────
  return NextResponse.json({
    coreIdea:             result.coreIdea             as string,
    message:              result.message              as string,
    mood:                 result.mood                 as string,
    audience:             result.audience             as string,
    tone:                 result.tone                 as string,
    creativeDirection:    result.creativeDirection    as string,
    suggestedFormats:     result.suggestedFormats     as string[],
    recommendedPlatforms: result.recommendedPlatforms as string[],
  });
}
