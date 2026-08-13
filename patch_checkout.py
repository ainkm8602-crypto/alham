import re

with open("src/components/CheckoutModal.tsx", "r") as f:
    content = f.read()

# Import useTracking
content = content.replace("import { useLanguage } from '../context/LanguageContext';", "import { useLanguage } from '../context/LanguageContext';\nimport { useTracking } from './TrackingProvider';")

content = content.replace("const { t } = useLanguage();", "const { t } = useLanguage();\n  const { trackEvent } = useTracking();")

# Purchase event on submit
purchase_event = """
      if (res.ok) {
        const result = await res.json();
        
        // Track purchase
        trackEvent('purchase', {
          transaction_id: result.orderId,
          value: totalToPay,
          currency: 'BDT',
          items: cart.map(item => ({
            item_id: item.product.id,
            item_name: item.product.name,
            price: item.product.price,
            quantity: item.quantity
          }))
        });

        setCompletedOrder({ id: result.orderId });
"""
content = content.replace("if (res.ok) {\n        const result = await res.json();\n        setCompletedOrder({ id: result.orderId });", purchase_event)

with open("src/components/CheckoutModal.tsx", "w") as f:
    f.write(content)
