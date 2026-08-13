import re
with open("src/components/AdminDashboard.tsx", "r") as f:
    content = f.read()

content = content.replace("  ShieldCheck,", "  ShieldCheck,\n  Mail,")

with open("src/components/AdminDashboard.tsx", "w") as f:
    f.write(content)
