import re

with open("src/components/CartDrawer.tsx", "r") as f:
    content = f.read()

remove_event = """
                            trackEvent('remove_from_cart', {
                              currency: 'BDT',
                              value: item.product.price * item.quantity,
                              items: [{
                                item_id: item.product.id,
                                item_name: item.product.name,
                                price: item.product.price,
                                quantity: item.quantity
                              }]
                            });
                            removeFromCart(item.product.id);
"""
content = content.replace("removeFromCart(item.product.id)", remove_event)

with open("src/components/CartDrawer.tsx", "w") as f:
    f.write(content)
