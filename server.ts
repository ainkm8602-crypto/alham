import express from 'express';
import compression from 'compression';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initialProducts, initialHomepageContent, initialIngredients, initialArticles, initialCoupons, initialReviews, initialCmsData, initialDeliverySettings } from './src/data/initialData';
import { Product, Order, Coupon, HomepageContent, User, ProductReview, CompleteCmsData, IngredientInfo, Article, MediaItem, DeliverySettings } from './src/types';
import { sendOtpEmail, sendOrderNotificationEmail } from './server/email';
import { PaymentSettings, TrackingSettings } from './src/types';
import {
  loadInitialDataFromFirestore,
  syncAllToFirestore,
  syncProductToFirestore,
  deleteProductFromFirestore,
  syncIngredientToFirestore,
  deleteIngredientFromFirestore,
  syncArticleToFirestore,
  deleteArticleFromFirestore,
  syncReviewToFirestore,
  deleteReviewFromFirestore,
  syncCouponToFirestore,
  deleteCouponFromFirestore,
  syncOrderToFirestore,
  syncUserToFirestore,
  syncSettingsToFirestore,
  syncCmsDataToFirestore,
  syncMediaItemToFirestore,
  deleteMediaItemFromFirestore,
  saveMediaFileToFirestore,
  getMediaFileFromFirestore
} from './server/firestoreDb';

const app = express();
const PORT = 3000;

// Enable Brotli / Gzip HTTP Compression
app.use(compression({ threshold: 512, level: 6 }));

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded media files publicly
app.use('/uploads', express.static(uploadsDir));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// In-Memory Database state for server

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
  trackingSettings: {
    gtm: { enabled: true, containerId: 'GTM-WRRNCLCK' },
    ga4: { enabled: true, measurementId: 'G-49NPC58FRP' },
    metaPixel: { enabled: false, pixelId: '' },
    googleAds: { enabled: false, conversionId: '', conversionLabel: '' },
    tikTokPixel: { enabled: false, pixelId: '' },
    customScripts: { headScript: '', bodyScript: '', footerScript: '' }
  },
  paymentSettings: {
    bKash: { enabled: false, number: '01XXXXXXXXX', accountType: 'Personal', instructions: 'Send the exact amount', referenceInstructions: 'Use your Order ID as reference', transactionIdInstructions: 'Enter the Transaction ID below', requireScreenshot: true },
    nagad: { enabled: false, number: '01XXXXXXXXX', accountType: 'Personal', instructions: 'Send the exact amount', referenceInstructions: 'Use your Order ID as reference', transactionIdInstructions: 'Enter the Transaction ID below', requireScreenshot: true },
    rocket: { enabled: false, number: '01XXXXXXXXX', accountType: 'Personal', instructions: 'Send the exact amount', referenceInstructions: 'Use your Order ID as reference', transactionIdInstructions: 'Enter the Transaction ID below', requireScreenshot: true },
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
  try {
    dbState.products = products;
    dbState.cmsData = cmsData;
    dbState.deliverySettings = deliverySettings;
    dbState.ingredients = ingredients;
    dbState.articles = articles;
    dbState.homepageContent = homepageContent;
    dbState.coupons = coupons;
    dbState.reviews = reviews;
    dbState.orders = orders;
    dbState.users = users;
    dbState.trackingSettings = trackingSettings;
    dbState.paymentSettings = paymentSettings;
    dbState.notifications = notifications;

    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2));
    syncAllToFirestore(dbState).catch(err => console.warn('Sync db to Firestore notice:', err?.message || err));
  } catch (e) {
    console.error('Error in saveDb:', e);
  }
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
let trackingSettings: TrackingSettings = dbState.trackingSettings;
let paymentSettings: PaymentSettings = dbState.paymentSettings;
let notifications: any[] = dbState.notifications;

// Disable caching for all API responses
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

function purgeDeletedProductId(targetId: string) {
  if (!targetId) return;
  if (cmsData.homepageConfig?.signatureCreations?.productIds) {
    cmsData.homepageConfig.signatureCreations.productIds =
      cmsData.homepageConfig.signatureCreations.productIds.filter((id: string) => id !== targetId);
  }
  reviews = reviews.filter(r => r.productId !== targetId);
  dbState.reviews = reviews;
}

function purgeDeletedMediaUrl(deletedUrl: string) {
  if (!deletedUrl) return;

  if (cmsData.siteSettings) {
    if (cmsData.siteSettings.logoImageUrl === deletedUrl) {
      cmsData.siteSettings.logoImageUrl = '';
      cmsData.siteSettings.logoType = 'text';
    }
    if (cmsData.siteSettings.logoLightUrl === deletedUrl) cmsData.siteSettings.logoLightUrl = '';
    if (cmsData.siteSettings.logoDarkUrl === deletedUrl) cmsData.siteSettings.logoDarkUrl = '';
    if (cmsData.siteSettings.faviconUrl === deletedUrl) cmsData.siteSettings.faviconUrl = '';
  }

  if (cmsData.settings) {
    if (cmsData.settings.logoImage === deletedUrl) cmsData.settings.logoImage = '';
  }

  const hero = cmsData.heroSection as any;
  if (hero) {
    if (hero.backgroundImage === deletedUrl) hero.backgroundImage = '';
    if (hero.bannerImage === deletedUrl) hero.bannerImage = '';
  }

  products = products.map(p => {
    let changed = false;
    let images = p.images || [];
    if (images.includes(deletedUrl)) {
      images = images.filter(img => img !== deletedUrl);
      changed = true;
    }
    if (changed) {
      const updated = { ...p, images };
      syncProductToFirestore(updated);
      return updated;
    }
    return p;
  });
  dbState.products = products;

  ingredients = ingredients.map(ing => {
    if (ing.image === deletedUrl) return { ...ing, image: '' };
    return ing;
  });
  dbState.ingredients = ingredients;

  articles = articles.map(art => {
    if (art.image === deletedUrl) return { ...art, image: '' };
    return art;
  });
  dbState.articles = articles;
}


