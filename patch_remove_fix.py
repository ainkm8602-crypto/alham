import re

with open("src/components/CartDrawer.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "onClick={() => \n                            trackEvent('remove_from_cart', {",
    "onClick={() => {\n                            trackEvent('remove_from_cart', {"
)

content = content.replace(
    "removeFromCart(item.product.id);}",
    "removeFromCart(item.product.id);\n                        }}"
)

with open("src/components/CartDrawer.tsx", "w") as f:
    f.write(content)
