import sys

with open("server.ts", "r") as f:
    content = f.read()

content = content.replace("paymentStatus: paymentMethod === 'Card / Online Payment' ? 'Paid' : 'Pending',", "paymentStatus: paymentMethod === 'Card / Online Payment' ? 'Paid' : 'Pending / Cash on Delivery',\n    statusTimeline: [{ status: 'Pending', date: now }],")

with open("server.ts", "w") as f:
    f.write(content)