// OTP Store in memory: email -> { code, expiresAt, role, name, attempts }
const otpStore = new Map<string, { code: string; expiresAt: number; role: 'super_admin' | 'customer'; name: string; attempts: number }>();

// Rate Limit Store in memory: email -> timestamp[]
const rateLimitStore = new Map<string, number[]>();

// API ROUTES

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'Alham',
    resendConfigured: !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()),
    timestamp: new Date().toISOString()
  });
});

// AUTH: Request OTP via Resend
app.post('/api/auth/send-otp', async (req, res) => {
  const { email, name } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = (name || '').trim().toLowerCase();

  const ADMIN_EMAIL = 'leptopleptop261@gmail.com';
  const ADMIN_NAME = 'jidan';

  // Admin Instant Authentication: Skip OTP completely when Admin Name & Email match
  if (normalizedEmail === ADMIN_EMAIL) {
    if (normalizedName === ADMIN_NAME) {
      let adminUser = dbState.users.find((u: any) => u.email.toLowerCase() === ADMIN_EMAIL);
      if (!adminUser) {
        adminUser = {
          id: 'admin-1',
          email: ADMIN_EMAIL,
          name: 'Jidan',
          role: 'super_admin',
          createdAt: new Date().toISOString()
        };
        dbState.users.push(adminUser);
        syncUserToFirestore(adminUser).catch(() => {});
      } else {
        adminUser.role = 'super_admin';
        adminUser.name = 'Jidan';
      }
      saveDb();

      console.log(`[AUTH SERVER] Admin '${ADMIN_EMAIL}' authenticated instantly via name & email match. Skipping OTP verification completely.`);

      return res.json({
        success: true,
        instantLogin: true,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: 'super_admin',
          rewardPoints: adminUser.rewardPoints || 0,
          createdAt: adminUser.createdAt
        },
        message: 'Admin account authenticated successfully.'
      });
    } else {
      return res.status(401).json({
        error: 'Invalid authentication credentials. Please enter your registered name and email address.'
      });
    }
  }

  // Rate Limiting Enforcement
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes window
  const minIntervalMs = 15 * 1000; // 15 seconds cooldown between sends
  
  const recentRequests = (rateLimitStore.get(normalizedEmail) || []).filter(ts => now - ts < windowMs);

  if (recentRequests.length >= 4) {
    return res.status(429).json({
      error: 'Too many OTP verification requests. For security reasons, please wait 15 minutes before requesting a new code.'
    });
  }

  if (recentRequests.length > 0 && now - recentRequests[recentRequests.length - 1] < minIntervalMs) {
    const waitSec = Math.ceil((minIntervalMs - (now - recentRequests[recentRequests.length - 1])) / 1000);
    return res.status(429).json({
      error: `Please wait ${waitSec} second(s) before requesting another verification code.`
    });
  }

  // Account existence check & automatic role routing
  const isAdminEmail = normalizedEmail === ADMIN_EMAIL;
  let user = dbState.users.find((u: any) => u.email.toLowerCase() === normalizedEmail);

  // Check customer orders if not found in dbState.users
  if (!user) {
    const matchingOrder = dbState.orders.find((o: any) => o.customerEmail && o.customerEmail.toLowerCase() === normalizedEmail);
    if (matchingOrder) {
      user = {
        id: `u-${Date.now()}`,
        email: normalizedEmail,
        name: matchingOrder.customerName || name || normalizedEmail.split('@')[0],
        role: 'customer',
        rewardPoints: 0,
        createdAt: new Date().toISOString()
      };
      dbState.users.push(user);
      syncUserToFirestore(user).catch(() => {});
    }
  }

  // Account existence validation: Email must belong to admin or an existing customer
  if (!isAdminEmail && !user) {
    console.warn(`[AUTH REJECT] Unregistered email attempted login: ${normalizedEmail}`);
    return res.status(404).json({ error: 'No account found with this email address.' });
  }

  const isUserAdmin = isAdminEmail || user?.role === 'super_admin' || user?.role === 'admin';
  const role: 'super_admin' | 'customer' = isUserAdmin ? 'super_admin' : 'customer';

  // Ensure admin user record exists if it's an admin email
  if (isAdminEmail && !user) {
    user = {
      id: 'admin-1',
      email: normalizedEmail,
      name: name || 'Jidan (Super Admin)',
      role: 'super_admin',
      createdAt: new Date().toISOString()
    };
    dbState.users.push(user);
    syncUserToFirestore(user).catch(() => {});
  }

  recentRequests.push(now);
  rateLimitStore.set(normalizedEmail, recentRequests);

  // Generate secure 6-digit OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes expiry

  if (name && name.trim() && user) {
    user.name = name.trim();
  }

  const recipientName = user ? user.name : (name || normalizedEmail.split('@')[0]);

  // Store active OTP (hashed for security)
  const hashedCode = crypto.createHash('sha256').update(otpCode).digest('hex');
  otpStore.set(normalizedEmail, {
    code: hashedCode,
    expiresAt,
    role,
    name: recipientName,
    attempts: 0
  });

  // Send email using Resend Service directly to recipient's email address
  console.log(`[AUTH SERVER] Initiating 6-digit OTP email dispatch for ${normalizedEmail} (Role: ${role})`);
  const emailResult = await sendOtpEmail({
    toEmail: normalizedEmail,
    recipientName,
    otpCode,
    role
  });

  if (!emailResult.success) {
    console.error(`[AUTH SERVER ERROR] OTP email dispatch failed for recipient ${normalizedEmail}: ${emailResult.error}`);
    return res.status(500).json({
      error: emailResult.error || 'Failed to send OTP verification email. Please try again.'
    });
  }

  console.log(`[AUTH SERVER] OTP Email successfully dispatched to ${normalizedEmail}. ResendSuccess=${emailResult.success}`);

  saveDb();
  res.json({
    success: true,
    message: emailResult.error
      ? `Verification code for ${normalizedEmail} generated. ${emailResult.error}`
      : `Verification code sent to ${normalizedEmail}.`,
    role,
    resendDelivery: {
      sent: emailResult.success && !emailResult.simulated,
      simulated: !!emailResult.simulated,
      resendId: emailResult.resendId,
      notice: emailResult.error
    }
  });
});

