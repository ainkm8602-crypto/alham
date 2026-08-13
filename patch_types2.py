import re

with open("src/types.ts", "r") as f:
    content = f.read()

tracking_settings = """
export interface TrackingSettings {
  gtm: { enabled: boolean; containerId: string };
  ga4: { enabled: boolean; measurementId: string };
  metaPixel: { enabled: boolean; pixelId: string };
  googleAds: { enabled: boolean; conversionId: string; conversionLabel: string };
  tikTokPixel: { enabled: boolean; pixelId: string };
  customScripts: { headScript: string; bodyScript: string; footerScript: string };
}
"""

content = content.replace("export interface PaymentSettings {", tracking_settings + "\nexport interface PaymentSettings {")

with open("src/types.ts", "w") as f:
    f.write(content)

