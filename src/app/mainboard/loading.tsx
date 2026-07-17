export default function MainboardLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-20 border-b border-[#111] bg-black/95">
        <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="space-y-2">
            <div className="h-3 w-24 rounded-full bg-white/10" />
            <div className="h-5 w-52 rounded-full bg-white/10" />
          </div>
          <div className="h-11 w-40 rounded-[7px] border border-white/10 bg-white/5" />
        </div>
      </div>

      <main className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[176px] rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="h-3 w-28 rounded-full bg-white/10" />
              <div className="mt-8 h-9 w-24 rounded-full bg-white/10" />
              <div className="mt-3 h-4 w-44 rounded-full bg-white/10" />
            </div>
          ))}
        </section>

        <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
          <div className="rounded-[13px] border border-[#2b2b2b] bg-[#050505]">
            <div className="flex flex-col gap-3 border-b border-[#222] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 rounded-full bg-white/10" />
                <div className="h-3 w-[320px] max-w-full rounded-full bg-white/10" />
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-28 rounded-[7px] bg-white/10" />
                <div className="h-10 w-28 rounded-[7px] bg-white/10" />
              </div>
            </div>

            <div className="overflow-hidden p-4">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[54px_minmax(0,1fr)] gap-4 rounded-[10px] border border-[#1f1f1f] bg-[#080808] p-4"
                  >
                    <div className="h-4 w-4 rounded border border-white/10 bg-white/5" />
                    <div className="space-y-3">
                      <div className="h-3 w-24 rounded-full bg-white/10" />
                      <div className="h-3 w-3/4 rounded-full bg-white/10" />
                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-10 rounded-[8px] bg-white/10" />
                        <div className="h-10 rounded-[8px] bg-white/10" />
                        <div className="h-10 rounded-[8px] bg-white/10" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="h-3 w-28 rounded-full bg-white/10" />
              <div className="mt-3 h-8 w-56 rounded-full bg-white/10" />
              <div className="mt-5 h-28 rounded-[12px] border border-[#242424] bg-black" />
            </div>
            <div className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="h-3 w-32 rounded-full bg-white/10" />
              <div className="mt-4 h-40 rounded-[12px] border border-[#242424] bg-black" />
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
