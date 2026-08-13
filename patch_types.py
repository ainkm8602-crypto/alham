import sys

with open("src/types.ts", "r") as f:
    content = f.read()

# Replace OrderStatus
content = content.replace("export type OrderStatus =\n  | 'Pending'\n  | 'Confirmed'", "export type OrderStatus =\n  | 'Pending'\n  | 'Payment Verification Pending'\n  | 'Payment Verified'\n  | 'Confirmed'")

# Add interfaces after OrderStatus
new_interfaces = """
export interface Notification {
  id: string;
  userId: string;
  orderId?: string;
  message: string;
  read: boolean;
  date: string;
}

export interface PaymentSubmission {
  method: 'bKash' | 'Nagad' | 'Rocket';
  senderNumber: string;
  transactionId: string;
  amount: number;
  date: string;
  screenshotUrl?: string;
  status: 'Pending Verification' | 'Verified' | 'Rejected';
  adminNote?: string;
}

export interface PaymentMethodConfig {
  enabled: boolean;
  number: string;
  accountType: 'Personal' | 'Merchant';
  instructions: string;
  referenceInstructions: string;
  transactionIdInstructions: string;
  requireScreenshot: boolean;
}

export interface PaymentSettings {
  bKash: PaymentMethodConfig;
  nagad: PaymentMethodConfig;
  rocket: PaymentMethodConfig;
  cashOnDelivery: {
    enabled: boolean;
    charge: number;
    minOrder: number;
    maxOrder: number;
    instructions: string;
  };
}
"""
content = content.replace("export type UserRole", new_interfaces + "\nexport type UserRole")

# Replace Order payment fields
content = content.replace("  paymentMethod: 'Cash on Delivery' | 'bKash / Mobile Banking' | 'Card / Online Payment';", "  paymentMethod: 'Cash on Delivery' | 'bKash' | 'Nagad' | 'Rocket' | 'Card / Online Payment';")
content = content.replace("  paymentStatus: 'Pending' | 'Paid';", "  paymentStatus: 'Pending / Cash on Delivery' | 'Payment Verification Pending' | 'Verified' | 'Rejected' | 'Paid';\n  paymentSubmission?: PaymentSubmission;\n  statusTimeline: { status: OrderStatus; date: string }[];")

with open("src/types.ts", "w") as f:
    f.write(content)
