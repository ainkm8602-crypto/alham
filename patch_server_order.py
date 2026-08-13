import re

with open("server.ts", "r") as f:
    content = f.read()

order_creation_regex = r"const newOrder: Order = \{.*?\};\n\n\s+dbState\.orders\.push\(newOrder\);"
order_creation_replacement = """const newOrder: Order = {
    id: orderId,
    customerEmail: customerEmail || 'guest@alham.com',
    customerName: customerName || 'Guest',
    customerPhone: customerPhone || '',
    shippingAddress,
    items,
    subtotal,
    discount,
    deliveryFee,
    total,
    status: 'Pending',
    paymentMethod: paymentMethod || 'Cash on Delivery',
    paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending / Cash on Delivery' : 'Payment Verification Pending',
    statusTimeline: [{ status: 'Pending', date: now }],
    createdAt: now,
    updatedAt: now,
    notes: notes || ''
  };

  dbState.orders.push(newOrder);

  // Automatically create user account if they don't exist
  if (customerEmail) {
    const normalizedEmail = customerEmail.trim().toLowerCase();
    let existingUser = dbState.users.find((u: any) => u.email.toLowerCase() === normalizedEmail);
    if (!existingUser) {
      const newUser = {
        id: crypto.randomUUID(), // Local DB ID
        email: normalizedEmail,
        name: customerName || 'Customer',
        phone: customerPhone || '',
        role: 'customer',
        rewardPoints: 0,
        createdAt: now
      };
      dbState.users.push(newUser);
    }
  }
"""
content = re.sub(order_creation_regex, order_creation_replacement, content, flags=re.DOTALL)

with open("server.ts", "w") as f:
    f.write(content)
