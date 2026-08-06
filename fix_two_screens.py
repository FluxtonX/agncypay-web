import os
import re

# 1. Update Portal side (page.tsx, invoices/page.tsx)
portal_files = [
    "src/app/agencydashboard/page.tsx",
    "src/app/agencydashboard/invoices/page.tsx"
]

for fp in portal_files:
    if not os.path.exists(fp): continue
    with open(fp, "r") as f:
        content = f.read()
    
    # Change "Agency Banking" button on right side to "Switch to Agency Banking"
    # We match the button with Landmark icon pointing to /agencydashboard/agencybanking
    old_btn = r'<Landmark className="h-3\.5 w-3\.5" />\s*Agency Banking\s*</button>'
    new_btn = '<Landmark className="h-3.5 w-3.5" />\n                  Switch to Agency Banking\n                </button>'
    content = re.sub(old_btn, new_btn, content)
    
    with open(fp, "w") as f:
        f.write(content)

# 2. Update Banking side (agencybanking/page.tsx, nodes/page.tsx, analytics/page.tsx)
banking_files = [
    "src/app/agencydashboard/agencybanking/page.tsx",
    "src/app/agencydashboard/nodes/page.tsx",
    "src/app/agencydashboard/analytics/page.tsx"
]

active_class = 'className="px-4 py-1.5 rounded-full text-xs font-bold bg-white light:bg-[#0F172A] text-black light:text-white shadow-sm border border-white/20 light:border-black/10 transition-all cursor-pointer"'
inactive_class = 'className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer"'

for fp in banking_files:
    if not os.path.exists(fp): continue
    with open(fp, "r") as f:
        content = f.read()

    # Determine active tab
    is_banking = "agencybanking" in fp
    is_nodes = "nodes" in fp
    is_analytics = "analytics" in fp

    # Replace Badge
    badge_pattern = re.compile(
        r'<div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 light:bg-black/5 border border-white/20 light:border-black/10 text-\[11px\] font-bold uppercase tracking-wider text-white light:text-\[\#0F172A\]">.*?</div>',
        re.DOTALL
    )
    new_badge = '''<div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 light:bg-black/5 border border-white/20 light:border-black/10 text-[11px] font-bold uppercase tracking-wider text-white light:text-[#0F172A]">
              <Landmark className="h-3 w-3 text-white light:text-[#0F172A]" />
              {workspaceType === "brand" ? "Brand Banking" : "Agency Banking"}
            </div>'''
    content = badge_pattern.sub(new_badge, content)

    # Replace Center Nav
    nav_pattern = re.compile(r'<nav className="hidden lg:flex items-center gap-1 bg-white/\[0\.03\] p-1 rounded-full border border-white/20">.*?</nav>', re.DOTALL)
    
    new_nav = f'''<nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/20">
            <button 
              onClick={{() => router.push("/agencydashboard/agencybanking")}}
              {active_class if is_banking else inactive_class}
            >
              Agency Banking
            </button>
            <button 
              onClick={{() => router.push("/agencydashboard/nodes")}}
              {active_class if is_nodes else inactive_class}
            >
              {{workspaceType === "brand" ? "Settlement Nodes" : "Payout Split Nodes"}}
            </button>
            <button 
              onClick={{() => router.push("/agencydashboard/analytics")}}
              {active_class if is_analytics else inactive_class}
            >
              {{workspaceType === "brand" ? "Analytics" : "Agency Earnings"}}
            </button>
          </nav>'''
    content = nav_pattern.sub(new_nav, content)

    # Replace Right Side button(s)
    if is_banking:
        # In agencybanking/page.tsx, replace the right button before Talent View
        right_btn_pattern = re.compile(
            r'<button[^>]*onClick=\{\(\) => router\.push\("/agencydashboard"\)\}[^>]*>.*?Agency Portal\s*</button>',
            re.DOTALL
        )
        new_right_btn = '''{workspaceType === "agency" && (
              <>
                <button
                  onClick={() => router.push("/agencydashboard")}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white light:bg-[#0F172A] text-black light:text-white hover:bg-neutral-200 light:hover:bg-[#1E293B] border border-white/20 light:border-black/10 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  Switch to Agency Portal
                </button>
                <div className="h-4 w-[1px] bg-white/20" />
              </>
            )}'''
        content = right_btn_pattern.sub(new_right_btn, content)
    else:
        # In nodes and analytics, replace "Agency Portal" with "Switch to Agency Portal" in the right button
        old_right_btn = r'<Building2 className="h-3\.5 w-3\.5" />\s*Agency Portal\s*</button>'
        new_right_btn = '<Building2 className="h-3.5 w-3.5" />\n                  Switch to Agency Portal\n                </button>'
        content = re.sub(old_right_btn, new_right_btn, content)

    with open(fp, "w") as f:
        f.write(content)

print("Successfully fixed both screens!")
