import sys

with open("server.ts", "r") as f:
    content = f.read()

content = content.replace(
    "import { sendOtpEmail } from './server/email';",
    "import { sendOtpEmail, sendOrderNotificationEmail } from './server/email';"
)

def add_email_notification(block, old, new):
    return block.replace(old, old + "\n" + new)

# 1. Order Placed
# Look for order creation logic inside POST /api/orders
# The end of the POST /api/orders route looks like:
# saveDb();
# res.json({ success: true, order: newOrder });

content = content.replace(
    "saveDb();\n  res.json({ success: true, order: newOrder });",
    """saveDb();
  if (newOrder.customerEmail) {
    sendOrderNotificationEmail({
      toEmail: newOrder.customerEmail,
      orderId: newOrder.id,
      customerName: newOrder.customerName,
      subject: `Alham — Order Received #${newOrder.id}`,
      message: `Thank you for your order. We have received your order and will process it shortly.`
    });
  }
  res.json({ success: true, order: newOrder });"""
)

# 2. Manual Payment Submitted
content = content.replace(
    "res.json(order);\n});\n\napp.post('/api/orders/:id/verify-payment',",
    """  if (order.customerEmail) {
    sendOrderNotificationEmail({
      toEmail: order.customerEmail,
      orderId: order.id,
      customerName: order.customerName,
      subject: `Alham — Payment Verification Pending #${order.id}`,
      message: `We have received your payment information. Our team will verify your payment shortly.`
    });
  }
  res.json(order);
});\n\napp.post('/api/orders/:id/verify-payment',"""
)

# 3. Payment Verified/Rejected
verify_block = """  if (customer) {
    notifications.push({
      id: `NOTIF-${Date.now()}-${Math.random()}`,
      userId: customer.id,
      orderId: order.id,
      message: `Your payment for order ${order.id} has been ${status.toLowerCase()}.`,
      read: false,
      date: new Date().toISOString()
    });
    
    sendOrderNotificationEmail({
      toEmail: customer.email,
      orderId: order.id,
      customerName: customer.name,
      subject: status === 'Verified' ? `Alham — Payment Verified #${order.id}` : `Alham — Payment Verification Issue #${order.id}`,
      message: status === 'Verified' ? `Your payment has been successfully verified. Your order is now being processed.` : `We were unable to verify your payment information. Please check your order details and contact our support team.`
    });
  }"""
content = content.replace("  if (customer) {\n    notifications.push({\n      id: `NOTIF-${Date.now()}-${Math.random()}`,\n      userId: customer.id,\n      orderId: order.id,\n      message: `Your payment for order ${order.id} has been ${status.toLowerCase()}.`,\n      read: false,\n      date: new Date().toISOString()\n    });\n  }", verify_block)

# 4. Status updates
status_block = """  if (customer) {
    notifications.push({
      id: `NOTIF-${Date.now()}-${Math.random()}`,
      userId: customer.id,
      orderId: order.id,
      message: `Your order ${order.id} status is now: ${status}.`,
      read: false,
      date: new Date().toISOString()
    });
    
    let subject = `Alham — Order Update #${order.id}`;
    let message = `Your order status has been updated to: ${status}.`;
    
    if (status === 'Confirmed') { subject = `Alham — Your Order is Confirmed #${order.id}`; message = 'Your order is confirmed.'; }
    if (status === 'Preparing') { subject = `Alham — Your Order is Being Prepared #${order.id}`; message = 'Your order is currently being prepared.'; }
    if (status === 'Packed') { subject = `Alham — Your Order Has Been Packed #${order.id}`; message = 'Your order has been packed and is ready for shipping.'; }
    if (status === 'Shipped') { subject = `Alham — Your Order Has Been Shipped #${order.id}`; message = `Your order has been shipped. ${courierName ? 'Courier: ' + courierName + '. ' : ''}${trackingNumber ? 'Tracking Number: ' + trackingNumber : ''}`; }
    if (status === 'Delivered') { subject = `Alham — Your Order Has Been Delivered #${order.id}`; message = 'Your order has been successfully delivered. Enjoy!'; }
    if (status === 'Cancelled') { subject = `Alham — Order Cancelled #${order.id}`; message = 'Your order has been cancelled.'; }
    
    sendOrderNotificationEmail({
      toEmail: customer.email,
      orderId: order.id,
      customerName: customer.name,
      subject,
      message
    });
  }"""
content = content.replace("  if (customer) {\n    notifications.push({\n      id: `NOTIF-${Date.now()}-${Math.random()}`,\n      userId: customer.id,\n      orderId: order.id,\n      message: `Your order ${order.id} status is now: ${status}.`,\n      read: false,\n      date: new Date().toISOString()\n    });\n  }", status_block)

with open("server.ts", "w") as f:
    f.write(content)
