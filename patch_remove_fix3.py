import re

with open("src/components/CartDrawer.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "removeFromCart(item.product.id);}\n                        className=",
    "removeFromCart(item.product.id);}}\n                        className="
)

with open("src/components/CartDrawer.tsx", "w") as f:
    f.write(content)
