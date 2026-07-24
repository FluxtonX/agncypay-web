import os
import re

agency_portal_files = [
    "src/app/agencydashboard/page.tsx",
    "src/app/agencydashboard/invoices/page.tsx",
    "src/app/agencydashboard/invoices/[invoiceId]/page.tsx"
]

agency_banking_files = [
    "src/app/agencydashboard/agencybanking/page.tsx",
    "src/app/agencydashboard/nodes/page.tsx",
    "src/app/agencydashboard/analytics/page.tsx"
]

def remove_from_nav(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Rename 'Sent Invoices' to 'Invoice History'
    content = content.replace('"Sent Invoices"', '"Invoice History"')
    content = content.replace('>Sent Invoices<', '>Invoice History<')

    # Remove Payout Split Nodes and Agency Earnings buttons
    nodes_btn_pattern = re.compile(
        r'<button[^>]*onClick=\{\(\) => router\.push\("/agencydashboard/nodes"\)\}[^>]*>.*?</button>',
        re.MULTILINE | re.DOTALL
    )
    content = nodes_btn_pattern.sub('', content)
    
    analytics_btn_pattern = re.compile(
        r'<button[^>]*onClick=\{\(\) => router\.push\("/agencydashboard/analytics"\)\}[^>]*>.*?</button>',
        re.MULTILINE | re.DOTALL
    )
    content = analytics_btn_pattern.sub('', content)

    with open(filepath, 'w') as f:
        f.write(content)

def update_banking_nav(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f:
        content = f.read()
        
    nav_pattern = re.compile(r'<nav className="hidden lg:flex items-center gap-1 bg-white/\[0\.03\] p-1 rounded-full border border-white/20">.*?</nav>', re.DOTALL)
    
    active_class = 'className="px-4 py-1.5 rounded-full text-xs font-bold bg-white light:bg-[#0F172A] text-black light:text-white shadow-sm border border-white/20 light:border-black/10 transition-all cursor-pointer"'
    inactive_class = 'className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer"'

    def get_class(path, target):
        return active_class if path == target else inactive_class

    path_identifier = ""
    if "agencybanking" in filepath: path_identifier = "banking"
    elif "nodes" in filepath: path_identifier = "nodes"
    elif "analytics" in filepath: path_identifier = "analytics"

    new_nav = f'''<nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/20">
            <button 
              onClick={{() => router.push("/agencydashboard/agencybanking")}}
              {get_class(path_identifier, 'banking')}
            >
              Agency Banking
            </button>
            <button 
              onClick={{() => router.push("/agencydashboard/nodes")}}
              {get_class(path_identifier, 'nodes')}
            >
              {{workspaceType === "brand" ? "Settlement Nodes" : "Payout Split Nodes"}}
            </button>
            <button 
              onClick={{() => router.push("/agencydashboard/analytics")}}
              {get_class(path_identifier, 'analytics')}
            >
              {{workspaceType === "brand" ? "Analytics" : "Agency Earnings"}}
            </button>
          </nav>'''

    content = nav_pattern.sub(new_nav, content)
    
    # Change Agency Banking button on the right side to Agency Portal
    agency_banking_btn_pattern = re.compile(
        r'<button[^>]*onClick=\{\(\) => router\.push\("/agencydashboard/agencybanking"\)\}[^>]*>.*?Agency Banking\s*</button>',
        re.DOTALL
    )
    
    agency_portal_btn = '''<button
                  onClick={() => router.push("/agencydashboard")}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white light:bg-[#0F172A] text-black light:text-white hover:bg-neutral-200 light:hover:bg-[#1E293B] border border-white/20 light:border-black/10 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  Agency Portal
                </button>'''
                
    content = agency_banking_btn_pattern.sub(agency_portal_btn, content)
    
    # Note: in agencybanking/page.tsx, it might not have the right side button if it was missing or different.
    # We will check if we need to add building2 import if it's missing.
    # Usually it's there.

    with open(filepath, 'w') as f:
        f.write(content)

for fp in agency_portal_files:
    remove_from_nav(fp)

for fp in agency_banking_files:
    update_banking_nav(fp)

print("Done updating agency navigation!")
