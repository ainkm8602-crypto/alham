import re

with open("src/components/CheckoutModal.tsx", "r") as f:
    content = f.read()

purchase_event = """
        // Track purchase
        trackEvent('purchase', {
          transaction_id: data.order.id,
          value: data.order.total,
          currency: 'BDT',
          items: cart.map(item => ({
            item_id: item.product.id,
            item_name: item.product.name,
            price: item.product.price,
            quantity: item.quantity
          }))
        });
        setCompletedOrder(data.order);
"""

content = content.replace("setCompletedOrder(data.order);", purchase_event.strip())

with open("src/components/CheckoutModal.tsx", "w") as f:
    f.write(content)
