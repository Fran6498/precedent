export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Boolean Query Builder</h1>
          <div className="text-sm text-neutral-500">Idiomas (próximo paso)</div>
        </header>

        <div className="mt-8 grid gap-6">
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
