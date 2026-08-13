export type OrderStatus =
  | 'Pending'
  | 'Payment Verification Pending'
  | 'Payment Verified'
  | 'Confirmed'
  | 'Preparing'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';


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


export interface TrackingSettings {
  gtm: { enabled: boolean; containerId: string };
  ga4: { enabled: boolean; measurementId: string };
  metaPixel: { enabled: boolean; pixelId: string };
  googleAds: { enabled: boolean; conversionId: string; conversionLabel: string };
  tikTokPixel: { enabled: boolean; pixelId: string };
  customScripts: { headScript: string; bodyScript: string; footerScript: string };
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

export type UserRole = 'super_admin' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  addresses?: Address[];
  rewardPoints?: number;
  tags?: string[];
  notes?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface IngredientInfo {
  id: string;
  name: string;
  description: string;
  origin: string;
  image: string;
  benefit: string;
  flavorNotes: string;
  ctaEnabled?: boolean;
  ctaText?: string;
  ctaLink?: string;
  openInNewTab?: boolean;
}

export type Language = 'en' | 'bn';

export interface DeliveryZone {
  id: string;
  name: string;
  nameEn?: string;
  nameBn?: string;
  standardFee: number;
  expressFee: number;
  freeDeliveryMinAmount: number;
  estimatedTime: string;
  estimatedTimeEn?: string;
  estimatedTimeBn?: string;
  active: boolean;
}

export interface DeliverySettings {
  freeDeliveryEnabled: boolean;
  globalFreeDeliveryMinAmount?: number;
  globalFreeDeliveryThreshold?: number;
  zones: DeliveryZone[];
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  nameBn?: string;
  subtitle: string;
  subtitleBn?: string;
  category: 'Date Collection' | 'Indulgent' | 'Gift Boxes' | 'Nuts & Seeds';
  categoryBn?: string;
  collection?: string;
  collectionBn?: string;
  price: number; // In BDT
  originalPrice?: number;
  weight: string; // e.g., "250g", "500g", "Pack of 6"
  weightBn?: string;
  description: string;
  descriptionBn?: string;
  story: string;
  storyBn?: string;
  images: string[];
  videoUrl?: string;
  ingredients: string[];
  ingredientsBn?: string[];
  allergens: string[];
  allergensBn?: string[];
  tasteProfile: {
    sweetness: number; // 1-5
    richness: number;  // 1-5
    crunch: number;    // 1-5
  };
  tasteProfileBn?: {
    notesBn?: string;
  };
  nutrition: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    sugars: string;
  };
  nutritionBn?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
    sugars?: string;
  };
  storageInstructions: string;
  storageInstructionsBn?: string;
  shelfLife: string;
  shelfLifeBn?: string;
  deliveryInfo: string;
  deliveryInfoBn?: string;
  shippingInfo?: string;
  shippingInfoBn?: string;
  badge?: string;
  badgeBn?: string;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNew?: boolean;
  showInHeroSpotlight?: boolean;
  showInMindfulSection?: boolean;
  showInSignatureSection?: boolean;
  isAllProducts?: boolean;
  stock: number;
  rating: number;
  reviewCount: number;
  relatedProductIds?: string[];
  relatedProductsMode?: 'auto' | 'manual';
  status?: 'active' | 'draft' | 'archived';
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedWeight?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku?: string;
  price: number;
  quantity: number;
  weight: string;
  image: string;
}

export interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'Cash on Delivery' | 'bKash' | 'Nagad' | 'Rocket' | 'Card / Online Payment';
  paymentStatus: 'Pending / Cash on Delivery' | 'Payment Verification Pending' | 'Verified' | 'Rejected' | 'Paid';
  paymentSubmission?: PaymentSubmission;
  statusTimeline: { status: OrderStatus; date: string }[];
  trackingNumber?: string;
  courierName?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Article {
  id: string;
  title: string;
  category: 'Recipes' | 'Ingredient Stories' | 'Healthy Snacking' | 'Behind the Craft' | 'Lifestyle';
  readTime: string;
  author: string;
  date: string;
  image: string;
  excerpt: string;
  content: string;
  tags: string[];
  shopCtaEnabled?: boolean;
  shopCtaText?: string;
  shopCtaLink?: string;
  openInNewTab?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 15 for 15% or 100 for 100 BDT
  minOrderAmount: number;
  active: boolean;
  usedCount: number;
}

