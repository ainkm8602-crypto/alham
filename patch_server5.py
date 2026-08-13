import re

with open("server.ts", "r") as f:
    content = f.read()

# Replace the initial state
old_gtm = "gtm: { enabled: false, containerId: '' }"
new_gtm = "gtm: { enabled: true, containerId: 'GTM-WRRNCLCK' }"

content = content.replace(old_gtm, new_gtm)

with open("server.ts", "w") as f:
    f.write(content)