// AUTH: Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and OTP verification code are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const stored = otpStore.get(normalizedEmail);

  if (!stored) {
    return res.status(400).json({ error: 'No active OTP found for this email. Please request a new verification code.' });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(normalizedEmail);
    return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
  }

  if (stored.attempts >= 5) {
    otpStore.delete(normalizedEmail);
    return res.status(400).json({ error: 'Too many invalid attempts. This verification code has been invalidated. Please request a new code.' });
  }

  const incomingHash = crypto.createHash('sha256').update(code.trim()).digest('hex');
  if (stored.code !== incomingHash) {
    stored.attempts += 1;
    return res.status(400).json({
      error: `Invalid verification code. ${5 - stored.attempts} attempt(s) remaining.`
    });
  }

  // OTP is valid!
  otpStore.delete(normalizedEmail);

  // Generate deterministic password for Firebase Auth
  const SERVER_SECRET = 'ALHAM_SECRET_KEY_2026'; // Hardcoded for simplicity in this demo
  const deterministicPassword = crypto.createHash('sha256').update(normalizedEmail + SERVER_SECRET).digest('hex').substring(0, 20) + 'A1!';

  // Check if user exists in local db
  let user = dbState.users.find((u: any) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    const isSuperAdmin = normalizedEmail === 'leptopleptop261@gmail.com';
    user = {
      id: crypto.randomUUID(), // This will be replaced by Firebase UID on the frontend later
      email: normalizedEmail,
      name: stored.name || (isSuperAdmin ? 'Jidan (Super Admin)' : 'Customer'),
      role: isSuperAdmin ? 'super_admin' : 'customer',
      rewardPoints: 0,
      createdAt: new Date().toISOString()
    };
    dbState.users.push(user);
    syncUserToFirestore(user).catch(() => {});
    saveDb();
  }

  res.json({ success: true, user, token: deterministicPassword });
});


// PRODUCTS API
app.get('/api/products', (req, res) => {

  res.json({ products });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  res.json({ product });
});

