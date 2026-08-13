import re

with open("server.ts", "r") as f:
    content = f.read()

# Add TrackingSettings to imports
content = content.replace(
    "import { PaymentSettings } from './src/types';",
    "import { PaymentSettings, TrackingSettings } from './src/types';"
)

# Add to dbState
db_settings = """
  paymentSettings: {
"""
db_settings_new = """
  trackingSettings: {
    gtm: { enabled: false, containerId: '' },
    ga4: { enabled: false, measurementId: '' },
    metaPixel: { enabled: false, pixelId: '' },
    googleAds: { enabled: false, conversionId: '', conversionLabel: '' },
    tikTokPixel: { enabled: false, pixelId: '' },
    customScripts: { headScript: '', bodyScript: '', footerScript: '' }
  },
  paymentSettings: {
"""
content = content.replace(db_settings, db_settings_new)

# Add let trackingSettings
let_settings = """let paymentSettings: PaymentSettings = dbState.paymentSettings;"""
let_settings_new = """let trackingSettings: TrackingSettings = dbState.trackingSettings;
let paymentSettings: PaymentSettings = dbState.paymentSettings;"""
content = content.replace(let_settings, let_settings_new)

# Add API endpoints
api_endpoints = """
app.get('/api/tracking-settings', (req, res) => {
  saveDb();
  res.json(trackingSettings);
});

app.put('/api/tracking-settings', (req, res) => {
  trackingSettings = { ...trackingSettings, ...req.body };
  dbState.trackingSettings = trackingSettings;
  saveDb();
  res.json(trackingSettings);
});
"""
content = content.replace("app.get('/api/payment-settings', (req, res) => {", api_endpoints + "\napp.get('/api/payment-settings', (req, res) => {")

with open("server.ts", "w") as f:
    f.write(content)

