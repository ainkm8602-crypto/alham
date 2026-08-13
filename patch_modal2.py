import re

with open("src/components/ProductDetailModal.tsx", "r") as f:
    content = f.read()

content = content.replace("const { addToCart } = useCart();", "const { addToCart } = useCart();\n  const { trackEvent } = useTracking();")

with open("src/components/ProductDetailModal.tsx", "w") as f:
    f.write(content)
