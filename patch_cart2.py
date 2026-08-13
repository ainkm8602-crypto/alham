import re

with open("src/components/CartDrawer.tsx", "r") as f:
    content = f.read()

# Import useTracking
content = content.replace("import { useCart } from '../context/CartContext';", "import { useCart } from '../context/CartContext';\nimport { useTracking } from './TrackingProvider';")

content = content.replace("export const CartDrawer: React.FC = () => {", "export const CartDrawer: React.FC = () => {\n  const { trackEvent } = useTracking();")

# We also missed the view_cart tracking and begin_checkout tracking because my previous patch failed
view_cart = """
  React.useEffect(() => {
    if (isCartOpen) {
      trackEvent('view_cart', {
        currency: 'BDT',
        value: total,
        items: cart.map(item => ({
          item_id: item.product.id,
          item_name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        }))
      });
    }
  }, [isCartOpen, cart, total]);
"""

content = content.replace("  const [couponCode, setCouponCode] = useState('');", "  const [couponCode, setCouponCode] = useState('');\n" + view_cart)

begin_checkout = """
              onClick={() => {
                trackEvent('begin_checkout', {
                  currency: 'BDT',
                  value: total,
                  items: cart.map(item => ({
                    item_id: item.product.id,
                    item_name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity
                  }))
                });
                setIsCheckoutModalOpen(true);
              }}
"""

# Now replace the onClick for begin_checkout
content = re.sub(
    r"onClick=\{handleProceedToCheckout\}",
    r"onClick={() => {\n                trackEvent('begin_checkout', {\n                  currency: 'BDT',\n                  value: total,\n                  items: cart.map(item => ({\n                    item_id: item.product.id,\n                    item_name: item.product.name,\n                    price: item.product.price,\n                    quantity: item.quantity\n                  }))\n                });\n                handleProceedToCheckout();\n              }}",
    content
)


with open("src/components/CartDrawer.tsx", "w") as f:
    f.write(content)
