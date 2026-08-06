with open("src/app/branddashboard/page.tsx", "r") as f:
    content = f.read()

# 1. Add missing imports
if "CreditCard," not in content:
    content = content.replace("  CheckCircle2,", "  CheckCircle2,\n  CreditCard,\n  X,")
elif "X," not in content:
    content = content.replace("  CreditCard,", "  CreditCard,\n  X,")

# 2. Add handleProcessPayment
if "const handleProcessPayment" not in content:
    func_injection = """
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
    # Let's insert it before `useEffect(() => {` inside the component
    content = content.replace("  useEffect(() => {", func_injection + "\n  useEffect(() => {")

with open("src/app/branddashboard/page.tsx", "w") as f:
    f.write(content)
