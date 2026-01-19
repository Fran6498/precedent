"use client";

import { useMemo, useState } from "react";

type Lang = { code: string; label: string; enabled: boolean };
type Operator = "AND" | "OR" | "AND NOT";

type Token = {
  id: string;
  operator: Operator; // conexión con el anterior
  term: string;
  isPhrase: boolean;
};

const DEFAULT_LANGS: Lang[] = [
  { code: "en", label: "English", enabled: true },
  { code: "es", label: "Español", enabled: true },
  { code: "fr", label: "Français", enabled: false },
  { code: "de", label: "Deutsch", enabled: false },
  { code: "it", label: "Italiano", enabled: false },
  { code: "pt", label: "Português", enabled: false },
  { code: "nl", label: "Nederlands", enabled: false },
  { code: "sv", label: "Svenska", enabled: false },
  { code: "no", label: "Norsk", enabled: false },
  { code: "da", label: "Dansk", enabled: false },
  { code: "fi", label: "Suomi", enabled: false },
  { code: "pl", label: "Polski", enabled: false },
  { code: "tr", label: "Türkçe", enabled: false },
  { code: "ru", label: "Русский", enabled: false },
  { code: "ar", label: "العربية", enabled: false },
];

// Diccionario simple de sugerencias (MVP).
// Lo podés ampliar cuando quieras.
const SUGGESTIONS: Record<string, string[]> = {
  // roles
  developer: ["software engineer", "programmer", "full stack", "backend", "frontend"],
  engineer: ["software engineer", "data engineer", "platform engineer", "devops"],
  designer: ["product designer", "ux", "ui", "ux/ui", "visual designer"],
  "product designer": ["ux", "ui", "interaction design", "ux research"],
  marketer: ["marketing", "growth", "performance marketing", "brand"],
  marketing: ["growth", "performance marketing", "demand generation", "brand"],
  // skills
  data: ["analytics", "business intelligence", "sql", "python", "dashboards"],
  analytics: ["data analysis", "metrics", "tracking", "dashboard"],
  sql: ["postgres", "mysql", "bigquery", "snowflake"],
  python: ["pandas", "data science", "automation"],
  // hiring/search patterns
  remote: ["hybrid", "on-site", "distributed team"],
  "project management": ["agile", "scrum", "program management", "product operations"],
  osint: ["open source intelligence", "social listening", "investigation"],
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function Chip({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1 text-sm transition",
        selected
          ? "bg-neutral-900 text-white border-neutral-900"
          : "bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-200",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function SuggestionBubble({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-50"
      title="Agregar a la query"
    >
      + {label}
    </button>
  );
}

function TokenPill({
  token,
  onRemove,
}: {
  token: Token;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm">
      <span className="text-neutral-500">{token.operator}</span>
      <span className="font-medium text-neutral-800">
        {token.isPhrase ? `"${token.term}"` : token.term}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 rounded-full px-2 py-0.5 text-neutral-500 hover:bg-neutral-100"
        aria-label="Remove token"
        title="Remove"
      >
        ×
      </button>
    </div>
  );
}

function buildBooleanQuery(tokens: Token[]) {
  if (!tokens.length) return "";
  const parts: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const term = t.isPhrase ? `"${t.term}"` : t.term;

    if (i === 0) parts.push(term);
    else parts.push(`${t.operator} ${term}`);
  }
  return parts.join(" ");
}

export default function Page() {
  // Languages
  const [langs, setLangs] = useState<Lang[]>(DEFAULT_LANGS);
  const selectedCount = useMemo(
    () => langs.filter((l) => l.enabled).length,
    [langs]
  );

  const toggleLang = (code: string) => {
    setLangs((prev) =>
      prev.map((l) => (l.code === code ? { ...l, enabled: !l.enabled } : l))
    );
  };
  const selectAll = () =>
    setLangs((prev) => prev.map((l) => ({ ...l, enabled: true })));
  const clearAll = () =>
    setLangs((prev) => prev.map((l) => ({ ...l, enabled: false })));

  // Query builder state
  const [operator, setOperator] = useState<Operator>("AND");
  const [term, setTerm] = useState("");
  const [isPhrase, setIsPhrase] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);

  const booleanQuery = useMemo(() => buildBooleanQuery(tokens), [tokens]);

  // Suggestions based on current input (and last tokens)
  const suggestions = useMemo(() => {
    const input = normalize(term);
    if (!input) return [];

    // Try exact match first
    const exact = SUGGESTIONS[input] ?? [];

    // Also try partial key match (simple contains)
    const partialKeys = Object.keys(SUGGESTIONS).filter(
      (k) => k.includes(input) || input.includes(k)
    );
    const partial = partialKeys.flatMap((k) => SUGGESTIONS[k]);

    // De-dupe and remove items already in tokens
    const existing = new Set(tokens.map((t) => normalize(t.term)));
    const merged = [...exact, ...partial]
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !existing.has(normalize(s)));

    // unique
    return Array.from(new Set(merged)).slice(0, 10);
  }, [term, tokens]);

  const addToken = (value?: string) => {
    const cleaned = (value ?? term).trim();
    if (!cleaned) return;

    const next: Token = {
      id: uid(),
      operator: tokens.length === 0 ? "AND" : operator,
      term: cleaned,
      isPhrase: isPhrase || cleaned.includes(" "),
    };

    setTokens((prev) => [...prev, next]);
    setTerm("");
    setIsPhrase(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addToken();
    }
  };

  const removeToken = (id: string) => setTokens((prev) => prev.filter((t) => t.id !== id));
  const clearTokens = () => setTokens([]);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Boolean Query Builder</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Armá queries booleanas rápido, con sugerencias y ejemplos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">
              {selectedCount}/{langs.length} idiomas
            </span>
            <button
              type="button"
              onClick={selectAll}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              Clear
            </button>
          </div>
        </header>

        {/* Languages bar */}
        <section className="mt-6 rounded-2xl border bg-neutral-50/60 p-4">
          <div className="flex flex-wrap gap-2">
            {langs.map((l) => (
              <Chip
                key={l.code}
                selected={l.enabled}
                label={`${l.label} (${l.code})`}
                onClick={() => toggleLang(l.code)}
              />
            ))}
          </div>
        </section>

        {/* Input bar + suggestions */}
        <section className="mt-6 rounded-2xl border bg-neutral-50/60 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-600">Operador</label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value as Operator)}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
                <option value="AND NOT">AND NOT</option>
              </select>
            </div>

            <div className="flex flex-1 items-center gap-2">
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder='Escribí un término o frase (ej: "product designer")'
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => addToken()}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Agregar
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={isPhrase}
                onChange={(e) => setIsPhrase(e.target.checked)}
              />
              Forzar comillas
            </label>

            <button
              type="button"
              onClick={clearTokens}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              Limpiar
            </button>
          </div>

          {/* Suggestion bubbles */}
          <div className="mt-3">
            {term.trim() && suggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <SuggestionBubble key={s} label={s} onClick={() => addToken(s)} />
                ))}
              </div>
            ) : (
              <div className="text-sm text-neutral-500">
                Escribí algo para ver sugerencias.
              </div>
            )}
          </div>

          {/* Tokens row */}
          <div className="mt-4 flex flex-wrap gap-2">
            {tokens.length === 0 ? (
              <div className="text-sm text-neutral-500">
                Todavía no agregaste términos.
              </div>
            ) : (
              tokens.map((t) => (
                <TokenPill
                  key={t.id}
                  token={t}
                  onRemove={() => removeToken(t.id)}
                />
              ))
            )}
          </div>
        </section>

        {/* Panels */}
        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-sky-50/40 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Tu query</div>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(booleanQuery);
                }}
                disabled={!booleanQuery}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
              >
                Copiar
              </button>
            </div>

            <textarea
              readOnly
              value={booleanQuery}
              placeholder="Tu query va a aparecer acá…"
              className="mt-3 h-28 w-full resize-none rounded-xl border border-neutral-200 bg-white p-3 text-sm"
            />
          </div>

          <div className="rounded-2xl border bg-emerald-50/40 p-4">
            <div className="text-sm font-medium">Sugerencia IA</div>
            <div className="mt-2 text-sm text-neutral-600">
              (Próximo paso: conectamos IA para mejorar la query o decirte “Tu query está perfecta!”.)
            </div>
          </div>
        </section>

        {/* Examples */}
        <section className="mt-6 rounded-2xl border bg-neutral-50/60 p-4">
          <div className="text-sm">
            <div className="font-medium">Tu query buscará frases como esta:</div>
            <div className="mt-1 text-neutral-700">
              {tokens.length
                ? `Busco ${tokens
                    .slice(0, 2)
                    .map((t) => (t.isPhrase ? `"${t.term}"` : t.term))
                    .join(" y ")} en varios idiomas.`
                : "…"}
            </div>

            <div className="mt-4 font-medium">No encontrarás frases como esta:</div>
            <div className="mt-1 text-neutral-700">
              {tokens.some((t) => t.operator === "AND NOT")
                ? `Resultados que incluyan ${tokens
                    .filter((t) => t.operator === "AND NOT")
                    .slice(0, 1)
                    .map((t) => (t.isPhrase ? `"${t.term}"` : t.term))
                    .join(", ")} quedarán excluidos.`
                : "…"}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
