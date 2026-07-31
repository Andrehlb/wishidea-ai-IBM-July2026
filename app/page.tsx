"use client";
import { useState, useEffect, useLayoutEffect, useRef } from "react";

type CreativeDNA = {
  coreIdea: string;
  message: string;
  mood: string;
  audience: string;
  tone: string;
  creativeDirection: string;
  suggestedFormats: string[];
  recommendedPlatforms: string[];
};

type InterfaceLanguage = "en" | "pt" | "es" | "zh" | "other";

type UiText = {
  ideaSource: string;
  ownIdea: string;
  followerSuggestion: string;
  audienceComment: string;
  audienceQuestion: string;

  creativeSpark: string;
  creativeSparkPlaceholder: string;

  outputLanguage: string;
  sameAsInput: string;
  english: string;
  portuguese: string;
  spanish: string;
  chineseSimplified: string;
  otherLanguage: string;
  specifyLanguage: string;
  languagePlaceholder: string;

  shapeMyUniverse: string;
  shaping: string;
  generatingCreativeDna: string;
  generationError: string;

  creativeDna: string;
  coreIdea: string;
  sparkInterpretation: string;
  message: string;
  mood: string;
  audienceVoice: string;
  audience: string;
  tone: string;
  creativePlan: string;
  creativeDirection: string;
  suggestedFormats: string;
  recommendedPlatforms: string;
  editCreativeSpark: string;
};

const INTERFACE_LANGUAGE_OPTIONS = [
  { value: "en" as const, code: "EN", label: "English" },
  { value: "pt" as const, code: "PT", label: "Português" },
  { value: "es" as const, code: "ES", label: "Español" },
  { value: "zh" as const, code: "ZH", label: "简体中文" },
  { value: "other" as const, code: "OTHER", label: "Other language" },
];

const UI_TEXT_EN: UiText = {
  ideaSource: "Idea source",
  ownIdea: "My own idea",
  followerSuggestion: "Follower suggestion",
  audienceComment: "Audience comment",
  audienceQuestion: "Audience question",

  creativeSpark: "Creative spark",
  creativeSparkPlaceholder: "Describe the creative spark...",

  outputLanguage: "Output language",
  sameAsInput: "Same as input",
  english: "English",
  portuguese: "Portuguese — Português",
  spanish: "Spanish — Español",
  chineseSimplified: "Chinese (Simplified) — 简体中文",
  otherLanguage: "Other language",
  specifyLanguage: "Specify language",
  languagePlaceholder: "Type a language...",

  shapeMyUniverse: "Shape My Universe",
  shaping: "Shaping…",
  generatingCreativeDna: "Generating your Creative DNA…",
  generationError: "Unable to generate Creative DNA.",

  creativeDna: "Creative DNA",
  coreIdea: "Core idea",
  sparkInterpretation: "The spark interpretation",
  message: "Message",
  mood: "Mood",
  audienceVoice: "Audience & voice",
  audience: "Audience",
  tone: "Tone",
  creativePlan: "Creative plan",
  creativeDirection: "Creative direction",
  suggestedFormats: "Suggested formats",
  recommendedPlatforms: "Recommended platforms",
  editCreativeSpark: "← Edit creative spark",
};

const UI_TEXT_PT: UiText = {
  ideaSource: "Origem da ideia",
  ownIdea: "Minha própria ideia",
  followerSuggestion: "Sugestão de seguidor",
  audienceComment: "Comentário da audiência",
  audienceQuestion: "Pergunta da audiência",

  creativeSpark: "Faísca criativa",
  creativeSparkPlaceholder: "Descreva sua ideia criativa...",

  outputLanguage: "Idioma da resposta",
  sameAsInput: "Mesmo idioma da entrada",
  english: "Inglês — English",
  portuguese: "Português",
  spanish: "Espanhol — Español",
  chineseSimplified: "Chinês simplificado — 简体中文",
  otherLanguage: "Outro idioma",
  specifyLanguage: "Especifique o idioma",
  languagePlaceholder: "Digite um idioma...",

  shapeMyUniverse: "Crie meu universo",
  shaping: "Criando…",
  generatingCreativeDna: "Gerando seu Creative DNA…",
  generationError: "Não foi possível gerar o Creative DNA.",

  creativeDna: "Creative DNA",
  coreIdea: "Ideia central",
  sparkInterpretation: "Interpretação da faísca",
  message: "Mensagem",
  mood: "Clima",
  audienceVoice: "Audiência e voz",
  audience: "Audiência",
  tone: "Tom",
  creativePlan: "Plano criativo",
  creativeDirection: "Direção criativa",
  suggestedFormats: "Formatos sugeridos",
  recommendedPlatforms: "Plataformas recomendadas",
  editCreativeSpark: "← Editar faísca criativa",
};

