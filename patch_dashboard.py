import re

with open("src/app/branddashboard/page.tsx", "r") as f:
    content = f.read()

# 1. State Variables
state_injection = """  const [payoutingInvoiceId, setPayoutingInvoiceId] = useState<string | null>(null);

  // Embedded Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentRail, setPaymentRail] = useState("ACH");
  const [paymentTerm, setPaymentTerm] = useState("Pay Now");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
"""
content = content.replace("  const [payoutingInvoiceId, setPayoutingInvoiceId] = useState<string | null>(null);", state_injection)

# 2. handleProcessPayment
handle_pay_all_start = content.find("  const handlePayAll = async () => {")
handle_pay_all_end = content.find("  const handleWithdraw = async () => {", handle_pay_all_start)

if handle_pay_all_start != -1 and handle_pay_all_end != -1:
    func_injection = """  const handlePayAll = async () => {
    setIsPayingAll(true);
    for (const inv of widgetInvoices) {
      if (inv.status === "pending") {
        await updateInvoiceStatus(inv.id, "paid", "pending");
      }
    }
    setIsPayingAll(false);
    window.dispatchEvent(new Event("syncBrandDashboard"));
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    try {
      const selectedInvoicesList = widgetInvoices.filter(i => selectedIds.includes(i.id));
      for (const inv of selectedInvoicesList) {
        if (inv.status === "pending") {
          await updateInvoiceStatus(inv.id, "paid", "pending");
        }
      }
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsCheckoutOpen(false);
        setIsSuccess(false);
        setSelectedIds([]);
        window.dispatchEvent(new Event("syncBrandDashboard"));
      }, 2000);
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

"""
    content = content[:handle_pay_all_start] + func_injection + content[handle_pay_all_end:]

# 3. CRM Widget Replacement
crm_start = content.find("{/* CRM Invoices Widget */}")
crm_end = content.find("</div>\n\n        {/* Right Column", crm_start)
if crm_start != -1 and crm_end != -1:
    new_crm_widget = """{/* Embedded Invoices Table */}
          <div className="bg-[#050505] rounded-2xl border border-white/20 shadow-sm overflow-hidden mt-6">
            <div className="p-6 border-b border-white/20 bg-white/[0.01] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight">agncypay</span>
                <span className="text-neutral-500 font-medium text-xs">•</span>
                <span className="text-neutral-400 font-semibold text-xs">
                  {workspaceType === "brand" ? "Invoices for your brand" : "Invoices sent to brand"}
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/20 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-[#8f8f8f]">
                    <th className="p-4">
                      {workspaceType === "brand" && (
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 accent-white rounded border-white/20 bg-transparent"
                          onChange={(e) => {
                            const pendingInvs = widgetInvoices.filter(i => i.status === "pending");
                            setSelectedIds(e.target.checked ? pendingInvs.map(i => i.id) : []);
                          }}
                          checked={selectedIds.length > 0 && selectedIds.length === widgetInvoices.filter(i => i.status === "pending").length}
                        />
                      )}
                    </th>
                    <th className="py-4 font-semibold">Invoice</th>
                    <th className="py-4 font-semibold">Payee</th>
                    <th className="py-4 font-semibold">Job</th>
                    <th className="py-4 font-semibold">Total</th>
                    <th className="py-4 pr-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {widgetInvoices.map((inv) => {
                    const isSelected = selectedIds.includes(inv.id);
                    return (
                      <tr key={inv.id} className={`transition-colors hover:bg-white/[0.02] ${isSelected ? "bg-white/[0.05]" : ""}`}>
                        <td className="p-4">
                          {workspaceType === "brand" && inv.status === "pending" && (
                            <input 
                              type="checkbox" 
                              className="h-4 w-4 accent-white rounded border-white/20 bg-transparent"
                              checked={isSelected}
                              onChange={(e) => {
                                setSelectedIds(curr => 
                                  curr.includes(inv.id) ? curr.filter(id => id !== inv.id) : [...curr, inv.id]
                                );
                              }}
                            />
                          )}
                        </td>
                        <td className="py-4 text-xs font-mono text-[#8f8f8f]">{inv.id.substring(0,8).toUpperCase()}</td>
                        <td className="py-4">
                          <p className="font-bold text-white">{inv.agency}</p>
                        </td>
                        <td className="py-4">
                          <p className="text-white font-medium">{inv.campaign}</p>
                          <p className="text-[10px] text-[#8f8f8f]">Due {inv.dueDate}</p>
                        </td>
                        <td className="py-4 font-bold text-white">
                          ${(inv.amount * (workspaceType === "brand" ? 1.015 : 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 pr-4">
                          {inv.status === "pending" ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#261603] text-[#ff8a00] border border-[#ff8a00]/20">Awaiting</span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#082315] text-[#10b95f] border border-[#10b95f]/20">Paid</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {workspaceType === "brand" && selectedIds.length > 0 && (
              <div className="p-4 bg-[#111] border-t border-white/20 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-white">{selectedIds.length} invoice(s) selected</p>
                  <p className="text-[11px] text-[#8f8f8f]">Ready for batch payment.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedIds([])} className="px-4 py-2 text-xs font-bold text-white hover:bg-white/10 rounded-lg transition-colors">Clear</button>
                  <button onClick={() => setIsCheckoutOpen(true)} className="px-4 py-2 text-xs font-bold bg-white text-black hover:bg-neutral-200 rounded-lg flex items-center gap-2 transition-colors">
                    <ShieldCheck className="w-4 h-4" /> Batch Pay
                  </button>
                </div>
              </div>
            )}
          </div>
"""
    content = content[:crm_start] + new_crm_widget + content[crm_end:]

