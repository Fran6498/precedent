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

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
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

    if (i === 0) {
      parts.push(term);
    } else {
      parts.push(`${t.operator} ${term}`);
    }
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

  const addToken = () => {
    const cleaned = term.trim();
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

  const removeToken = (id: string) => {
    setTokens((prev) => prev.filter((t) => t.id !== id));
  };

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

        {/* Input bar */}
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
                onClick={addToken}
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
              (En el próximo paso conectamos el endpoint de IA. Por ahora: tu
              query está perfecta 😉)
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
