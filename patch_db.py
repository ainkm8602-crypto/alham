import json

with open("db.json", "r") as f:
    db = json.load(f)

db["trackingSettings"]["gtm"]["enabled"] = True
db["trackingSettings"]["gtm"]["containerId"] = "GTM-WRRNCLCK"

with open("db.json", "w") as f:
    json.dump(db, f, indent=2)