# 4. Inject Modal at the end
checkout_modal = """
      {/* Embedded Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end text-black">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isProcessing && setIsCheckoutOpen(false)}></div>
          <div className="relative w-full md:w-[500px] h-full bg-[#F8FAFC] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="h-20 border-b border-black/5 flex items-center justify-between px-8 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-5 h-5 text-[#38BDF8]" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-[#0F172A] leading-tight">AGNCYPay Checkout</h2>
                  <p className="text-[12px] text-[#64748B] font-medium">Secure embedded payment</p>
                </div>
              </div>
              <button disabled={isProcessing} onClick={() => setIsCheckoutOpen(false)} className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-black/5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="mb-8">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#64748B] mb-4">Payment Summary</h3>
                <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm">
                  {widgetInvoices.filter(i => selectedIds.includes(i.id)).map(inv => (
                    <div key={inv.id} className="flex justify-between items-center text-sm mb-3">
                      <div className="flex flex-col">
                        <span className="font-semibold">{inv.agency}</span>
                        <span className="text-[#64748B] text-xs font-mono">{inv.id.substring(0,8)}</span>
                      </div>
                      <span className="font-semibold">${(inv.amount * 1.015).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-black/5 flex justify-between items-center">
                    <span className="font-bold">Total to Pay</span>
                    <span className="text-xl font-black">${widgetInvoices.filter(i => selectedIds.includes(i.id)).reduce((sum, inv) => sum + (inv.amount * 1.015), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#64748B] mb-4">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  {["ACH", "Wire", "RTP", "USDC"].map(rail => (
                    <button key={rail} onClick={() => setPaymentRail(rail)} className={`p-4 rounded-xl border text-left transition-all ${paymentRail === rail ? "border-[#0F172A] bg-white shadow-md ring-1 ring-[#0F172A]" : "border-black/10 hover:bg-white"}`}>
                      <div className="font-bold text-sm text-[#0F172A]">{rail}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#64748B] mb-4">Payment Terms</h3>
                <div className="bg-white p-1 rounded-xl border border-black/5 flex shadow-sm">
                  {["Pay Now", "Net-30", "Net-60", "Installments"].map(term => (
                    <button key={term} onClick={() => setPaymentTerm(term)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${paymentTerm === term ? "bg-[#0F172A] text-white shadow-md" : "text-[#64748B] hover:text-[#0F172A]"}`}>
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-white border-t border-black/5 shrink-0">
              <button onClick={handleProcessPayment} disabled={isProcessing || isSuccess} className={`w-full h-14 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-lg ${isSuccess ? "bg-emerald-500 text-white" : "bg-[#0F172A] text-white hover:-translate-y-0.5"}`}>
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : isSuccess ? <><Check className="w-5 h-5" /> Successful</> : <>Authorize Payment</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
"""
content = content.replace("    </main>", checkout_modal)

# 5. Inject Cards into Right Column
queue_start = content.find('<div id="approval-queue-section" className="lg:col-span-4 space-y-6">')
if queue_start != -1:
    cards_widget = """<div id="approval-queue-section" className="lg:col-span-4 space-y-6">
          
          {/* Brand Cards Widget */}
          {workspaceType === "brand" && (
            <div className="bg-[#050505] rounded-2xl border border-white/20 p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#8f8f8f] pb-3 border-b border-white/20">
                Attached Cards
              </h3>
              <div className="mt-4 space-y-4">
                <div className="relative h-36 w-full rounded-xl overflow-hidden shadow-lg border border-white/10 group cursor-pointer hover:border-white/30 transition-colors bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-4 text-white">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/3"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <span className="text-xs font-bold text-white/70">Corporate Expense</span>
                    <CreditCard className="w-5 h-5 text-white/50" />
                  </div>
                  <div className="mt-4 relative z-10">
                    <span className="text-lg font-mono tracking-widest text-white">**** **** **** 8821</span>
                  </div>
                  <div className="mt-2 flex justify-between items-end relative z-10">
                    <span className="text-xs font-bold">{state.workspaces.find(w => w.id === state.activeWorkspaceId)?.name || "Adidas"}</span>
                    <span className="text-[10px] font-semibold text-white/70">VISA</span>
                  </div>
                </div>
              </div>
            </div>
          )}
"""
    content = content.replace('<div id="approval-queue-section" className="lg:col-span-4 space-y-6">', cards_widget)

with open("src/app/branddashboard/page.tsx", "w") as f:
    f.write(content)
