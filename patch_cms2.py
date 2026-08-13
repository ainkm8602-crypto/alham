import re

with open("src/context/CmsContext.tsx", "r") as f:
    content = f.read()

# Interface addition
content = content.replace(
    "  paymentSettings: any;\n  updatePaymentSettings: (settings: any) => Promise<boolean>;",
    "  paymentSettings: any;\n  updatePaymentSettings: (settings: any) => Promise<boolean>;\n  trackingSettings: any;\n  updateTrackingSettings: (settings: any) => Promise<boolean>;"
)

# State addition
content = content.replace(
    "  const [paymentSettings, setPaymentSettings] = useState<any>(null);",
    "  const [paymentSettings, setPaymentSettings] = useState<any>(null);\n  const [trackingSettings, setTrackingSettings] = useState<any>(null);"
)

# Fetch addition
content = content.replace(
    "fetch('/api/payment-settings')",
    "fetch('/api/payment-settings'),\n        fetch('/api/tracking-settings')"
)
content = content.replace(
    "const [resCms, resDelivery, resPayment] = await Promise.all([",
    "const [resCms, resDelivery, resPayment, resTracking] = await Promise.all(["
)

content = content.replace(
    "if (resPayment.ok) {\n        const paymentData = await resPayment.json();\n        setPaymentSettings(paymentData);\n      }",
    "if (resPayment.ok) {\n        const paymentData = await resPayment.json();\n        setPaymentSettings(paymentData);\n      }\n      if (resTracking.ok) {\n        const trackingData = await resTracking.json();\n        setTrackingSettings(trackingData);\n      }"
)

# Update fn
update_fn = """
  const updateTrackingSettings = async (updated: any): Promise<boolean> => {
    try {
      const merged = { ...trackingSettings, ...updated };
      setTrackingSettings(merged);
      const res = await fetch('/api/tracking-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      });
      if (res.ok) {
        const data = await res.json();
        setTrackingSettings(data);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating tracking settings:', err);
      return false;
    }
  };
"""
content = content.replace("  const updatePaymentSettings = async (updated: any): Promise<boolean> => {", update_fn + "\n  const updatePaymentSettings = async (updated: any): Promise<boolean> => {")

# Provider val
content = content.replace(
    "paymentSettings,\n        updatePaymentSettings,",
    "paymentSettings,\n        updatePaymentSettings,\n        trackingSettings,\n        updateTrackingSettings,"
)

with open("src/context/CmsContext.tsx", "w") as f:
    f.write(content)
