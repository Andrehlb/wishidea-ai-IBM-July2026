import { NextRequest, NextResponse } from "next/server";

const GENERIC_ERROR = {
  error: "Unable to load the interface language.",
};

const UI_FIELDS = [
  "ideaSource",
  "ownIdea",
  "followerSuggestion",
  "audienceComment",
  "audienceQuestion",
  "creativeSpark",
  "creativeSparkPlaceholder",
  "outputLanguage",
  "sameAsInput",
  "english",
  "portuguese",
  "spanish",
  "chineseSimplified",
  "otherLanguage",
  "specifyLanguage",
  "languagePlaceholder",
  "shapeMyUniverse",
  "shaping",
  "generatingCreativeDna",
  "generationError",
  "creativeDna",
  "coreIdea",
  "sparkInterpretation",
  "message",
  "mood",
  "audienceVoice",
  "audience",
  "tone",
  "creativePlan",
  "creativeDirection",
  "suggestedFormats",
  "recommendedPlatforms",
  "editCreativeSpark",
] as const;

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { language } = body as Record<string, unknown>;

  if (typeof language !== "string" || language.trim() === "") {
    return NextResponse.json(
      { error: "language is required." },
      { status: 400 }
    );
  }

  const apiKey = process.env.WATSONX_API_KEY;
  const projectId = process.env.WATSONX_PROJECT_ID;
  const baseUrl = process.env.WATSONX_URL;
  const modelId = process.env.WATSONX_MODEL_ID;

  if (!apiKey || !projectId || !baseUrl || !modelId) {
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  const targetLanguage = language.trim();

  const systemPrompt = `You translate the WishIdea application interface.

Translate every interface string below naturally into the requested language.

Rules:
- Return ONLY a valid JSON object.
- Use exactly the same JSON keys.
- Every value must be a string.
- Do not add or remove keys.
- Do not use markdown.
- Preserve the product name "WishIdea" exactly whenever it appears.
- Preserve the product term "Creative DNA" exactly whenever it appears.
- Translate for a modern creative application interface, not word-for-word when that would sound unnatural.

Source interface:
{
  "ideaSource": "Idea source",
  "ownIdea": "My own idea",
  "followerSuggestion": "Follower suggestion",
  "audienceComment": "Audience comment",
  "audienceQuestion": "Audience question",
  "creativeSpark": "Creative spark",
  "creativeSparkPlaceholder": "Describe the creative spark...",
  "outputLanguage": "Output language",
  "sameAsInput": "Same as input",
  "english": "English",
  "portuguese": "Portuguese — Português",
  "spanish": "Spanish — Español",
  "chineseSimplified": "Chinese (Simplified) — 简体中文",
  "otherLanguage": "Other language",
  "specifyLanguage": "Specify language",
  "languagePlaceholder": "Type a language...",
  "shapeMyUniverse": "Shape My Universe",
  "shaping": "Shaping…",
  "generatingCreativeDna": "Generating your Creative DNA…",
  "generationError": "Unable to generate Creative DNA.",
  "creativeDna": "Creative DNA",
  "coreIdea": "Core idea",
  "sparkInterpretation": "The spark interpretation",
  "message": "Message",
  "mood": "Mood",
  "audienceVoice": "Audience & voice",
  "audience": "Audience",
  "tone": "Tone",
  "creativePlan": "Creative plan",
  "creativeDirection": "Creative direction",
  "suggestedFormats": "Suggested formats",
  "recommendedPlatforms": "Recommended platforms",
  "editCreativeSpark": "← Edit creative spark"
}`;

  const userMessage =
    `Translate the WishIdea interface into: ${targetLanguage}`;

  let iamToken: string;

  try {
    const iamRes = await fetch(
      "https://iam.cloud.ibm.com/identity/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body:
          "grant_type=urn:ibm:params:oauth:grant-type:apikey" +
          `&apikey=${encodeURIComponent(apiKey)}`,
      }
    );

    if (!iamRes.ok) {
      return NextResponse.json(GENERIC_ERROR, { status: 500 });
    }

    const iamData = await iamRes.json();
    iamToken = iamData.access_token as string;
  } catch {
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

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
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
          max_completion_tokens: 2048,
          response_format: {
            type: "json_object",
          },
        }),
      }
    );
  } catch {
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  if (!modelRes.ok) {
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  let raw: string;

  try {
    const modelData = await modelRes.json();

    raw =
      modelData.choices?.[0]?.message?.content ?? "";
  } catch {
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

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

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  const result = parsed as Record<string, unknown>;

  for (const field of UI_FIELDS) {
    if (typeof result[field] !== "string") {
      return NextResponse.json(GENERIC_ERROR, { status: 500 });
    }
  }

  if (Object.keys(result).length !== UI_FIELDS.length) {
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  return NextResponse.json(
    Object.fromEntries(
      UI_FIELDS.map(field => [field, result[field]])
    )
  );
}