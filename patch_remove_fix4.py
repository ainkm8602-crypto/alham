import re

with open("src/components/CartDrawer.tsx", "r") as f:
    content = f.read()

bad_block = """                      <button
                        onClick={() => {
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
                            removeFromCart(item.product.id);}}
                        className="text-[#29231F]/40 hover:text-red-600 transition-colors p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>"""

good_block = """                      <button
                        onClick={() => {
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
                        }}
                        className="text-[#29231F]/40 hover:text-red-600 transition-colors p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>"""

content = content.replace(bad_block, good_block)

with open("src/components/CartDrawer.tsx", "w") as f:
    f.write(content)