app.post('/api/products', async (req, res) => {
  try {
    const newProduct: Product = {
      id: `p-${Date.now()}`,
      stock: 25,
      rating: 5.0,
      reviewCount: 0,
      status: 'active',
      ...req.body
    };
    products.unshift(newProduct);
    dbState.products = products;
    await syncProductToFirestore(newProduct);
    saveDb();
    res.status(201).json({ success: true, product: newProduct, products });
  } catch (err: any) {
    console.error('Error saving product to Firestore:', err);
    res.status(500).json({ error: 'Failed to persist product to database: ' + err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });
    products[index] = { ...products[index], ...req.body };
    dbState.products = products;
    await syncProductToFirestore(products[index]);
    saveDb();
    res.json({ success: true, product: products[index], products });
  } catch (err: any) {
    console.error('Error updating product in Firestore:', err);
    res.status(500).json({ error: 'Failed to persist product update: ' + err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const targetId = req.params.id;
    products = products.filter(p => p.id !== targetId);
    dbState.products = products;
    purgeDeletedProductId(targetId);
    await deleteProductFromFirestore(targetId);
    saveDb();
    res.json({ success: true, message: 'Product deleted', products, cms: cmsData, reviews });
  } catch (err: any) {
    console.error('Error deleting product from Firestore:', err);
    res.status(500).json({ error: 'Failed to delete product from database: ' + err.message });
  }
});

// DELIVERY SETTINGS API
app.get('/api/delivery-settings', (req, res) => {

  res.json({ deliverySettings });
});

app.post('/api/delivery-settings', async (req, res) => {
  try {
    deliverySettings = { ...deliverySettings, ...req.body };
    dbState.deliverySettings = deliverySettings;
    await syncSettingsToFirestore('delivery', deliverySettings);
    saveDb();
    res.json({ success: true, deliverySettings });
  } catch (err: any) {
    console.error('Error saving delivery settings to Firestore:', err);
    res.status(500).json({ error: 'Failed to persist delivery settings: ' + err.message });
  }
});

// ORDERS API
app.get('/api/orders', (req, res) => {
  const { email } = req.query;
  if (email && typeof email === 'string') {
    const userOrders = orders.filter(o => o.customerEmail.toLowerCase() === email.toLowerCase());
    return res.json({ orders: userOrders });
  }
  res.json({ orders });
});

app.post('/api/orders', async (req, res) => {
  try {
    const {
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      items,
      subtotal,
      discount,
      deliveryFee,
      total,
      paymentMethod,
      notes
    } = req.body;

    const orderId = `ALH-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const processedItems = (items || []).map((it: any) => {
      const matchedProduct = products.find((p: any) => p.id === it.productId);
      return {
        ...it,
        sku: it.sku || matchedProduct?.sku || (matchedProduct ? `ALH-${matchedProduct.id.toUpperCase()}` : 'ALH-GEN')
      };
    });

    const newOrder: Order = {
      id: orderId,
      customerEmail: customerEmail || 'guest@alham.com',
      customerName: customerName || 'Valued Guest',
      customerPhone: customerPhone || '',
      shippingAddress,
      items: processedItems,
      subtotal,
      discount: discount || 0,
      deliveryFee: deliveryFee || 80,
      total,
      status: 'Pending',
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: paymentMethod === 'Card / Online Payment' ? 'Paid' : 'Pending / Cash on Delivery',
      statusTimeline: [{ status: 'Pending', date: now }],
      createdAt: now,
      updatedAt: now,
      notes
    };

    orders.unshift(newOrder);
    dbState.orders = orders;

    let userAccount: User | null = null;

    // Automatic account creation or linking if email provided during checkout
    if (customerEmail && customerEmail.trim() && customerEmail.includes('@')) {
      const normalized = customerEmail.trim().toLowerCase();
      let existingUser = users.find(u => u.email.toLowerCase() === normalized);
      
      if (!existingUser) {
        const isSuperAdmin = normalized === 'leptopleptop261@gmail.com';
        const newUser: User = {
          id: `u-${Date.now()}`,
          email: normalized,
          name: customerName || normalized.split('@')[0],
          role: isSuperAdmin ? 'super_admin' : 'customer',
          phone: customerPhone || '',
          rewardPoints: Math.floor((total || 0) / 10),
          createdAt: now
        };
        users.push(newUser);
        existingUser = newUser;
      } else {
        existingUser.rewardPoints = (existingUser.rewardPoints || 0) + Math.floor((total || 0) / 10);
        if (customerPhone && (!existingUser.phone || !existingUser.phone.trim())) {
          existingUser.phone = customerPhone;
        }
        if (customerName && (!existingUser.name || existingUser.name === 'Customer' || existingUser.name === 'Valued Guest')) {
          existingUser.name = customerName;
        }
      }
      userAccount = existingUser;
      dbState.users = users;
    }

    saveDb();

    // Trigger background Firestore synchronization
    syncOrderToFirestore(newOrder).catch(e => console.warn('Firestore order sync notice:', e?.message || e));
    if (userAccount) {
      syncUserToFirestore(userAccount).catch(e => console.warn('Firestore user sync notice:', e?.message || e));
    }

    res.status(201).json({ success: true, order: newOrder, user: userAccount });
  } catch (err: any) {
    console.error('Error creating order in Firestore:', err);
    res.status(500).json({ error: 'Failed to permanently save order to database: ' + err.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status, trackingNumber, courierName } = req.body;
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courierName) order.courierName = courierName;
    order.updatedAt = new Date().toISOString();
    dbState.orders = orders;
    await syncOrderToFirestore(order);
    saveDb();
    res.json({ success: true, order });
  } catch (err: any) {
    console.error('Error updating order status in Firestore:', err);
    res.status(500).json({ error: 'Failed to update order status in database: ' + err.message });
  }
});

// COMPREHENSIVE CONTENT MANAGEMENT SYSTEM (CMS) API

// 1. GET ALL CMS DATA
app.get('/api/cms', (req, res) => {

  res.json({
    cms: cmsData,
    ingredients,
    articles,
    reviews,
    products
  });
});

// Backward compatibility for legacy /api/content
app.get('/api/content', (req, res) => {

  res.json({
    content: homepageContent,
    cms: cmsData,
    ingredients,
    articles,
    reviews
  });
});

// 2. UPDATE FULL CMS DATA
app.put('/api/cms', async (req, res) => {
  try {
    if (req.body.cms) {
      cmsData = { ...cmsData, ...req.body.cms };
    } else {
      cmsData = { ...cmsData, ...req.body };
    }
    dbState.cmsData = cmsData;
    await syncCmsDataToFirestore(cmsData);
    saveDb();
    res.json({ success: true, cms: cmsData });
  } catch (err: any) {
    console.error('Error saving CMS data to Firestore:', err);
    res.status(500).json({ error: 'Failed to permanently save CMS data to database: ' + err.message });
  }
});

app.put('/api/content', (req, res) => {
  homepageContent = { ...homepageContent, ...req.body };
  if (req.body.heroHeadline) cmsData.heroSection.headlineFirst = req.body.heroHeadline;
  if (req.body.heroSubheading) cmsData.heroSection.subheading = req.body.heroSubheading;
  saveDb();
  res.json({ success: true, content: homepageContent, cms: cmsData });
});

// 3. INGREDIENTS CMS API
app.get('/api/ingredients', (req, res) => {
  res.json({ ingredients });
});

app.post('/api/ingredients', (req, res) => {
  const newIng: IngredientInfo = {
    id: `ing-${Date.now()}`,
    name: req.body.name || 'New Ingredient',
    description: req.body.description || '',
    origin: req.body.origin || 'Dhaka, Bangladesh',
    image: req.body.image || '/src/assets/images/khajur_barfi_1784995525489.jpg',
    benefit: req.body.benefit || '',
    flavorNotes: req.body.flavorNotes || ''
  };
  ingredients.unshift(newIng);
  dbState.ingredients = ingredients;
  syncIngredientToFirestore(newIng);
  saveDb();
  res.status(201).json({ success: true, ingredient: newIng, ingredients });
});

app.put('/api/ingredients/:id', (req, res) => {
  const index = ingredients.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Ingredient not found' });
  ingredients[index] = { ...ingredients[index], ...req.body };
  dbState.ingredients = ingredients;
  syncIngredientToFirestore(ingredients[index]);
  saveDb();
  res.json({ success: true, ingredient: ingredients[index], ingredients });
});

app.delete('/api/ingredients/:id', (req, res) => {
  const targetId = req.params.id;
  ingredients = ingredients.filter(i => i.id !== targetId);
  dbState.ingredients = ingredients;
  deleteIngredientFromFirestore(targetId);
  saveDb();
  res.json({ success: true, ingredients });
});

// 4. ARTICLES / JOURNAL CMS API
app.get('/api/articles', (req, res) => {
  res.json({ articles });
});

app.post('/api/articles', (req, res) => {
  const newArt: Article = {
    id: `art-${Date.now()}`,
    title: req.body.title || 'Untitled Journal Article',
    category: req.body.category || 'Behind the Craft',
    readTime: req.body.readTime || '3 min read',
    author: req.body.author || 'Alham Editorial',
    date: req.body.date || 'July 2026',
    image: req.body.image || '/src/assets/images/snickers_bar_cut_178499506640.jpg',
    excerpt: req.body.excerpt || '',
    content: req.body.content || '',
    tags: req.body.tags || ['Craftsmanship']
  };
  articles.unshift(newArt);
  dbState.articles = articles;
  syncArticleToFirestore(newArt);
  saveDb();
  res.status(201).json({ success: true, article: newArt, articles });
});

app.put('/api/articles/:id', (req, res) => {
  const index = articles.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Article not found' });
  articles[index] = { ...articles[index], ...req.body };
  dbState.articles = articles;
  syncArticleToFirestore(articles[index]);
  saveDb();
  res.json({ success: true, article: articles[index], articles });
});

app.delete('/api/articles/:id', (req, res) => {
  const targetId = req.params.id;
  articles = articles.filter(a => a.id !== targetId);
  dbState.articles = articles;
  deleteArticleFromFirestore(targetId);
  saveDb();
  res.json({ success: true, articles });
});

// 5. CUSTOMER REVIEWS CMS API
app.get('/api/reviews', (req, res) => {
  res.json({ reviews });
});

app.post('/api/reviews', (req, res) => {
  const newRev: ProductReview = {
    id: `rev-${Date.now()}`,
    productId: req.body.productId || 'p1',
    userName: req.body.userName || 'Valued Connoisseur',
    rating: Number(req.body.rating) || 5,
    date: 'Just now',
    comment: req.body.comment || '',
    verifiedPurchase: req.body.verifiedPurchase !== false
  };
  reviews.unshift(newRev);
  dbState.reviews = reviews;
  syncReviewToFirestore(newRev);
  saveDb();
  res.status(201).json({ success: true, review: newRev, reviews });
});

app.delete('/api/reviews/:id', (req, res) => {
  const targetId = req.params.id;
  reviews = reviews.filter(r => r.id !== targetId);
  dbState.reviews = reviews;
  deleteReviewFromFirestore(targetId);
  saveDb();
  res.json({ success: true, reviews });
});

// 6. MEDIA LIBRARY & DIRECT DEVICE UPLOAD API

import { db, storage } from './server/firebaseAdmin';
import config from './firebase-applet-config.json' assert { type: 'json' };

async function uploadToFirebaseStorage(fileBuffer: Buffer, mimeType: string, originalName?: string): Promise<string> {
  const ext = mimeType.split('/')[1] || 'png';
  const safeName = `media/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const bucketName = config.storageBucket || `${config.projectId}.firebasestorage.app`;
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(safeName);
  
  const downloadToken = crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2) + Date.now().toString(36));
  await file.save(fileBuffer, {
    metadata: {
      contentType: mimeType,
      metadata: {
        firebaseStorageDownloadTokens: downloadToken
      }
    }
  });
  
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(safeName)}?alt=media&token=${downloadToken}`;
}

app.get('/api/media', (req, res) => {
  res.json({ media: cmsData.mediaItems || [] });
});

async function servePersistentMedia(req: express.Request, res: express.Response, fileName: string) {
  const localFilePath = path.join(uploadsDir, fileName);

  // 1. Return from local disk cache if present
  if (fs.existsSync(localFilePath)) {
    return res.sendFile(localFilePath, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  }

  // 2. If missing from disk cache (e.g., after container restart), recover from Firestore persistent storage
  const mediaRecord = await getMediaFileFromFirestore(fileName);
  if (!mediaRecord) {
    return res.status(404).json({ error: 'Media file not found in persistent database' });
  }

  // Write restored file back to disk cache for subsequent requests
  try {
    fs.writeFileSync(localFilePath, mediaRecord.buffer);
  } catch (e) {
    console.warn('Could not cache restored media file to disk:', e);
  }

  res.setHeader('Content-Type', mediaRecord.mimeType || 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Content-Length', mediaRecord.buffer.length);
  return res.send(mediaRecord.buffer);
}

// Serve persistent media files by name
app.get('/api/media-file/:fileName', async (req, res) => {
  await servePersistentMedia(req, res, req.params.fileName);
});

// Intercept requests to /uploads/:fileName so missing disk files can be recovered from Firestore
app.get('/uploads/:fileName', async (req, res, next) => {
  const localFilePath = path.join(uploadsDir, req.params.fileName);
  if (fs.existsSync(localFilePath)) {
    return next();
  }
  await servePersistentMedia(req, res, req.params.fileName);
});

const ALLOWED_UPLOAD_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon'
];

async function saveBase64File(fileData: string, name?: string) {
  const fileBuffer = Buffer.from(fileData.split(',')[1] || fileData, 'base64');
  const rawMime = fileData.split(';')[0]?.split(':')[1] || 'image/jpeg';
  const mimeType = rawMime.toLowerCase();

  if (!ALLOWED_UPLOAD_MIME_TYPES.includes(mimeType)) {
    throw new Error('Invalid file type. Only .jpg, .png, .webp, .svg, and .ico files are allowed.');
  }

  const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1MB limit
  if (fileBuffer.length > MAX_SIZE_BYTES) {
    throw new Error('File size exceeds maximum allowed limit of 1MB (1024 KB).');
  }

  let url = '';

  // 1. Direct Cloud Storage / Firebase Storage upload (no local disk write)
  try {
    url = await uploadToFirebaseStorage(fileBuffer, mimeType, name);
  } catch (storageErr) {
    console.warn('Direct Cloud Storage upload notice, falling back to Firestore binary storage:', storageErr);
  }

  // 2. Fallback to Firestore persistent binary storage if Storage bucket is uninitialized
  if (!url) {
    const ext = (mimeType.split('/')[1] || 'jpg').split('+')[0];
    const fileName = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    await saveMediaFileToFirestore(fileName, mimeType, fileBuffer);
    url = `/api/media-file/${fileName}`;
  }

  return { url, size: fileBuffer.length, mimeType };
}

// Single Direct File Upload from Device
app.post('/api/upload', async (req, res) => {
  try {
    const { fileData, name, category, alt } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    const { url, mimeType, size } = await saveBase64File(fileData, name);
    
    const isVideo = mimeType.startsWith('video/');

    const newItem: MediaItem = {
      id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: name || (isVideo ? 'Device Video' : 'Device Image'),
      url,
      alt: alt || name || 'Uploaded Media Asset',
      category: category || 'General',
      type: isVideo ? 'video' : 'image',
      size: `${(size / 1024).toFixed(1)} KB`,
      createdAt: new Date().toISOString()
    };

    if (!cmsData.mediaItems) cmsData.mediaItems = [];
    cmsData.mediaItems.unshift(newItem);
    syncMediaItemToFirestore(newItem);
    saveDb();

    res.status(201).json({
      success: true,
      url,
      item: newItem,
      media: cmsData.mediaItems
    });
  } catch (err: any) {
    console.error('Error handling direct upload:', err);
    res.status(500).json({ error: 'Failed to process file upload: ' + err.message });
  }
});

// Multiple Files Upload from Device at once
app.post('/api/upload-multiple', async (req, res) => {
  try {
    const { files, category } = req.body;
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files array provided' });
    }

    const createdItems: MediaItem[] = [];

    for (const f of files) {
      if (!f.fileData) continue;
      const { url, size, mimeType } = await saveBase64File(f.fileData, f.name);
      const isVideo = mimeType.startsWith('video/') || url.match(/\.(mp4|webm|ogv|mov)$/i);

      const item: MediaItem = {
        id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        name: f.name || (isVideo ? 'Device Video' : 'Device Image'),
        url,
        alt: f.alt || f.name || 'Uploaded Media Asset',
        category: category || f.category || 'General',
        type: isVideo ? 'video' : 'image',
        size: `${(size / 1024).toFixed(1)} KB`,
        createdAt: new Date().toISOString()
      };

      createdItems.push(item);
    }

    if (!cmsData.mediaItems) cmsData.mediaItems = [];
    cmsData.mediaItems = [...createdItems, ...cmsData.mediaItems];
    for (const item of createdItems) {
      syncMediaItemToFirestore(item);
    }
    saveDb();

    res.status(201).json({
      success: true,
      items: createdItems,
      urls: createdItems.map(i => i.url),
      media: cmsData.mediaItems
    });
  } catch (err: any) {
    console.error('Error handling batch upload:', err);
    res.status(500).json({ error: 'Failed to upload files: ' + err.message });
  }
});

// Legacy POST /api/media
app.post('/api/media', (req, res) => {
  const newItem: MediaItem = {
    id: `m-${Date.now()}`,
    name: req.body.name || 'Uploaded Media Asset',
    url: req.body.url || '/src/assets/images/alham_hero_texture_1784995489832.jpg',
    alt: req.body.alt || 'Alham Confectionery Asset',
    category: req.body.category || 'General',
    type: req.body.type || (req.body.url?.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image'),
    createdAt: new Date().toISOString()
  };
  if (!cmsData.mediaItems) cmsData.mediaItems = [];
  cmsData.mediaItems.unshift(newItem);
  res.status(201).json({ success: true, item: newItem, media: cmsData.mediaItems });
});

// Replace Media File
app.post('/api/media/:id/replace', async (req, res) => {
  try {
    const { fileData, name } = req.body;
    if (!fileData) return res.status(400).json({ error: 'No replacement file data provided' });

    const itemIndex = (cmsData.mediaItems || []).findIndex(m => m.id === req.params.id);
    if (itemIndex === -1) return res.status(404).json({ error: 'Media asset not found' });

    const { url, size, mimeType } = await saveBase64File(fileData, name);
    const isVideo = mimeType.startsWith('video/') || url.match(/\.(mp4|webm|ogv|mov)$/i);

    const updatedItem = {
      ...cmsData.mediaItems[itemIndex],
      url,
      type: (isVideo ? 'video' : 'image') as 'video' | 'image',
      size: `${(size / 1024).toFixed(1)} KB`,
      updatedAt: new Date().toISOString()
    };

    cmsData.mediaItems[itemIndex] = updatedItem;

    saveDb();
  res.json({ success: true, item: updatedItem, media: cmsData.mediaItems });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to replace file: ' + err.message });
  }
});

app.delete('/api/media/:id', async (req, res) => {
  if (cmsData.mediaItems) {
    const target = cmsData.mediaItems.find(m => m.id === req.params.id);
    if (target) {
      if (target.url && target.url.startsWith('/uploads/')) {
        const fileName = target.url.replace('/uploads/', '');
        const localPath = path.join(uploadsDir, fileName);
        if (fs.existsSync(localPath)) {
          try { fs.unlinkSync(localPath); } catch (e) {}
        }
      }
      if (target.url && (target.url.includes('firebasestorage.googleapis.com') || target.url.includes('storage.googleapis.com'))) {
        try {
          const pathStart = target.url.indexOf('/o/') + 3;
          const pathEnd = target.url.indexOf('?');
          if (pathStart > 2 && pathEnd > pathStart) {
            const filePath = decodeURIComponent(target.url.substring(pathStart, pathEnd));
            await storage.bucket().file(filePath).delete().catch(() => {});
          }
        } catch (e) {}
      }
      purgeDeletedMediaUrl(target.url);
      cmsData.mediaItems = cmsData.mediaItems.filter(m => m.id !== req.params.id);
      deleteMediaItemFromFirestore(req.params.id);
    }
  }
  saveDb();
  res.json({ success: true, media: cmsData.mediaItems, cms: cmsData, products, ingredients, articles });
});


// COUPONS API
app.get('/api/coupons', (req, res) => {

  res.json({ coupons });
});

app.post('/api/coupons', (req, res) => {
  const newCoupon: Coupon = {
    id: `c-${Date.now()}`,
    code: req.body.code.toUpperCase(),
    discountType: req.body.discountType || 'percentage',
    discountValue: Number(req.body.discountValue) || 10,
    minOrderAmount: Number(req.body.minOrderAmount) || 0,
    active: true,
    usedCount: 0
  };
  coupons.unshift(newCoupon);
  res.status(201).json({ coupon: newCoupon });
});

app.post('/api/coupons/validate', (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = coupons.find(c => c.code.toUpperCase() === (code || '').toUpperCase() && c.active);
  if (!coupon) {
    return res.status(400).json({ error: 'Invalid or expired coupon code' });
  }
  if (subtotal < coupon.minOrderAmount) {
    return res.status(400).json({ error: `Minimum order amount for this coupon is ৳${coupon.minOrderAmount}` });
  }
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
  } else {
    discountAmount = coupon.discountValue;
  }
  saveDb();
  res.json({ success: true, coupon, discountAmount });
});

// ANALYTICS & ADMIN OVERVIEW
app.get('/api/admin/stats', (req, res) => {
  const totalSales = orders
    .filter(o => o.status !== 'Cancelled' && o.status !== 'Refunded')
    .reduce((sum, o) => sum + o.total, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = orders
    .filter(o => o.createdAt.startsWith(todayStr) && o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
  const completedOrders = orders.filter(o => o.status === 'Delivered').length;
  const lowStockCount = products.filter(p => p.stock < 10).length;


  res.json({
    stats: {
      totalSales,
      todaySales,
      totalOrders: orders.length,
      pendingOrders,
      completedOrders,
      lowStockCount,
      totalCustomers: users.length,
      conversionRate: 4.8
    }
  });
});

app.get('/api/admin/customers', (req, res) => {

  res.json({ customers: users });
});

app.put('/api/users/profile', async (req, res) => {
  const { id, email, name, phone, address } = req.body;
  if (!email && !id) {
    return res.status(400).json({ error: 'Email or User ID required' });
  }

  let user = users.find(u => (id && u.id === id) || (email && u.email.toLowerCase() === email.toLowerCase()));
  if (user) {
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    saveDb();
    syncUserToFirestore(user).catch(() => {});
    return res.json({ success: true, user });
  } else {
    const newUser: User = {
      id: id || `usr-${Date.now()}`,
      email: email || '',
      name: name || 'Customer',
      phone: phone || '',
      address: address || '',
      role: 'customer',
      rewardPoints: 0,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveDb();
    syncUserToFirestore(newUser).catch(() => {});
    return res.json({ success: true, user: newUser });
  }
});

async function initServerDatabase() {
  try {
    const firestoreData = await loadInitialDataFromFirestore();
    if (firestoreData) {
      if (firestoreData.products) {
        dbState.products = firestoreData.products;
        products = dbState.products;
      }
      if (firestoreData.users) {
        dbState.users = firestoreData.users;
        users = dbState.users;
      }
      if (firestoreData.orders) {
        dbState.orders = firestoreData.orders;
        orders = dbState.orders;
      }
      if (firestoreData.deliverySettings) {
        dbState.deliverySettings = firestoreData.deliverySettings;
        deliverySettings = dbState.deliverySettings;
      }
      if (firestoreData.paymentSettings) {
        dbState.paymentSettings = firestoreData.paymentSettings;
        paymentSettings = dbState.paymentSettings;
      }
      if (firestoreData.trackingSettings) {
        dbState.trackingSettings = firestoreData.trackingSettings;
        trackingSettings = dbState.trackingSettings;
      }
      if (firestoreData.cmsData) {
        dbState.cmsData = firestoreData.cmsData;
        cmsData = dbState.cmsData;
      }
      if (firestoreData.ingredients) {
        dbState.ingredients = firestoreData.ingredients;
        ingredients = dbState.ingredients;
      }
      if (firestoreData.articles) {
        dbState.articles = firestoreData.articles;
        articles = dbState.articles;
      }
      if (firestoreData.reviews) {
        dbState.reviews = firestoreData.reviews;
        reviews = dbState.reviews;
      }
      if (firestoreData.coupons) {
        dbState.coupons = firestoreData.coupons;
        coupons = dbState.coupons;
      }
      if (firestoreData.mediaItems && dbState.cmsData) {
        dbState.cmsData.mediaItems = firestoreData.mediaItems;
      }
      console.log('🎉 Server Database successfully synchronized with Firestore Cloud Database!');
    }

    // Sync any existing files in local uploads directory to Firestore media_files collection
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const fileName of files) {
        if (fileName.startsWith('.')) continue;
        const filePath = path.join(uploadsDir, fileName);
        if (fs.statSync(filePath).isFile()) {
          const ext = path.extname(fileName).replace('.', '').toLowerCase();
          const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg';
          const fileBuffer = fs.readFileSync(filePath);
          await saveMediaFileToFirestore(fileName, mimeType, fileBuffer).catch(() => {});
        }
      }
    }
  } catch (err: any) {
    console.warn('Notice: Firestore database init note:', err?.message || err);
  }
}

// VITE SERVER OR STATIC SERVING
async function startServer() {
  await initServerDatabase().catch(err => console.warn('Background Firestore sync notice:', err?.message || err));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ALHAM SERVER] Running on http://localhost:${PORT}`);
  });
}

