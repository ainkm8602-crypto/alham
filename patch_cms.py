import sys

with open("src/context/CmsContext.tsx", "r") as f:
    content = f.read()

# I will append paymentSettings to CmsContextType and the hook
interface_addition = """
  paymentSettings: any;
  updatePaymentSettings: (settings: any) => Promise<boolean>;
"""
content = content.replace("  mediaLibrary: any[];", "  mediaLibrary: any[];\n" + interface_addition)

state_addition = """
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
"""
content = content.replace("  const [mediaLibrary, setMediaLibrary] = useState<any[]>(initialCmsData.mediaItems || []);", "  const [mediaLibrary, setMediaLibrary] = useState<any[]>(initialCmsData.mediaItems || []);\n" + state_addition)

fetch_addition = """
      const [resCms, resDelivery, resPayment] = await Promise.all([
        fetch('/api/cms'),
        fetch('/api/delivery-settings'),
        fetch('/api/payment-settings')
      ]);
"""
content = content.replace("      const [resCms, resDelivery] = await Promise.all([\n        fetch('/api/cms'),\n        fetch('/api/delivery-settings')\n      ]);", fetch_addition)

process_addition = """
      if (resPayment.ok) {
        const paymentData = await resPayment.json();
        setPaymentSettings(paymentData);
      }
"""
content = content.replace("        if (delData.deliverySettings) setDeliverySettings(delData.deliverySettings);\n      }", "        if (delData.deliverySettings) setDeliverySettings(delData.deliverySettings);\n      }\n" + process_addition)


update_fn = """
  const updatePaymentSettings = async (updated: any): Promise<boolean> => {
    try {
      const merged = { ...paymentSettings, ...updated };
      setPaymentSettings(merged);
      const res = await fetch('/api/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      });
      if (res.ok) {
        const data = await res.json();
        setPaymentSettings(data);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating payment settings:', err);
      return false;
    }
  };
"""
content = content.replace("  const updateCms = async (updatedCms: Partial<CompleteCmsData>): Promise<boolean> => {", update_fn + "\n  const updateCms = async (updatedCms: Partial<CompleteCmsData>): Promise<boolean> => {")

provider_val = """
        paymentSettings,
        updatePaymentSettings,
"""
content = content.replace("        setDeliverySettings,\n        updateDeliverySettings,", "        setDeliverySettings,\n        updateDeliverySettings,\n" + provider_val)

with open("src/context/CmsContext.tsx", "w") as f:
    f.write(content)
