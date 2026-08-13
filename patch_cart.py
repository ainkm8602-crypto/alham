import re

with open("src/components/CartDrawer.tsx", "r") as f:
    content = f.read()

# Import useTracking
content = content.replace("import { useLanguage } from '../context/LanguageContext';", "import { useLanguage } from '../context/LanguageContext';\nimport { useTracking } from './TrackingProvider';")

content = content.replace("const { t } = useLanguage();", "const { t } = useLanguage();\n  const { trackEvent } = useTracking();")

# View cart
view_cart = """
  useEffect(() => {
    if (isCartOpen) {
      trackEvent('view_cart', {
        currency: 'BDT',
        value: getCartTotal(),
        items: cart.map(item => ({
          item_id: item.product.id,
          item_name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        }))
      });
    }
  }, [isCartOpen]);
"""
content = content.replace("  const isDeliveryFree = getCartTotal() >= 1000;", "  const isDeliveryFree = getCartTotal() >= 1000;\n" + view_cart)

# Begin checkout
begin_checkout = """
                trackEvent('begin_checkout', {
                  currency: 'BDT',
                  value: getCartTotal(),
                  items: cart.map(item => ({
                    item_id: item.product.id,
                    item_name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity
                  }))
                });
                setIsCheckoutModalOpen(true);
"""
content = content.replace("setIsCheckoutModalOpen(true);", begin_checkout)

with open("src/components/CartDrawer.tsx", "w") as f:
    f.write(content)
