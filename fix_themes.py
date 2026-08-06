import os
import re

files_to_update = [
    "src/app/agencydashboard/agencybanking/page.tsx",
    "src/app/agencydashboard/invoices/[invoiceId]/page.tsx",
    "src/app/agencydashboard/invoices/page.tsx",
    "src/app/agencydashboard/nodes/page.tsx",
    "src/app/agencydashboard/page.tsx",
    "src/app/agencydashboard/analytics/page.tsx",
    "src/app/branddashboard/invoices/[invoiceId]/page.tsx",
    "src/app/branddashboard/invoices/page.tsx",
    "src/app/branddashboard/nodes/page.tsx",
    "src/app/branddashboard/page.tsx",
    "src/app/branddashboard/analytics/page.tsx",
    "src/app/dashboard/page.tsx"
]

def get_theme_info(filepath):
    # Determine default theme and storage key based on path
    if "agencybanking" in filepath:
        return "agncypay_theme_agencybanking", "false" # dark
    elif "branddashboard" in filepath:
        return "agncypay_theme_brand", "true" # light
    elif "agencydashboard" in filepath:
        return "agncypay_theme_agency", "true" # light
    elif "dashboard" in filepath:
        return "agncypay_theme_talent", "false" # dark
    return "agncypay_theme", "false"

use_effect_pattern = re.compile(
    r'  useEffect\(\(\) => \{\n    if \(typeof window !== "undefined"\) \{\n      setIsLightTheme\(document\.documentElement\.classList\.contains\("light"\)\);\n    \}\n  \}, \[\]\);'
)
toggle_theme_pattern = re.compile(
    r'  const toggleTheme = \(\) => \{\n    if \(typeof window !== "undefined"\) \{\n      const isLight = document\.documentElement\.classList\.toggle\("light"\);\n      setIsLightTheme\(isLight\);\n      localStorage\.setItem\("agncypay_theme", isLight \? "light" : "dark"\);\n    \}\n  \};'
)

# wait, in layout.tsx we also need to remove the initial script, or adjust it.
for filepath in files_to_update:
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r') as f:
        content = f.read()
        
    key, default_light = get_theme_info(filepath)
    
    new_use_effect = f"""  useEffect(() => {{
    if (typeof window !== "undefined") {{
      const savedTheme = localStorage.getItem("{key}");
      if (savedTheme) {{
        if (savedTheme === "light") {{
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
          setIsLightTheme(true);
        }} else {{
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
          setIsLightTheme(false);
        }}
      }} else {{
        if ({default_light}) {{
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
          setIsLightTheme(true);
        }} else {{
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
          setIsLightTheme(false);
        }}
      }}
    }}
  }}, []);"""

    new_toggle_theme = f"""  const toggleTheme = () => {{
    if (typeof window !== "undefined") {{
      const isLight = document.documentElement.classList.toggle("light");
      if (isLight) {{
        document.documentElement.classList.remove("dark");
      }} else {{
        document.documentElement.classList.add("dark");
      }}
      setIsLightTheme(isLight);
      localStorage.setItem("{key}", isLight ? "light" : "dark");
    }}
  }};"""

    content = use_effect_pattern.sub(new_use_effect, content)
    content = toggle_theme_pattern.sub(new_toggle_theme, content)
    
    with open(filepath, 'w') as f:
        f.write(content)

print("Done updating files!")
