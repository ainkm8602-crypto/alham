import re

with open("server.ts", "r") as f:
    content = f.read()

# We need to insert saveDb() before res.json in any POST, PUT, DELETE routes.
# But it's easier to just append saveDb() at the end of the state change blocks.

# Let's replace res.json with { saveDb(); res.json
content = re.sub(r'res\.json\(', 'saveDb();\n  res.json(', content)

with open("server.ts", "w") as f:
    f.write(content)