const UI_TEXT_ES: UiText = {
  ideaSource: "Origen de la idea",
  ownIdea: "Mi propia idea",
  followerSuggestion: "Sugerencia de un seguidor",
  audienceComment: "Comentario de la audiencia",
  audienceQuestion: "Pregunta de la audiencia",

  creativeSpark: "Chispa creativa",
  creativeSparkPlaceholder: "Describe tu idea creativa...",

  outputLanguage: "Idioma de la respuesta",
  sameAsInput: "Mismo idioma que la entrada",
  english: "Inglés — English",
  portuguese: "Portugués — Português",
  spanish: "Español",
  chineseSimplified: "Chino simplificado — 简体中文",
  otherLanguage: "Otro idioma",
  specifyLanguage: "Especifica el idioma",
  languagePlaceholder: "Escribe un idioma...",

  shapeMyUniverse: "Crea mi universo",
  shaping: "Creando…",
  generatingCreativeDna: "Generando tu Creative DNA…",
  generationError: "No se pudo generar el Creative DNA.",

  creativeDna: "Creative DNA",
  coreIdea: "Idea central",
  sparkInterpretation: "Interpretación de la chispa",
  message: "Mensaje",
  mood: "Ambiente",
  audienceVoice: "Audiencia y voz",
  audience: "Audiencia",
  tone: "Tono",
  creativePlan: "Plan creativo",
  creativeDirection: "Dirección creativa",
  suggestedFormats: "Formatos sugeridos",
  recommendedPlatforms: "Plataformas recomendadas",
  editCreativeSpark: "← Editar chispa creativa",
};

const UI_TEXT_ZH: UiText = {
  ideaSource: "创意来源",
  ownIdea: "我自己的想法",
  followerSuggestion: "粉丝建议",
  audienceComment: "观众评论",
  audienceQuestion: "观众提问",

  creativeSpark: "创意火花",
  creativeSparkPlaceholder: "描述你的创意灵感...",

  outputLanguage: "输出语言",
  sameAsInput: "与输入语言相同",
  english: "英语 — English",
  portuguese: "葡萄牙语 — Português",
  spanish: "西班牙语 — Español",
  chineseSimplified: "简体中文",
  otherLanguage: "其他语言",
  specifyLanguage: "指定语言",
  languagePlaceholder: "输入一种语言...",

  shapeMyUniverse: "塑造我的宇宙",
  shaping: "正在塑造…",
  generatingCreativeDna: "正在生成你的 Creative DNA…",
  generationError: "无法生成 Creative DNA。",

  creativeDna: "Creative DNA",
  coreIdea: "核心创意",
  sparkInterpretation: "创意火花解读",
  message: "信息",
  mood: "氛围",
  audienceVoice: "受众与表达",
  audience: "受众",
  tone: "语气",
  creativePlan: "创意计划",
  creativeDirection: "创意方向",
  suggestedFormats: "建议形式",
  recommendedPlatforms: "推荐平台",
  editCreativeSpark: "← 编辑创意火花",
};

const UI_TEXT_BY_LANGUAGE: Record<
  Exclude<InterfaceLanguage, "other">,
  UiText
> = {
  en: UI_TEXT_EN,
  pt: UI_TEXT_PT,
  es: UI_TEXT_ES,
  zh: UI_TEXT_ZH,
};

// Intro step order — null means "not yet resolved on client"
type IntroStep =
  | null
  | "brand-large"
  | "brand-settle"
  | "line-1"
  | "line-2"
  | "line-3"
  | "tagline"
  | "hold"
  | "collapse"
  | "brand-bloom"
  | "complete";

// Timing (ms) for each step before advancing
const STEP_DURATIONS: Record<Exclude<IntroStep, null | "complete">, number> = {
  "brand-large": 900,
  "brand-settle": 700,
  "line-1": 500,
  "line-2": 400,
  "line-3": 400,
  "tagline": 600,
  "hold": 1200,
  "collapse": 1000,
  "brand-bloom": 850,
};

const STEP_ORDER: Array<Exclude<IntroStep, null>> = [
  "brand-large",
  "brand-settle",
  "line-1",
  "line-2",
  "line-3",
  "tagline",
  "hold",
  "collapse",
  "brand-bloom",
  "complete",
];

function nextStep(current: Exclude<IntroStep, null>): Exclude<IntroStep, null> {
  const idx = STEP_ORDER.indexOf(current);
  return STEP_ORDER[Math.min(idx + 1, STEP_ORDER.length - 1)];
}