startServer();

// --- New Endpoints for Payment, Orders & Notifications ---


app.get('/api/tracking-settings', (req, res) => {

  res.json(trackingSettings);
});

app.put('/api/tracking-settings', (req, res) => {
  trackingSettings = { ...trackingSettings, ...req.body };
  dbState.trackingSettings = trackingSettings;
  saveDb();
  res.json(trackingSettings);
});

app.get('/api/payment-settings', (req, res) => {

  res.json(paymentSettings);
});

app.put('/api/payment-settings', (req, res) => {
  paymentSettings = { ...paymentSettings, ...req.body };
  dbState.paymentSettings = paymentSettings;
  saveDb();
  res.json(paymentSettings);
});

app.get('/api/notifications', (req, res) => {
  const { email } = req.query;
  let userNotifications = notifications;
  if (email) {
    const user = users.find(u => u.email.toLowerCase() === (email as string).toLowerCase());
    if (user) {
      userNotifications = notifications.filter(n => n.userId === user.id);
    }
  }

  res.json(userNotifications);
});

app.put('/api/notifications/:id/read', (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.read = true;
  }
  saveDb();
  res.json({ success: true });
});

app.post('/api/orders/:id/payment', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  const paymentSubmission = req.body;
  order.paymentSubmission = {
    ...paymentSubmission,
    status: 'Pending Verification',
    date: new Date().toISOString()
  };
  order.paymentStatus = 'Payment Verification Pending';
  order.statusTimeline.push({ status: 'Payment Verification Pending', date: new Date().toISOString() });
  
  // Create notification for admin
  const adminIds = users.filter(u => u.role === 'super_admin').map(u => u.id);
  for (const adminId of adminIds) {
    notifications.push({
      id: `NOTIF-${Date.now()}-${Math.random()}`,
      userId: adminId,
      orderId: order.id,
      message: `New manual payment submitted for order ${order.id}.`,
      read: false,
      date: new Date().toISOString()
    });
  }
  
  saveDb();
    if (order.customerEmail) {
    sendOrderNotificationEmail({
      toEmail: order.customerEmail,
      orderId: order.id,
      customerName: order.customerName,
      subject: `Alham — Payment Verification Pending #${order.id}`,
      message: `We have received your payment information. Our team will verify your payment shortly.`
    });
  }
  res.json(order);
});

