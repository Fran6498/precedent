"use client";

import { useMemo, useState } from "react";

type Lang = { code: string; label: string; enabled: boolean };

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

export default function Page() {
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

  const selectAll = () => setLangs((prev) => prev.map((l) => ({ ...l, enabled: true })));
  const clearAll = () => setLangs((prev) => prev.map((l) => ({ ...l, enabled: false })));

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

        {/* Rest of layout (placeholders todavía) */}
        <div className="mt-6 grid gap-6">
          <section className="rounded-2xl border bg-neutral-50/60 p-4">
            <div className="text-sm text-neutral-600">
              Barra de input + sugerencias (próximo paso)
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-sky-50/40 p-4">
              <div className="text-sm font-medium">Tu query</div>
              <div className="mt-2 text-sm text-neutral-600">
                (Acá va la query armada + botón copiar)
              </div>
            </div>

            <div className="rounded-2xl border bg-emerald-50/40 p-4">
              <div className="text-sm font-medium">Sugerencia IA</div>
              <div className="mt-2 text-sm text-neutral-600">
                (Acá va la recomendación o “Tu query está perfecta!”)
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-neutral-50/60 p-4">
            <div className="text-sm">
              <div className="font-medium">Tu query buscará frases como esta:</div>
              <div className="mt-1 text-neutral-600">…</div>

              <div className="mt-4 font-medium">No encontrarás frases como esta:</div>
              <div className="mt-1 text-neutral-600">…</div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
