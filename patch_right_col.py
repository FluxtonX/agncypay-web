import re

with open("src/app/branddashboard/page.tsx", "r") as f:
    text = f.read()

if " Plus," not in text and "Plus " not in text and "Plus\n" not in text:
    text = text.replace("  X,", "  X,\n  Plus,")

new_widgets = """<div id="approval-queue-section" className="lg:col-span-4 space-y-6">
          
          {/* Integrations Widget */}
          <div className="bg-[#050505] rounded-xl border border-white/10 p-5 shadow-sm">
            <h3 className="text-[15px] font-semibold text-white tracking-tight">Integrations</h3>
            <p className="text-[12px] text-neutral-400 font-medium mt-1">Connect external systems and services to sync data automatically.</p>
            
            <div className="flex items-center justify-between gap-2 mt-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-xl bg-[#00d053] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity border border-[#00d053]/50">
                  <span className="text-white font-bold text-lg tracking-tight leading-none" style={{ fontFamily: 'Georgia, serif' }}>Sage</span>
                </div>
                <span className="text-[11px] font-semibold text-neutral-400">Sage</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-xl border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors group">
                  <Plus className="w-5 h-5 text-neutral-500 group-hover:text-white transition-colors" />
                </div>
                <span className="text-[11px] font-semibold text-neutral-400">Connect</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center cursor-default">
                  <span className="text-[10px] font-bold text-neutral-600">N/A</span>
                </div>
                <span className="text-[11px] font-semibold text-neutral-600">N/A</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center cursor-default">
                  <span className="text-[10px] font-bold text-neutral-600">N/A</span>
                </div>
                <span className="text-[11px] font-semibold text-neutral-600">N/A</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center cursor-default">
                  <span className="text-[10px] font-bold text-neutral-600">N/A</span>
                </div>
                <span className="text-[11px] font-semibold text-neutral-600">N/A</span>
              </div>
            </div>
          </div>

          {/* Connected Banking Feeds */}
          <div className="bg-[#050505] rounded-xl border border-white/10 overflow-hidden shadow-sm flex flex-col">
            <div className="p-5 border-b border-white/10 bg-white/[0.01]">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#8f8f8f]">CONNECTED BANKING FEEDS</h3>
            </div>
            
            <div className="p-5 flex flex-col gap-4 border-b border-white/10 bg-white/[0.02]">
              {/* Card 1 */}
              <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-[#0A0A0A] cursor-pointer hover:border-white/20 transition-all">
                <div className="w-20 h-12 rounded-md shrink-0 border border-white/10 overflow-hidden bg-black flex items-center justify-center">
                  <img src="/cards/chase-ink-business-unlimited.png" alt="Chase" className="w-full h-full object-cover opacity-90" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-blue-900 to-black flex items-center justify-center"><span class="text-[10px] font-bold text-white">CHASE</span></div>'; }} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-white">Chase Ink Business Unlimited Visa</h4>
                  <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Visa ****86</p>
                </div>
              </div>
              
              {/* Card 2 */}
              <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-[#0A0A0A] cursor-pointer hover:border-white/20 transition-all">
                <div className="w-20 h-12 rounded-md shrink-0 border border-white/10 overflow-hidden bg-black flex items-center justify-center">
                  <img src="/cards/mercury-io.png" alt="Mercury" className="w-full h-full object-cover opacity-90" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center"><span class="text-[10px] font-bold text-white">MERCURY</span></div>'; }} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-white">Mercury Business IO Mastercard</h4>
                  <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Mastercard ****57</p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white/[0.01] flex justify-between items-center">
              <span className="text-[13px] font-semibold text-neutral-400">Plaid Available Float</span>
              <span className="text-[14px] font-bold text-white">$250,000.00</span>
            </div>
          </div>

          {/* Action Center */}
          <div className="bg-[#050505] rounded-xl border border-white/10 overflow-hidden shadow-sm min-h-[200px] flex flex-col">
            <div className="p-5 border-b border-white/10 bg-white/[0.01]">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#8f8f8f]">ACTION CENTER</h3>
            </div>
            <div className="flex-1 flex items-center justify-center p-8 bg-white/[0.02]">
              <p className="text-[13px] font-medium text-neutral-500">No pending alerts. You are all caught up!</p>
            </div>
          </div>

        </div>"""

start_idx = text.find('<div id="approval-queue-section"')
end_idx = text.find('{/* New Invoice Modal */}', start_idx)
if start_idx != -1 and end_idx != -1:
    end_idx = text.rfind('</div>', start_idx, end_idx) + 6
    text = text[:start_idx] + new_widgets + "\n\n      " + text[end_idx:]

    with open("src/app/branddashboard/page.tsx", "w") as f:
        f.write(text)
    print("Replaced successfully.")
else:
    print("Could not find boundaries.")