app.post('/api/orders/:id/verify-payment', (req, res) => {
  const { status, adminNote } = req.body; // 'Verified' or 'Rejected'
  const order = orders.find(o => o.id === req.params.id);
  if (!order || !order.paymentSubmission) {
    return res.status(404).json({ error: 'Order or payment submission not found' });
  }
  
  order.paymentSubmission.status = status;
  order.paymentSubmission.adminNote = adminNote;
  
  if (status === 'Verified') {
    order.paymentStatus = 'Verified';
    order.status = 'Confirmed';
    order.statusTimeline.push({ status: 'Payment Verified', date: new Date().toISOString() });
    order.statusTimeline.push({ status: 'Confirmed', date: new Date().toISOString() });
  } else {
    order.paymentStatus = 'Rejected';
    order.statusTimeline.push({ status: 'Pending', date: new Date().toISOString() });
  }
  
  // Notify customer
  const customer = users.find(u => u.email === order.customerEmail);
  if (customer) {
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
  }
  
  syncOrderToFirestore(order).catch(() => {});
  saveDb();
  res.json(order);
});

app.put('/api/orders/:id/status', (req, res) => {
  const { status, trackingNumber, courierName } = req.body;
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  order.status = status;
  order.statusTimeline.push({ status, date: new Date().toISOString() });
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (courierName) order.courierName = courierName;
  
  // Notify customer
  const customer = users.find(u => u.email === order.customerEmail);
  if (customer) {
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
  }
  
  syncOrderToFirestore(order).catch(() => {});
  saveDb();
  res.json(order);
});
