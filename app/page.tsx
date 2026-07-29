"use client";
import { useState, useEffect, useRef } from "react";

type CreativeDNA = {
  coreIdea:             string;
  message:              string;
  mood:                 string;
  audience:             string;
  tone:                 string;
  creativeDirection:    string;
  suggestedFormats:     string[];
  recommendedPlatforms: string[];
};

export default function Home() {
  const [stage,         setStage]         = useState<"input" | "result">("input");
  const [ideaSource,    setIdeaSource]    = useState("");
  const [creativeSpark, setCreativeSpark] = useState("");
  const [outputLang,    setOutputLang]    = useState("same");
  const [otherLanguage, setOtherLanguage] = useState("");
  const [langOpen,      setLangOpen]      = useState(false);
  const [focusedIdx,    setFocusedIdx]    = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [dnaError,      setDnaError]      = useState<string | null>(null);
  const [dna,           setDna]           = useState<CreativeDNA | null>(null);

  const langRef             = useRef<HTMLDivElement>(null);
  const triggerRef          = useRef<HTMLButtonElement>(null);
  const listboxRef          = useRef<HTMLUListElement>(null);
  const resultHeadingRef    = useRef<HTMLHeadingElement>(null);
  const sparkTextareaRef    = useRef<HTMLTextAreaElement>(null);
  const hasVisitedResultRef = useRef(false);

  const LANG_OPTIONS = [
    { value: "same",  code: "AUTO", label: "Same as input" },
    { value: "en",    code: "EN",   label: "English" },
    { value: "pt",    code: "PT",   label: "Portuguese — Português" },
    { value: "es",    code: "ES",   label: "Spanish — Español" },
    { value: "zh",    code: "ZH",   label: "Chinese (Simplified) — 简体中文" },
    { value: "other", code: "+",    label: "Other language" },
  ];

  const selectedOption = LANG_OPTIONS.find(o => o.value === outputLang)!;

  // When result stage mounts: mark sentinel, focus result heading
  useEffect(() => {
    if (stage === "result") {
      hasVisitedResultRef.current = true;
      resultHeadingRef.current?.focus();
    }
  }, [stage]);

  // When input stage mounts: focus textarea only after a result visit
  useEffect(() => {
    if (stage === "input" && hasVisitedResultRef.current) {
      sparkTextareaRef.current?.focus();
    }
  }, [stage]);

  // Focus the listbox immediately after it mounts
  useEffect(() => {
    if (langOpen) {
      listboxRef.current?.focus();
    }
  }, [langOpen]);

  // Close on outside click
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
    // Tab: no branch — browser moves focus naturally; onBlur handles cleanup
  }

  function handleListBlur(e: React.FocusEvent<HTMLUListElement>) {
    if (langRef.current && langRef.current.contains(e.relatedTarget as Node)) {
      return;
    }
    setLangOpen(false);
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
        setDnaError(data.error ?? "Unable to generate Creative DNA.");
        return;
      }
      setDna(data as CreativeDNA);
      setStage("result");
    } catch {
      setDnaError("Unable to generate Creative DNA.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-16 sm:py-24">
      <main className="w-full max-w-2xl flex flex-col gap-16">

        {/* ── Brand ── */}
        <header className="text-center flex flex-col gap-6">
          <p className="text-xs font-light tracking-[0.5em] uppercase text-[var(--muted)]">
            WishCraft
          </p>
          <h1 className="text-5xl sm:text-7xl font-light tracking-tight text-[var(--foreground)] leading-[1.1]">
            Your idea.<br />Your voice.<br />Your universe.
          </h1>
          <p className="text-sm italic tracking-wide text-[var(--muted)]">
            Bring the spark. We shape the universe.
          </p>
        </header>

        {/* ── Input stage ── */}
        {stage === "input" && (
          <div className="flex flex-col gap-10">

            {/* Idea source selector */}
            <fieldset>
              <legend className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)] mb-5">
                Idea source
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "own",      label: "My own idea" },
                  { id: "follower", label: "Follower suggestion" },
                  { id: "comment",  label: "Audience comment" },
                  { id: "question", label: "Audience question" },
                ].map(({ id, label }) => (
                  <label
                    key={id}
                    htmlFor={id}
                    className={[
                      "relative flex items-center gap-3 cursor-pointer",
                      "rounded-lg border border-[var(--border-soft)] px-4 py-3",
                      "text-sm text-[var(--foreground)]",
                      "has-[:checked]:border-[var(--accent)]",
                      "has-[:checked]:bg-[var(--accent)]/10",
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

            {/* Textarea */}
            <div className="flex flex-col gap-3">
              <label
                htmlFor="sparkInput"
                className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]"
              >
                Creative spark
              </label>
              <textarea
                ref={sparkTextareaRef}
                id="sparkInput"
                name="sparkInput"
                rows={5}
                value={creativeSpark}
                onChange={e => setCreativeSpark(e.target.value)}
                placeholder="Describe the creative spark..."
                className={[
                  "w-full resize-none rounded-lg",
                  "border border-[var(--border-soft)] bg-transparent",
                  "px-4 py-3 text-sm text-[var(--foreground)]",
                  "placeholder:text-[var(--muted)]",
                  "focus:border-[var(--accent)] focus:outline-none",
                  "transition-colors",
                ].join(" ")}
              />
            </div>

            {/* Output language selector — custom accessible listbox */}
            <div className="flex flex-col gap-3">
              <span
                id="lang-label"
                className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]"
              >
                Output language
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
                    <span className="text-xs font-semibold tracking-widest text-[var(--accent)] w-8 text-left">
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
                          fill="none" strokeLinecap="round" strokeLinejoin="round"/>
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
                          <span className="text-xs font-semibold tracking-widest text-[var(--accent)] w-8 text-left">
                            {opt.code}
                          </span>
                          <span>{opt.label}</span>
                        </span>
                        {outputLang === opt.value && (
                          <svg aria-hidden="true" width="14" height="11" viewBox="0 0 14 11">
                            <path d="M1 5.5l4 4L13 1" stroke="var(--accent)" strokeWidth="1.8"
                                  fill="none" strokeLinecap="round" strokeLinejoin="round"/>
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
                    Specify language
                  </label>
                  <input
                    type="text"
                    id="otherLang"
                    name="otherLang"
                    value={otherLanguage}
                    onChange={e => setOtherLanguage(e.target.value)}
                    placeholder="Type a language..."
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
                "w-full rounded-lg py-4 px-6",
                "bg-[var(--accent)] text-white font-semibold tracking-widest text-sm uppercase",
                "shadow-[0_0_32px_rgba(139,124,248,0.25),0_0_8px_rgba(201,169,110,0.15)]",
                "hover:bg-[var(--accent-dim)] active:scale-[0.98]",
                "transition-colors duration-150",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              {loading ? "Shaping…" : "Shape My Universe"}
            </button>

            {/* Loading status — polite announcement */}
            {loading && (
              <p
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="text-sm text-center text-[var(--muted)]"
              >
                Generating your Creative DNA…
              </p>
            )}

            {/* Error — assertive announcement */}
            {dnaError && !loading && (
              <p
                role="alert"
                className="text-sm text-center text-[var(--muted)]"
              >
                {dnaError}
              </p>
            )}

          </div>
        )}

        {/* ── Result stage ── */}
        {stage === "result" && dna && (
          <div className="flex flex-col gap-12">

            {/* Result heading + language badge */}
            <div className="flex items-center gap-3">
              <h2
                ref={resultHeadingRef}
                tabIndex={-1}
                className={[
                  "text-xs font-light tracking-[0.5em] uppercase text-[var(--muted)]",
                  "focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-4",
                ].join(" ")}
              >
                Creative DNA
              </h2>
              <span className="text-xs font-semibold tracking-widest text-[var(--accent)] border border-[var(--border-soft)] rounded px-2 py-0.5">
                {selectedOption.code}
              </span>
            </div>

            {/* Core idea */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]">
                Core idea
              </h3>
              <p className="text-2xl sm:text-3xl font-light text-[var(--foreground)] leading-snug">
                {dna.coreIdea}
              </p>
            </div>

            {/* Cluster A — The spark interpretation */}
            <section
              aria-labelledby="spark-interpretation-heading"
              className="flex flex-col gap-8 pt-4 border-t border-[var(--border)]"
            >
              <h3
                id="spark-interpretation-heading"
                className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]"
              >
                The spark interpretation
              </h3>
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]">Message</h4>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                  {dna.message}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]">Mood</h4>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                  {dna.mood}
                </p>
              </div>
            </section>

            {/* Cluster B — Audience & voice */}
            <section
              aria-labelledby="audience-voice-heading"
              className="flex flex-col gap-8 pt-4 border-t border-[var(--border)]"
            >
              <h3
                id="audience-voice-heading"
                className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]"
              >
                Audience &amp; voice
              </h3>
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]">Audience</h4>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                  {dna.audience}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]">Tone</h4>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                  {dna.tone}
                </p>
              </div>
            </section>

            {/* Cluster C — Creative plan */}
            <section
              aria-labelledby="creative-plan-heading"
              className="flex flex-col gap-8 pt-4 border-t border-[var(--border)]"
            >
              <h3
                id="creative-plan-heading"
                className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]"
              >
                Creative plan
              </h3>
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]">Creative direction</h4>
                <p className="text-base text-[var(--foreground)] leading-relaxed">
                  {dna.creativeDirection}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]">Suggested formats</h4>
                <ul className="flex flex-wrap gap-2" aria-label="Suggested content formats">
                  {dna.suggestedFormats.map(f => (
                    <li
                      key={f}
                      className="text-xs tracking-wide border border-[var(--border-soft)] text-[var(--foreground)] rounded-full px-3 py-1.5"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-light tracking-[0.4em] uppercase text-[var(--muted)]">Recommended platforms</h4>
                <ul className="flex flex-wrap gap-2" aria-label="Recommended platforms">
                  {dna.recommendedPlatforms.map(p => (
                    <li
                      key={p}
                      className="text-xs tracking-wide border border-[var(--border)] text-[var(--muted)] rounded-full px-3 py-1.5"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Edit creative spark */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => { setStage("input"); setDna(null); setDnaError(null); }}
                className="text-xs tracking-widest uppercase text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                ← Edit creative spark
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
