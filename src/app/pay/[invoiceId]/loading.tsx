export default function PayRequestLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-20 border-b border-[#111] bg-black/95">
        <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="h-10 w-32 rounded-[7px] border border-white/10 bg-white/5" />
          <div className="space-y-2">
            <div className="h-3 w-24 rounded-full bg-white/10" />
            <div className="h-5 w-48 rounded-full bg-white/10" />
          </div>
          <div className="h-10 w-28 rounded-[7px] border border-white/10 bg-white/5" />
        </div>
      </div>

      <main className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <section className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
          <div className="h-3 w-40 rounded-full bg-white/10" />
          <div className="mt-3 h-8 w-72 rounded-full bg-white/10" />
          <div className="mt-3 h-4 w-[560px] max-w-full rounded-full bg-white/10" />
        </section>

        <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(380px,0.75fr)]">
          <div className="space-y-5">
            <div className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="h-3 w-20 rounded-full bg-white/10" />
              <div className="mt-3 h-7 w-52 rounded-full bg-white/10" />
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-24 rounded-[10px] border border-[#222] bg-black" />
                ))}
              </div>
            </div>
            <div className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="h-3 w-28 rounded-full bg-white/10" />
              <div className="mt-4 h-40 rounded-[12px] border border-[#242424] bg-black" />
            </div>
          </div>
          <aside className="space-y-5">
            <div className="rounded-[13px] border border-[#2b2b2b] bg-[#050505] p-5">
              <div className="h-3 w-24 rounded-full bg-white/10" />
              <div className="mt-3 h-8 w-48 rounded-full bg-white/10" />
              <div className="mt-4 h-52 rounded-[12px] border border-[#242424] bg-black" />
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
