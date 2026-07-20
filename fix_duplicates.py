import re

with open("src/app/branddashboard/page.tsx", "r") as f:
    content = f.read()

# Let's completely remove the handleProcessPayment definitions
pattern = re.compile(r"  const handleProcessPayment = async \(\) => \{[\s\S]*?  \};\n")
content = pattern.sub("", content)

# And insert it EXACTLY ONCE near the top of the component
injection_point = content.find("export default function BrandDashboardPage() {")
injection_point = content.find("  const [selectedIds, setSelectedIds] = useState<string[]>([]);", injection_point)

if injection_point != -1:
    injection_point = content.find("\n", injection_point) + 1
    
    func_injection = """  const handleProcessPayment = async () => {
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
    content = content[:injection_point] + func_injection + content[injection_point:]

with open("src/app/branddashboard/page.tsx", "w") as f:
    f.write(content)
