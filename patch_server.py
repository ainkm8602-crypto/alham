import sys
import re

with open("server.ts", "r") as f:
    content = f.read()

# I will replace the block from "let products:" to the end of initial orders, with a loadDb logic.
content = content.replace("import { sendOtpEmail } from './server/email';", "import { sendOtpEmail } from './server/email';\nimport { PaymentSettings } from './src/types';")

# Need to replace the initial declarations.
load_db_code = """
const DB_FILE = path.join(process.cwd(), 'db.json');

let dbState: any = {
  products: [...initialProducts],
  cmsData: JSON.parse(JSON.stringify(initialCmsData)),
  deliverySettings: JSON.parse(JSON.stringify(initialDeliverySettings)),
  ingredients: [...initialIngredients],
  articles: [...initialArticles],
  homepageContent: { ...initialHomepageContent },
  coupons: [...initialCoupons],
  reviews: [...initialReviews],
  orders: [],
  users: [],
  paymentSettings: {
    bKash: { enabled: true, number: '01XXXXXXXXX', accountType: 'Personal', instructions: 'Send the exact amount', referenceInstructions: 'Use your Order ID as reference', transactionIdInstructions: 'Enter the Transaction ID below', requireScreenshot: true },
    nagad: { enabled: true, number: '01XXXXXXXXX', accountType: 'Personal', instructions: 'Send the exact amount', referenceInstructions: 'Use your Order ID as reference', transactionIdInstructions: 'Enter the Transaction ID below', requireScreenshot: true },
    rocket: { enabled: true, number: '01XXXXXXXXX', accountType: 'Personal', instructions: 'Send the exact amount', referenceInstructions: 'Use your Order ID as reference', transactionIdInstructions: 'Enter the Transaction ID below', requireScreenshot: true },
    cashOnDelivery: { enabled: true, charge: 80, minOrder: 0, maxOrder: 10000, instructions: 'Pay cash upon delivery' }
  },
  notifications: []
};

if (fs.existsSync(DB_FILE)) {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    dbState = { ...dbState, ...parsed };
  } catch(e) {
    console.error("Error reading db.json", e);
  }
} else {
  // If no DB exists, initialize some defaults
  dbState.orders = [
    {
      id: "ALH-8921",
      customerEmail: "farhana@example.com",
      customerName: "Farhana Ahmed",
      customerPhone: "+8801711223344",
      shippingAddress: {
        addressLine1: "House 12, Road 4, Block C",
        city: "Dhaka",
        district: "Dhaka",
        postalCode: "1212"
      },
      items: [],
      subtotal: 1250,
      discount: 0,
      deliveryFee: 60,
      total: 1310,
      status: "Delivered",
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Paid",
      createdAt: "2024-05-10T10:30:00Z",
      updatedAt: "2024-05-12T14:20:00Z",
      statusTimeline: [
        { status: "Pending", date: "2024-05-10T10:30:00Z" },
        { status: "Delivered", date: "2024-05-12T14:20:00Z" }
      ]
    }
  ];
  dbState.users = [
    {
      id: "admin-1",
      email: "leptopleptop261@gmail.com",
      name: "Admin",
      role: "super_admin",
    }
  ];
  fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2));
}

function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2));
}

let products: Product[] = dbState.products;
let cmsData: CompleteCmsData = dbState.cmsData;
let deliverySettings: DeliverySettings = dbState.deliverySettings;
let ingredients: IngredientInfo[] = dbState.ingredients;
let articles: Article[] = dbState.articles;
let homepageContent: HomepageContent = dbState.homepageContent;
let coupons: Coupon[] = dbState.coupons;
let reviews: ProductReview[] = dbState.reviews;
let orders: Order[] = dbState.orders;
let users: User[] = dbState.users;
let paymentSettings: PaymentSettings = dbState.paymentSettings;
let notifications: any[] = dbState.notifications;
"""

# I need to carefully replace from "let products: Product[] = [...initialProducts];" down to the end of the users array.
# I will use regex
content = re.sub(r'let products: Product\[\].*?let users: User\[\] = \[.*?\];', load_db_code, content, flags=re.DOTALL)

with open("server.ts", "w") as f:
    f.write(content)