export interface AdminStats {
  totalSales: number;
  todaySales: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockCount: number;
  totalCustomers: number;
  conversionRate: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface SiteSettings {
  brandName: string;
  brandTagline: string;
  logoType: 'text' | 'image';
  logoImageUrl: string;
  footerLogoUrl?: string;
  logoDarkUrl: string;
  logoLightUrl: string;
  faviconUrl: string;
  websiteTitle: string;
  websiteDescription: string;
  metaTitle: string;
  metaDescription: string;
  defaultSeoImage: string;
  currency: string;
  currencySymbol: string;
  timeZone: string;
  country: string;
  defaultDeliveryCharge: number;
  freeDeliveryThreshold: number;
  minOrderAmount: number;
}

export interface ContactInfo {
  businessEmail: string;
  supportEmail: string;
  phone: string;
  whatsApp: string;
  address: string;
  openingHours: string;
  googleMapsUrl: string;
  enableWhatsAppWidget?: boolean;
  whatsAppWidgetMessage?: string;
  whatsAppWidgetNumber?: string;
}

export interface SocialLinkItem {
  id: string;
  platform: 'facebook' | 'instagram' | 'whatsApp' | 'youtube' | 'tiktok' | 'linkedin' | 'twitter' | 'custom';
  title: string;
  url: string;
  enabled: boolean;
  iconName?: string;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  tikTok: string;
  youTube: string;
  whatsApp: string;
  linkedIn?: string;
  twitter?: string;
  customLinks?: SocialLinkItem[];
}

export interface TopBarConfig {
  enabled: boolean;
  text: string;
  textEn?: string;
  textBn?: string;
  showLink?: boolean;
  linkText: string;
  linkTextEn?: string;
  linkTextBn?: string;
  linkUrl: string;
  backgroundColor: string;
  textColor: string;
}

export interface NavItem {
  id: string;
  label: string;
  view: string;
  visible: boolean;
  order: number;
  badge?: string;
}

export interface HeaderNavConfig {
  stickyHeader: boolean;
  items: NavItem[];
}

export interface SectionOrderItem {
  id: string;
  name: string;
  enabled: boolean;
  type: string;
}

export interface HeroSectionConfig {
  badge: string;
  headlineFirst: string;
  headlineSecond: string;
  headlineHighlight: string;
  subheading: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  alhamCircleTitle: string;
  alhamCircleSubtitle: string;
  card1ProductId: string;
  card2ProductId: string;
  card3ProductId: string;
}

export interface MindfulIndulgenceConfig {
  badge: string;
  headingMain: string;
  headingHighlight: string;
  description: string;
}

export interface CraftFeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface CraftPhilosophyConfig {
  badge: string;
  headingMain: string;
  headingHighlight: string;
  paragraph1: string;
  paragraph2: string;
  mainImage: string;
  hygieneBadgeTitle: string;
  hygieneBadgeText: string;
  features: CraftFeatureItem[];
}

export interface ProcessStepItem {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface ProcessTimelineConfig {
  badge: string;
  headingMain: string;
  headingHighlight: string;
  description: string;
  steps: ProcessStepItem[];
}

export interface WellnessCardItem {
  id: string;
  title: string;
  description: string;
  image: string;
  tag: string;
  icon?: string;
  enabled: boolean;
  ctaEnabled?: boolean;
  ctaText?: string;
  ctaLink?: string;
  openInNewTab?: boolean;
}

export interface WellnessLifestyleConfig {
  badge: string;
  headingMain: string;
  headingHighlight: string;
  description: string;
  cards: WellnessCardItem[];
  defaultCtaText?: string;
  defaultCtaLink?: string;
  defaultCtaEnabled?: boolean;
}

export interface CommunityConfig {
  badge: string;
  headingMain: string;
  headingHighlight: string;
  description: string;
  communityImage: string;
}

export interface TrustBadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface TrustBadgesConfig {
  enabled: boolean;
  items: TrustBadgeItem[];
}

export interface FooterConfig {
  brandName: string;
  description: string;
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterPlaceholder: string;
  newsletterButtonText: string;
  copyrightText: string;
}

export interface MicrocopyDictionary {
  exploreButton: string;
  ourStoryButton: string;
  buyNowButton: string;
  addToCartButton: string;
  detailsButton: string;
  cartLabel: string;
  signInLabel: string;
  comingSoonLabel: string;
  viewDetailsLabel: string;
  soldOutLabel: string;
  inStockLabel: string;
  freeDeliveryBadge: string;
  guaranteeBadge: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  enabled: boolean;
}

export interface LegalPagesConfig {
  privacyPolicy: string;
  termsConditions: string;
  shippingPolicy: string;
  returnPolicy: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  alt: string;
  category: string;
  type?: 'image' | 'video';
  size?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HomepageConfig {
  signatureCreations: {
    productIds: string[];
    displayCount: number;
    mode: 'featured' | 'manual' | 'collection';
    category?: string;
  };
  allProducts: {
    enabled: boolean;
    productsPerRow: number;
  };
}

export interface CompleteCmsData {
  settings?: any;
  footerConfig?: any;
  navConfig?: any;
  siteSettings: SiteSettings;
  contactInfo: ContactInfo;
  socialLinks: SocialLinks;
  topBar: TopBarConfig;
  headerNav: HeaderNavConfig;
  dictionary: MicrocopyDictionary;
  sectionOrder: SectionOrderItem[];
  heroSection: HeroSectionConfig;
  mindfulIndulgenceSection: MindfulIndulgenceConfig;
  craftPhilosophySection: CraftPhilosophyConfig;
  processTimelineSection: ProcessTimelineConfig;
  wellnessLifestyleSection: WellnessLifestyleConfig;
  communitySection: CommunityConfig;
  trustBadgesSection: TrustBadgesConfig;
  footerSection: FooterConfig;
  homepageConfig: HomepageConfig;
  faqs: FaqItem[];
  legalPages: LegalPagesConfig;
  mediaItems: MediaItem[];
}


export interface HomepageContent {
  heroHeadline: string;
  heroSubheading: string;
  heroImage: string;
  philosophyTitle: string;
  philosophyText: string;
  bannerMessage: string;
}