export default function Home() {
  const [stage, setStage] = useState<"input" | "result">("input");
  const [ideaSource, setIdeaSource] = useState("");
  const [creativeSpark, setCreativeSpark] = useState("");
  const [outputLang, setOutputLang] = useState("same");
  const [otherLanguage, setOtherLanguage] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dnaError, setDnaError] = useState<string | null>(null);
  const [dna, setDna] = useState<CreativeDNA | null>(null);
  const [interfaceLanguage, setInterfaceLanguage] = useState<InterfaceLanguage | null>(null);
  const [interfaceOtherLanguage, setInterfaceOtherLanguage] = useState("");
  const [interfaceLanguageOpen, setInterfaceLanguageOpen] = useState(false);
  const [interfaceFocusedIdx, setInterfaceFocusedIdx] = useState(0);
  const [interfaceLoading, setInterfaceLoading] = useState(false);
  const [interfaceError, setInterfaceError] = useState<string | null>(null);
  const [uiText, setUiText] = useState<UiText | null>(null);

  // null = SSR / not yet resolved; resolved in useLayoutEffect before first paint
  const [introStep, setIntroStep] = useState<IntroStep>(null);

  // Measured FLIP transform for the brand element.
  // Set to the displacement value at brand-large; cleared to "none" at brand-settle
  // so the CSS transition on the element glides it back to its natural position.
  const [brandTransform, setBrandTransform] = useState<string>("none");

  const langRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const interfaceLangRef = useRef<HTMLDivElement>(null);
  const interfaceTriggerRef = useRef<HTMLButtonElement>(null);
  const interfaceListboxRef = useRef<HTMLUListElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const sparkTextareaRef = useRef<HTMLTextAreaElement>(null);
  const hasVisitedResultRef = useRef(false);
  const brandRef = useRef<HTMLSpanElement>(null);
  const brandTriggerRef = useRef<HTMLButtonElement>(null);

  const t = uiText ?? UI_TEXT_EN;

  const LANG_OPTIONS = [
    { value: "same",  code: "AUTO",  label: t.sameAsInput },
    { value: "en",    code: "EN",    label: t.english },
    { value: "pt",    code: "PT",    label: t.portuguese },
    { value: "es",    code: "ES",    label: t.spanish },
    { value: "zh",    code: "ZH",    label: t.chineseSimplified },
    { value: "other", code: "OTHER", label: t.otherLanguage },
  ];

  const selectedOption = LANG_OPTIONS.find(o => o.value === outputLang)!;

  const selectedInterfaceOption =
    INTERFACE_LANGUAGE_OPTIONS.find(
      option => option.value === interfaceLanguage
    ) ?? INTERFACE_LANGUAGE_OPTIONS[0];

  // ── Resolve motion preference before first paint ────────────────────────
  useLayoutEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIntroStep(reducedMotion ? "complete" : "brand-large");
  }, []);

  // ── FLIP: measure brand element and compute displacement transform ──────
  // The outer layout is top-anchored (pt-16 sm:pt-24), so the header position
  // is geometrically stable — identical during the intro and after the form
  // mounts. This measurement therefore captures the true final destination.
  useLayoutEffect(() => {
    if (introStep !== "brand-large") return;
    if (!brandRef.current) return;

    const el = brandRef.current;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Viewport centre
    const vcx = vw / 2;
    const vcy = vh / 2;

    // Element centre in its stable header position
    const ecx = rect.left + rect.width / 2;
    const ecy = rect.top + rect.height / 2;

    // Translation to move element centre onto viewport centre
    const tx = vcx - ecx;
    const ty = vcy - ecy;

    // Scale to visually match text-6xl (~60px) on ≥sm, text-4xl (~36px) on mobile
    const targetHeight = vw >= 640 ? 60 : 36;
    const scale = targetHeight / rect.height;

    setBrandTransform(`translate(${tx}px, ${ty}px) scale(${scale})`);
  }, [introStep]);

  // ── FLIP settle: clear transform → CSS transition glides element home ───
  useLayoutEffect(() => {
    if (introStep !== "brand-settle") return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBrandTransform("none");
  }, [introStep]);

  // ── Step machine ────────────────────────────────────────────────────────
  useEffect(() => {
    if (introStep === null || introStep === "complete") return;
    const duration = STEP_DURATIONS[introStep];
    const timer = setTimeout(() => {
      setIntroStep(prev =>
        prev === null || prev === "complete" ? prev : nextStep(prev)
      );
    }, duration);
    return () => clearTimeout(timer);
  }, [introStep]);

  // ── Replay ──────────────────────────────────────────────────────────────
  function replayIntro() {
    setBrandTransform("none");
    setIntroStep("brand-large");
  }

  // ── Focus / behaviour effects ───────────────────────────────────────────

  useEffect(() => {
    if (stage === "result") {
      hasVisitedResultRef.current = true;
      resultHeadingRef.current?.focus();
    }
  }, [stage]);

  useEffect(() => {
    if (stage === "input" && hasVisitedResultRef.current) {
      sparkTextareaRef.current?.focus();
    }
  }, [stage]);

  useEffect(() => {
    if (langOpen) listboxRef.current?.focus();
  }, [langOpen]);

  useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [langOpen]);

  useEffect(() => {
    if (interfaceLanguageOpen) {
      interfaceListboxRef.current?.focus();
    }
  }, [interfaceLanguageOpen]);

  useEffect(() => {
    if (!interfaceLanguageOpen) return;

    const handler = (e: MouseEvent) => {
      if (
        interfaceLangRef.current &&
        !interfaceLangRef.current.contains(e.target as Node)
      ) {
        setInterfaceLanguageOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [interfaceLanguageOpen]);

  function openInterfaceMenu() {
    const idx = INTERFACE_LANGUAGE_OPTIONS.findIndex(
      option => option.value === interfaceLanguage
    );

    setInterfaceFocusedIdx(idx >= 0 ? idx : 0);
    setInterfaceLanguageOpen(true);
  }

  function closeInterfaceMenu(returnFocus = true) {
    setInterfaceLanguageOpen(false);

    if (returnFocus) {
      interfaceTriggerRef.current?.focus();
    }
  }


  function selectInterfaceOption(value: InterfaceLanguage) {
    setInterfaceLanguage(value);
    setInterfaceError(null);

    if (value === "other") {
      setUiText(null);
    } else {
      setUiText(UI_TEXT_BY_LANGUAGE[value]);
      setInterfaceOtherLanguage("");
    }

    closeInterfaceMenu(true);
  }

  function handleInterfaceTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openInterfaceMenu();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();

      const idx = INTERFACE_LANGUAGE_OPTIONS.findIndex(
        option => option.value === interfaceLanguage
      );

      setInterfaceFocusedIdx(
        idx >= 0 ? idx : INTERFACE_LANGUAGE_OPTIONS.length - 1
      );

      setInterfaceLanguageOpen(true);
    } else if (e.key === "Escape") {
      setInterfaceLanguageOpen(false);
    }
  }

  function handleInterfaceListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();

      setInterfaceFocusedIdx(index =>
        Math.min(index + 1, INTERFACE_LANGUAGE_OPTIONS.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();

      setInterfaceFocusedIdx(index =>
        Math.max(index - 1, 0)
      );
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();

      selectInterfaceOption(
        INTERFACE_LANGUAGE_OPTIONS[interfaceFocusedIdx].value
      );
    } else if (e.key === "Escape") {
      closeInterfaceMenu(true);
    }
  }

  function handleInterfaceListBlur(
    e: React.FocusEvent<HTMLUListElement>
  ) {
    if (
      interfaceLangRef.current &&
      interfaceLangRef.current.contains(e.relatedTarget as Node)
    ) {
      return;
    }

    setInterfaceLanguageOpen(false);
  }

  function openMenu() {
    const idx = LANG_OPTIONS.findIndex(o => o.value === outputLang);
    setFocusedIdx(idx >= 0 ? idx : 0);
    setLangOpen(true);
  }

  function closeMenu(returnFocus = true) {
    setLangOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function selectOption(value: string) {
    setOutputLang(value);
    closeMenu(true);
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = LANG_OPTIONS.findIndex(o => o.value === outputLang);
      setFocusedIdx(idx >= 0 ? idx : LANG_OPTIONS.length - 1);
      setLangOpen(true);
    } else if (e.key === "Escape") {
      setLangOpen(false);
    }
  }

  function handleListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIdx(i => Math.min(i + 1, LANG_OPTIONS.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectOption(LANG_OPTIONS[focusedIdx].value);
    } else if (e.key === "Escape") {
      closeMenu(true);
    }
    // Tab: browser moves focus naturally; onBlur handles cleanup
  }

  function handleListBlur(e: React.FocusEvent<HTMLUListElement>) {
    if (langRef.current && langRef.current.contains(e.relatedTarget as Node)) return;
    setLangOpen(false);
  }

  async function handleInterfaceOtherLanguage() {
    const language = interfaceOtherLanguage.trim();

    if (!language) {
      setInterfaceError("Enter an interface language.");
      return;
    }

    setInterfaceError(null);
    setInterfaceLoading(true);

    try {
      const res = await fetch("/api/interface-language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInterfaceError(
          data.error ?? "Unable to load the interface language."
        );
        return;
      }

      setUiText(data as UiText);
    } catch {
      setInterfaceError("Unable to load the interface language.");
    } finally {
      setInterfaceLoading(false);
    }
  }

  async function handleSubmit() {
    setDnaError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/creative-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaSource, creativeSpark, outputLang, otherLanguage }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDnaError(t.generationError);
        return;
      }
      setDna(data as CreativeDNA);
      setStage("result");
    } catch {
      setDnaError(t.generationError);
    } finally {
      setLoading(false);
    }
  }

  // ── Derived state ───────────────────────────────────────────────────────
  const isComplete = introStep === "complete";
  const isCollapsing = introStep === "collapse";
  const isBlooming = introStep === "brand-bloom";
  const isBrandLarge = introStep === "brand-large";
  const isBrandSettling = introStep === "brand-settle";

  // Headline lines: present from line-1 through collapse; absent in complete.
  const showLine1 = ["line-1", "line-2", "line-3", "tagline", "hold", "collapse"].includes(introStep ?? "");
  const showLine2 = ["line-2", "line-3", "tagline", "hold", "collapse"].includes(introStep ?? "");
  const showLine3 = ["line-3", "tagline", "hold", "collapse"].includes(introStep ?? "");
  // Tagline: present from tagline through collapse; absent in complete.
  const showTagline = ["tagline", "hold", "collapse"].includes(introStep ?? "");

  // ── Render ──────────────────────────────────────────────────────────────

  // SSR / pre-resolution: render nothing visible (body background shows)
  if (introStep === null) {
    return (
      <div className="flex flex-col flex-1 px-6 pt-16 sm:pt-24 pb-12 sm:pb-20">
        <main className="w-full max-w-2xl lg:max-w-3xl mx-auto flex flex-col gap-12" />
      </div>
    );
  }

  return (
    // Stable top-anchored layout: pt-16/sm:pt-24 pins the header to a fixed
    // vertical position. No justify-center — the header does not shift when
    // the form mounts. The FLIP measurement at brand-large therefore captures
    // the true final destination and there is no layout jump at complete.
    <div className="flex flex-col flex-1 px-6 pt-16 sm:pt-24 pb-12 sm:pb-20">
      <main className="w-full max-w-2xl lg:max-w-3xl mx-auto flex flex-col gap-12">

        {/* ── Brand header ───────────────────────────────────────────────
            One WishIdea element lives in the DOM for the entire session.

            During brand-large / brand-settle: a <span> displaced outward by
            the measured FLIP transform, appearing large and centred, then
            gliding back via CSS transition to its stable header position.

            In complete state: replaced by a <button> replay trigger.

            Never aria-hidden — it is the sole brand element in the DOM.
        ── */}
        <header className="text-center flex flex-col gap-4 sm:gap-5" style={{ overflow: "visible" }}>

          {isComplete ? (
            <button
              ref={brandTriggerRef}
              type="button"
              style={{ fontSize: "32.36px" }}
              onClick={replayIntro}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  replayIntro();
                }
              }}
              aria-label="WishIdea — replay intro"
              className={[
                "text-sm font-light tracking-[0.5em] uppercase text-[var(--muted)]",
                "pb-4 mb-2 border-b border-[var(--border)]",
                "cursor-pointer bg-transparent border-x-0 border-t-0 w-full",
                "hover:text-[var(--foreground)] transition-colors duration-200",
                "focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-4",
              ].join(" ")}
            >
              WishIdea
            </button>
          ) : (
            // overflow:visible prevents the displaced brand from being clipped
            <p className="pb-4 mb-2 border-b border-[var(--border)]" style={{ overflow: "visible" }}>
              <span
                ref={brandRef}
                className={[
                  "inline-block font-light tracking-[0.5em] uppercase text-[var(--muted)] text-lg",
                  // Opacity-only entrance — wc-brand-enter must NOT animate transform
                  // because the FLIP has exclusive control of transform here.
                  isBrandLarge ? "wc-brand-enter" : "",
                  // Adds transition:transform so the element glides back to header
                  isBrandSettling ? "wc-brand-settle" : "",
                  // Bloom animation — fires after collapse, condenses intro into brand
                  isBlooming ? "wc-brand-bloom" : "",
                  // Block pointer events while the element is displaced
                  (isBrandLarge || isBrandSettling) ? "pointer-events-none" : "",
                ].join(" ")}
                style={{
                  transformOrigin: "center center",
                  transform: brandTransform,
                }}
              >
                WishIdea
              </span>
            </p>
          )}

          {/* Headline — present only from line-1 through collapse.
              Absent during brand-large, brand-settle, and complete.
              Prevents any visual overlap with the displaced brand.

              During collapse, wc-fade-up is removed and collapse classes
              take over, avoiding animation/transition property conflict. */}
          {showLine1 && (
            <h1 className="text-5xl sm:text-7xl font-light tracking-tight text-[var(--foreground)] leading-[1.1]">
              <span className={isCollapsing
                ? "block wc-collapse-line wc-collapse-line-1"
                : "block wc-fade-up"}
              >
                Your idea.
              </span>
              {showLine2 && (
                <span className={isCollapsing
                  ? "block wc-collapse-line wc-collapse-line-2"
                  : "block wc-fade-up"}
                >
                  Your voice.
                </span>
              )}
              {showLine3 && (
                <span className={isCollapsing
                  ? "block wc-collapse-line wc-collapse-line-3"
                  : "block wc-fade-up"}
                >
                  Your universe.
                </span>
              )}
            </h1>
          )}

          {/* Tagline — present only from tagline through collapse.
              Absent in complete state — the full hero is an intro experience only.
              During collapse, wc-fade-up is removed to avoid property conflict. */}
          {showTagline && (
            <p className={isCollapsing
              ? "text-xs italic tracking-widest text-[var(--muted)] mt-1 wc-collapse-tagline"
              : "text-xs italic tracking-widest text-[var(--muted)] mt-1 wc-fade-up"}
            >
              Bring the spark. We shape the universe.
            </p>
          )}

        </header>

        {/* ── Usable interface ────────────────────────────────────────────
            Only in DOM when intro is complete. Conditional render keeps all
            interactive controls out of the tab order during the intro. */}
        {isComplete && (
          <>
            {!uiText && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 text-center">
                  <h2 className="text-sm font-light tracking-[0.35em] uppercase text-[var(--foreground)]">
                    Choose interface language
                  </h2>

                  <p className="text-xs text-[var(--muted)]">
                    Escolha o idioma · Elige el idioma · 选择界面语言
                  </p>
                </div>

                <div ref={interfaceLangRef} className="relative">
                  <button
                    ref={interfaceTriggerRef}
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={interfaceLanguageOpen}
                    aria-controls="interface-language-listbox"
                    onKeyDown={handleInterfaceTriggerKeyDown}
                    onClick={() =>
                      interfaceLanguageOpen
                        ? closeInterfaceMenu(false)
                        : openInterfaceMenu()
                    }
                    className={[
                      "w-full flex items-center justify-between gap-3",
                      "rounded-lg border border-[var(--border-soft)] bg-transparent",
                      "px-4 py-3 text-sm text-[var(--foreground)]",
                      "transition-colors hover:border-[var(--muted)]",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xs font-semibold tracking-widest text-[var(--accent)] w-12 text-left">
                        {selectedInterfaceOption.code}
                      </span>

                      <span>{selectedInterfaceOption.label}</span>
                    </span>

                    <svg
                      aria-hidden="true"
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      style={{
                        transform: interfaceLanguageOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 150ms",
                      }}
                    >
                      <path
                        d="M1 1l5 5 5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {interfaceLanguageOpen && (
                    <ul
                      ref={interfaceListboxRef}
                      id="interface-language-listbox"
                      role="listbox"
                      aria-activedescendant={`interface-lang-opt-${INTERFACE_LANGUAGE_OPTIONS[interfaceFocusedIdx].value}`}
                      tabIndex={0}
                      onKeyDown={handleInterfaceListKeyDown}
                      onBlur={handleInterfaceListBlur}
                      className={[
                        "absolute z-10 mt-1 w-full",
                        "rounded-lg border border-[var(--border-soft)]",
                        "bg-[var(--surface)]/90 backdrop-blur-md",
                        "shadow-[0_8px_32px_rgba(0,0,0,0.55)]",
                        "py-1 overflow-hidden",
                        "focus:outline-none",
                      ].join(" ")}
                    >
                      {INTERFACE_LANGUAGE_OPTIONS.map((opt, idx) => (
                        <li
                          key={opt.value}
                          id={`interface-lang-opt-${opt.value}`}
                          role="option"
                          aria-selected={interfaceLanguage === opt.value}
                          onClick={() => selectInterfaceOption(opt.value)}
                          onMouseEnter={() => setInterfaceFocusedIdx(idx)}
                          className={[
                            "flex items-center justify-between gap-3 px-4 py-2.5",
                            "text-sm cursor-pointer select-none transition-colors",
                            interfaceFocusedIdx === idx
                              ? "border-l-2 border-l-[var(--accent)] bg-[var(--accent)]/15"
                              : "border-l-2 border-l-transparent hover:bg-[var(--accent)]/10",
                          ].join(" ")}
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-xs font-semibold tracking-widest text-[var(--accent)] w-12 text-left">
                              {opt.code}
                            </span>

                            <span>{opt.label}</span>
                          </span>

                          {interfaceLanguage === opt.value && (
                            <svg
                              aria-hidden="true"
                              width="14"
                              height="11"
                              viewBox="0 0 14 11"
                            >
                              <path
                                d="M1 5.5l4 4L13 1"
                                stroke="var(--accent)"
                                strokeWidth="1.8"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {interfaceLanguage === "other" && (
                  <div className="flex flex-col gap-3">
                    <label
                      htmlFor="interfaceOtherLanguage"
                      className="text-xs font-light tracking-[0.35em] uppercase text-[var(--muted)]"
                    >
                      Specify interface language
                    </label>

                    <input
                      id="interfaceOtherLanguage"
                      type="text"
                      value={interfaceOtherLanguage}
                      onChange={e => setInterfaceOtherLanguage(e.target.value)}
                      placeholder="Khmer, Japanese, Arabic, Korean..."
                      className={[
                        "w-full rounded-lg",
                        "border border-[var(--border-soft)] bg-transparent",
                        "px-4 py-3 text-sm text-[var(--foreground)]",
                        "placeholder:text-[var(--muted)]",
                        "focus:border-[var(--accent)] focus:outline-none",
                        "transition-colors",
                      ].join(" ")}
                    />
                    <button
                      type="button"
                      onClick={handleInterfaceOtherLanguage}
                      disabled={interfaceLoading}
                      aria-busy={interfaceLoading}
                      className={[
                        "w-full rounded-lg py-3 px-4",
                        "bg-[var(--accent)] text-white",
                        "text-xs font-semibold tracking-widest uppercase",
                        "hover:bg-[var(--accent-dim)]",
                        "transition-colors",
                        "disabled:opacity-60 disabled:cursor-not-allowed",
                        interfaceLoading ? "wc-loading-btn" : "",
                      ].join(" ")}
                    >
                      {interfaceLoading ? "Loading interface…" : "Use this language"}
                    </button>

                    {interfaceError && !interfaceLoading && (
                      <p
                        role="alert"
                        className="text-xs text-center text-[var(--muted)]"
                      >
                        {interfaceError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            {uiText && stage === "input" && (
              <div className="flex flex-col gap-10">

                {/* 01 — Idea source */}
                <fieldset>
                  <legend className="flex items-center gap-3 text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)] mb-5">
                    <span className="font-mono text-[10px] text-[var(--accent)] opacity-50 tracking-widest">01</span>
                    {uiText.ideaSource}
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "own", label: uiText.ownIdea },
                      { id: "follower", label: uiText.followerSuggestion },
                      { id: "comment", label: uiText.audienceComment },
                      { id: "question", label: uiText.audienceQuestion },
                    ].map(({ id, label }) => (
                      <label
                        key={id}
                        htmlFor={id}
                        className={[
                          "relative flex items-center gap-3 cursor-pointer",
                          "rounded-lg border border-[var(--border)] px-4 py-3",
                          "text-sm text-[var(--foreground)]",
                          "has-[:checked]:border-[var(--accent)]",
                          "has-[:checked]:bg-[var(--accent)]/15",
                          "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--accent)] has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[var(--background)]",
                          "hover:border-[var(--muted)] transition-colors",
                        ].join(" ")}
                      >
                        <input
                          type="radio"
                          id={id}
                          name="ideaSource"
                          value={id}
                          checked={ideaSource === id}
                          onChange={() => setIdeaSource(id)}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={[
                            "shrink-0 w-4 h-4 rounded-full border-2 transition-all",
                            "border-[var(--muted)]",
                            "peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)]",
                            "peer-checked:shadow-[inset_0_0_0_3px_var(--background)]",
                          ].join(" ")}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* 02 — Creative spark */}
                <div className="flex flex-col gap-3">
                  <label
                    htmlFor="sparkInput"
                    className="flex items-center gap-3 text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]"
                  >
                    <span className="font-mono text-[10px] text-[var(--accent)] opacity-50 tracking-widest">02</span>
                    {uiText.creativeSpark}
                  </label>
                  <textarea
                    ref={sparkTextareaRef}
                    id="sparkInput"
                    name="sparkInput"
                    rows={6}
                    value={creativeSpark}
                    onChange={e => setCreativeSpark(e.target.value)}
                    placeholder={uiText.creativeSparkPlaceholder}
                    className={[
                      "w-full resize-none rounded-xl",
                      "border border-[var(--border-soft)] bg-[var(--surface)]",
                      "px-5 py-4 text-base text-[var(--foreground)]",
                      "placeholder:text-[var(--muted)]",
                      "shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
                      "focus:border-[var(--accent)] focus:outline-none",
                      "focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_0_24px_rgba(139,124,248,0.12)]",
                      "transition-shadow transition-colors duration-200",
                    ].join(" ")}
                  />
                </div>

                {/* 03 — Output language */}
                <div className="flex flex-col gap-3">
                  <span
                    id="lang-label"
                    className="flex items-center gap-3 text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]"
                  >
                    <span className="font-mono text-[10px] text-[var(--accent)] opacity-50 tracking-widest">03</span>
                    {uiText.outputLanguage}
                  </span>

                  <div ref={langRef} className="relative">
                    <button
                      ref={triggerRef}
                      id="outputLang"
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={langOpen}
                      aria-controls="lang-listbox"
                      aria-labelledby="lang-label outputLang"
                      onKeyDown={handleTriggerKeyDown}
                      onClick={() => (langOpen ? closeMenu(false) : openMenu())}
                      className={[
                        "w-full flex items-center justify-between gap-3",
                        "rounded-lg border border-[var(--border-soft)] bg-transparent",
                        "px-4 py-3 text-sm text-[var(--foreground)]",
                        "transition-colors hover:border-[var(--muted)]",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-xs font-semibold tracking-widest text-[var(--accent)] w-12 text-left">
                          {selectedOption.code}
                        </span>
                        <span>{selectedOption.label}</span>
                      </span>
                      <svg
                        aria-hidden="true"
                        width="12"
                        height="8"
                        viewBox="0 0 12 8"
                        style={{ transform: langOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms" }}
                      >
                        <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5"
                          fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {langOpen && (
                      <ul
                        ref={listboxRef}
                        id="lang-listbox"
                        role="listbox"
                        aria-labelledby="lang-label"
                        aria-activedescendant={`lang-opt-${LANG_OPTIONS[focusedIdx].value}`}
                        tabIndex={0}
                        onKeyDown={handleListKeyDown}
                        onBlur={handleListBlur}
                        className={[
                          "absolute z-10 mt-1 w-full",
                          "rounded-lg border border-[var(--border-soft)]",
                          "bg-[var(--surface)]/90 backdrop-blur-md",
                          "shadow-[0_8px_32px_rgba(0,0,0,0.55)]",
                          "py-1 overflow-hidden",
                          "focus:outline-none",
                        ].join(" ")}
                      >
                        {LANG_OPTIONS.map((opt, idx) => (
                          <li
                            key={opt.value}
                            id={`lang-opt-${opt.value}`}
                            role="option"
                            aria-selected={outputLang === opt.value}
                            onClick={() => selectOption(opt.value)}
                            onMouseEnter={() => setFocusedIdx(idx)}
                            className={[
                              "flex items-center justify-between gap-3 px-4 py-2.5",
                              "text-sm cursor-pointer select-none transition-colors",
                              focusedIdx === idx
                                ? "border-l-2 border-l-[var(--accent)] bg-[var(--accent)]/15"
                                : "border-l-2 border-l-transparent hover:bg-[var(--accent)]/10",
                            ].join(" ")}
                          >
                            <span className="flex items-center gap-3">
                              <span className="text-xs font-semibold tracking-widest text-[var(--accent)] w-12 text-left">
                                {opt.code}
                              </span>
                              <span>{opt.label}</span>
                            </span>
                            {outputLang === opt.value && (
                              <svg aria-hidden="true" width="14" height="11" viewBox="0 0 14 11">
                                <path d="M1 5.5l4 4L13 1" stroke="var(--accent)" strokeWidth="1.8"
                                  fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {outputLang === "other" && (
                    <div className="flex flex-col gap-2 mt-1">
                      <label
                        htmlFor="otherLang"
                        className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]"
                      >
                        {uiText.specifyLanguage}
                      </label>
                      <input
                        type="text"
                        id="otherLang"
                        name="otherLang"
                        value={otherLanguage}
                        onChange={e => setOtherLanguage(e.target.value)}
                        placeholder={uiText.languagePlaceholder}
                        className={[
                          "w-full rounded-lg",
                          "border border-[var(--border-soft)] bg-transparent",
                          "px-4 py-3 text-sm text-[var(--foreground)]",
                          "placeholder:text-[var(--muted)]",
                          "focus:border-[var(--accent)] focus:outline-none",
                          "transition-colors",
                        ].join(" ")}
                      />
                    </div>
                  )}
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  aria-busy={loading}
                  className={[
                    "w-full rounded-xl py-4 px-6",
                    "bg-[var(--accent)] text-white font-semibold tracking-widest text-sm uppercase",
                    "shadow-[0_0_48px_rgba(139,124,248,0.35),0_0_12px_rgba(201,169,110,0.12),inset_0_1px_0_rgba(255,255,255,0.12)]",
                    "hover:bg-[var(--accent-dim)] hover:shadow-[0_0_64px_rgba(139,124,248,0.45),0_0_16px_rgba(201,169,110,0.15),inset_0_1px_0_rgba(255,255,255,0.12)]",
                    "active:scale-[0.98]",
                    "transition-all duration-200",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    loading ? "wc-loading-btn" : "",
                  ].join(" ")}
                >
                  {loading ? uiText.shaping : uiText.shapeMyUniverse}
                </button>

                {loading && (
                  <p
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    className="text-sm text-center text-[var(--muted)]"
                  >
                    {uiText.generatingCreativeDna}
                  </p>
                )}

                {dnaError && !loading && (
                  <p role="alert" className="text-sm text-center text-[var(--muted)]">
                    {dnaError}
                  </p>
                )}

              </div>
            )}

            {/* ── Result stage ── */}
            {uiText && stage === "result" && dna && (
              <div className="flex flex-col gap-12">

                <div className="flex items-center gap-3">
                  <h2
                    ref={resultHeadingRef}
                    tabIndex={-1}
                    className={[
                      "text-xs font-light tracking-[0.5em] uppercase text-[var(--muted)]",
                      "focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-4",
                    ].join(" ")}
                  >
                    {uiText.creativeDna}
                  </h2>
                  <span className="text-xs font-semibold tracking-widest text-[var(--accent)] border border-[var(--border-soft)] rounded px-2 py-0.5">
                    {selectedOption.code}
                  </span>
                </div>

                <div className="flex flex-col gap-4 pt-6 border-t" style={{ borderColor: "var(--border-gold-soft)" }}>
                  <h3 className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]">{uiText.coreIdea}</h3>
                  <p className="text-3xl sm:text-4xl font-light text-[var(--foreground)] leading-snug tracking-tight">
                    {dna.coreIdea}
                  </p>
                </div>

                <section
                  aria-labelledby="spark-interpretation-heading"
                  className="flex flex-col gap-6 pt-5 border-t border-[var(--border)] sm:pl-4"
                >
                  <h3 id="spark-interpretation-heading" className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]">
                    {uiText.sparkInterpretation}
                  </h3>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-light tracking-[0.35em] uppercase" style={{ color: "var(--muted-dim)" }}>{uiText.message}</h4>
                    <p className="text-sm text-[var(--foreground)] leading-relaxed">{dna.message}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-light tracking-[0.35em] uppercase" style={{ color: "var(--muted-dim)" }}>{uiText.mood}</h4>
                    <p className="text-sm text-[var(--foreground)] leading-relaxed">{dna.mood}</p>
                  </div>
                </section>

                <section
                  aria-labelledby="audience-voice-heading"
                  className="flex flex-col gap-6 pt-5 border-t border-[var(--border)] sm:pl-4"
                >
                  <h3 id="audience-voice-heading" className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]">
                    {uiText.audienceVoice}
                  </h3>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-light tracking-[0.35em] uppercase" style={{ color: "var(--muted-dim)" }}>{uiText.audience}</h4>
                    <p className="text-sm text-[var(--foreground)] leading-relaxed">{dna.audience}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-light tracking-[0.35em] uppercase" style={{ color: "var(--muted-dim)" }}>{uiText.tone}</h4>
                    <p className="text-sm text-[var(--foreground)] leading-relaxed">{dna.tone}</p>
                  </div>
                </section>

                <section
                  aria-labelledby="creative-plan-heading"
                  className="flex flex-col gap-6 pt-5 border-t border-[var(--border)] sm:pl-4"
                >
                  <h3 id="creative-plan-heading" className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]">
                    {uiText.creativePlan}
                  </h3>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-light tracking-[0.35em] uppercase" style={{ color: "var(--muted-dim)" }}>{uiText.creativeDirection}</h4>
                    <p className="text-base text-[var(--foreground)] leading-relaxed">{dna.creativeDirection}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-light tracking-[0.35em] uppercase" style={{ color: "var(--muted-dim)" }}>{uiText.suggestedFormats}</h4>
                    <ul className="flex flex-wrap gap-2" aria-label={uiText.suggestedFormats}>
                      {dna.suggestedFormats.map(f => (
                        <li key={f} className="text-xs tracking-wide border border-[var(--border-soft)] text-[var(--foreground)] rounded-full px-3 py-1.5">{f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-light tracking-[0.35em] uppercase" style={{ color: "var(--muted-dim)" }}>{uiText.recommendedPlatforms}</h4>
                    <ul className="flex flex-wrap gap-2" aria-label={uiText.recommendedPlatforms}>
                      {dna.recommendedPlatforms.map(p => (
                        <li key={p} className="text-xs tracking-wide border text-[var(--muted)] rounded-full px-3 py-1.5" style={{ borderColor: "var(--border-gold-soft)" }}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </section>

                <div className="pt-6 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => { setStage("input"); setDna(null); setDnaError(null); }}
                    className="text-xs tracking-widest uppercase text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {uiText.editCreativeSpark}
                  </button>
                </div>

              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}
