import re

with open("src/components/ProductDetailModal.tsx", "r") as f:
    content = f.read()

content = content.replace("const { addToCart, quickBuy } = useCart();", "const { addToCart, quickBuy } = useCart();\n  const { trackEvent } = useTracking();")
content = content.replace("const { addToCart } = useCart();\n  const { trackEvent } = useTracking();", "const { addToCart } = useCart();") # Undo the wrong one if it existed

with open("src/components/ProductDetailModal.tsx", "w") as f:
    f.write(content)
