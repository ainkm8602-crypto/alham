import re

with open("src/components/CheckoutModal.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "const { deliverySettings } = useCms();",
    "const { deliverySettings, paymentSettings } = useCms();\n  const [paymentSubmissionData, setPaymentSubmissionData] = useState({ senderNumber: '', transactionId: '', screenshotBase64: '' });"
)

# I should also fix the paymentMethod state type.
content = content.replace(
    "const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'bKash / Mobile Banking' | 'Card / Online Payment'>('Cash on Delivery');",
    "const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'bKash' | 'Nagad' | 'Rocket' | 'Card / Online Payment'>('Cash on Delivery');"
)

with open("src/components/CheckoutModal.tsx", "w") as f:
    f.write(content)
