import os
import re

files_to_update = [
    "src/app/branddashboard/page.tsx",
    "src/app/branddashboard/nodes/page.tsx",
    "src/app/branddashboard/invoices/page.tsx",
    "src/app/branddashboard/invoices/[invoiceId]/page.tsx",
    "src/app/branddashboard/analytics/page.tsx"
]

for filepath in files_to_update:
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace the conditional text
    content = content.replace('{workspaceType === "brand" ? "Settlement Nodes" : "Payout Split Nodes"}', '{workspaceType === "brand" ? "Rewards" : "Payout Split Nodes"}')
    
    # In navigation, it might just be "Settlement Nodes" in a link text
    # Look for ">Settlement Nodes<" or simply just "Settlement Nodes" where appropriate.
    # We should be careful. We can just replace "Settlement Nodes" directly, 
    # since in branddashboard we know it refers to this tab.
    
    # For invoices/page.tsx and analytics/page.tsx and nodes/page.tsx where it's hardcoded "Settlement Nodes" instead of conditional
    content = content.replace('Settlement Nodes', 'Rewards')
    
    with open(filepath, 'w') as f:
        f.write(content)

print("Done updating tab names!")
