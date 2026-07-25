import os
import re

files_to_clean = [
    "src/app/branddashboard/page.tsx",
    "src/app/branddashboard/invoices/page.tsx",
    "src/app/branddashboard/invoices/[invoiceId]/page.tsx",
    "src/app/branddashboard/nodes/page.tsx"
]

pattern = re.compile(
    r'\s*<button[^>]*onClick=\{\(\) => router\.push\("/branddashboard/analytics"\)\}[^>]*>.*?</button>',
    re.DOTALL
)

for fp in files_to_clean:
    if not os.path.exists(fp):
        print(f"File not found: {fp}")
        continue
    with open(fp, "r") as f:
        content = f.read()
    
    new_content, count = pattern.subn("", content)
    if count > 0:
        print(f"Removed {count} analytics button(s) from {fp}")
        with open(fp, "w") as f:
            f.write(new_content)
    else:
        print(f"No analytics button found in {fp}")

# Replace analytics/page.tsx with a server-side redirect to /branddashboard
analytics_page = "src/app/branddashboard/analytics/page.tsx"
if os.path.exists(analytics_page):
    with open(analytics_page, "w") as f:
        f.write('''import { redirect } from "next/navigation";

export default function AnalyticsDashboardPage() {
  redirect("/branddashboard");
}
''')
    print(f"Replaced {analytics_page} with redirect to /branddashboard")

