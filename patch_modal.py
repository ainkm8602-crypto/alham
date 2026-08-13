import re

with open("src/components/ProductDetailModal.tsx", "r") as f:
    content = f.read()

# Import useTracking
content = content.replace("import { useLanguage } from '../context/LanguageContext';", "import { useLanguage } from '../context/LanguageContext';\nimport { useTracking } from './TrackingProvider';")

# Add useTracking hook
content = content.replace("const { t } = useLanguage();", "const { t } = useLanguage();\n  const { trackEvent } = useTracking();")

# View item effect
view_item = """
  useEffect(() => {
    if (product) {
      trackEvent('view_item', {
        currency: 'BDT',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: 1
        }]
      });
    }
  }, [product?.id]);
"""
content = content.replace("  const [isFullscreenZoom, setIsFullscreenZoom] = useState(false);", "  const [isFullscreenZoom, setIsFullscreenZoom] = useState(false);\n" + view_item)

# Add to cart track
add_to_cart = """
                    trackEvent('add_to_cart', {
                      currency: 'BDT',
                      value: product.price * quantity,
                      items: [{
                        item_id: product.id,
                        item_name: product.name,
                        price: product.price,
                        quantity: quantity
                      }]
                    });
                    addToCart(product, quantity, product.weight, isSubscription);
"""
content = content.replace("addToCart(product, quantity, product.weight, isSubscription);", add_to_cart)

with open("src/components/ProductDetailModal.tsx", "w") as f:
    f.write(content)
