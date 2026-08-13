/**
 * Central Analytics & Tracking Manager
 * Standardized for Meta Pixel (ID: 2122418222034322) and Google Tag Manager (ID: GTM-KKPGMZG9)
 */

export const META_PIXEL_ID = '2122418222034322';
export const GTM_CONTAINER_ID = 'GTM-KKPGMZG9';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
    dataLayer: any[];
  }
}

/**
 * Pushes raw dataLayer event safely
 */
export const pushDataLayer = (payload: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
};

/**
 * PageView tracking
 */
export const trackPageView = (pageData?: { title?: string; location?: string; path?: string }) => {
  if (typeof window === 'undefined') return;

  // 1. Meta Pixel PageView
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }

  // 2. GTM dataLayer page_view
  pushDataLayer({
    event: 'page_view',
    page_path: pageData?.path || window.location.pathname,
    page_location: pageData?.location || window.location.href,
    page_title: pageData?.title || document.title
  });
};

/**
 * ViewContent / view_item tracking
 */
export const trackViewItem = (product: {
  id: string;
  sku?: string;
  name: string;
  price: number;
  category?: string;
  weight?: string;
}) => {
  if (typeof window === 'undefined' || !product) return;

  const itemId = product.sku || product.id;
  const price = Number(product.price || 0);

  // 1. Meta Pixel ViewContent
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'ViewContent', {
      content_ids: [itemId],
      content_name: product.name,
      content_type: 'product',
      value: price,
      currency: 'BDT'
    });
  }

  // 2. GTM dataLayer view_item
  pushDataLayer({ ecommerce: null });
  pushDataLayer({
    event: 'view_item',
    currency: 'BDT',
    value: price,
    content_ids: [itemId],
    content_type: 'product',
    ecommerce: {
      currency: 'BDT',
      value: price,
      items: [
        {
          item_id: itemId,
          item_name: product.name,
          price: price,
          quantity: 1,
          item_category: product.category || 'Confectionery',
          item_variant: product.weight || ''
        }
      ]
    }
  });
};

/**
 * AddToCart / add_to_cart tracking
 */
export const trackAddToCart = (
  product: {
    id: string;
    sku?: string;
    name: string;
    price: number;
    category?: string;
    weight?: string;
  },
  quantity: number = 1
) => {
  if (typeof window === 'undefined' || !product) return;

  const itemId = product.sku || product.id;
  const price = Number(product.price || 0);
  const qty = Number(quantity || 1);
  const value = price * qty;

  // 1. Meta Pixel AddToCart
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'AddToCart', {
      content_ids: [itemId],
      content_name: product.name,
      content_type: 'product',
      value: value,
      currency: 'BDT',
      contents: [{ id: itemId, quantity: qty, item_price: price }]
    });
  }

  // 2. GTM dataLayer add_to_cart
  pushDataLayer({ ecommerce: null });
  pushDataLayer({
    event: 'add_to_cart',
    currency: 'BDT',
    value: value,
    content_ids: [itemId],
    content_type: 'product',
    num_items: qty,
    ecommerce: {
      currency: 'BDT',
      value: value,
      items: [
        {
          item_id: itemId,
          item_name: product.name,
          price: price,
          quantity: qty,
          item_category: product.category || 'Confectionery',
          item_variant: product.weight || ''
        }
      ]
    }
  });
};

/**
 * ViewCart / view_cart tracking
 */
export const trackViewCart = (
  cartItems: Array<{
    product: { id: string; sku?: string; name: string; price: number; category?: string; weight?: string };
    quantity: number;
    selectedWeight?: string;
  }>,
  cartTotal: number
) => {
  if (typeof window === 'undefined' || !cartItems) return;

  const items = cartItems.map((item) => ({
    item_id: item.product.sku || item.product.id,
    item_name: item.product.name,
    price: Number(item.product.price || 0),
    quantity: Number(item.quantity || 1),
    item_category: item.product.category || 'Confectionery',
    item_variant: item.selectedWeight || item.product.weight || ''
  }));

  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalVal = Number(cartTotal || 0);

  // GTM dataLayer view_cart
  pushDataLayer({ ecommerce: null });
  pushDataLayer({
    event: 'view_cart',
    currency: 'BDT',
    value: totalVal,
    content_ids: items.map((i) => i.item_id),
    content_type: 'product',
    num_items: totalQty,
    ecommerce: {
      currency: 'BDT',
      value: totalVal,
      items
    }
  });
};

/**
 * InitiateCheckout / begin_checkout tracking
 */
export const trackBeginCheckout = (
  cartItems: Array<{
    product: { id: string; sku?: string; name: string; price: number; category?: string; weight?: string };
    quantity: number;
    selectedWeight?: string;
  }>,
  cartTotal: number,
  coupon?: string
) => {
  if (typeof window === 'undefined' || !cartItems) return;

  const items = cartItems.map((item) => ({
    item_id: item.product.sku || item.product.id,
    item_name: item.product.name,
    price: Number(item.product.price || 0),
    quantity: Number(item.quantity || 1),
    item_category: item.product.category || 'Confectionery',
    item_variant: item.selectedWeight || item.product.weight || ''
  }));

  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalVal = Number(cartTotal || 0);

  // 1. Meta Pixel InitiateCheckout
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: items.map((i) => i.item_id),
      content_type: 'product',
      value: totalVal,
      currency: 'BDT',
      num_items: totalQty,
      contents: items.map((i) => ({ id: i.item_id, quantity: i.quantity }))
    });
  }

  // 2. GTM dataLayer begin_checkout
  pushDataLayer({ ecommerce: null });
  pushDataLayer({
    event: 'begin_checkout',
    currency: 'BDT',
    value: totalVal,
    coupon: coupon || undefined,
    content_ids: items.map((i) => i.item_id),
    content_type: 'product',
    num_items: totalQty,
    ecommerce: {
      currency: 'BDT',
      value: totalVal,
      coupon: coupon || undefined,
      items
    }
  });
};

/**
 * Purchase tracking with Idempotency Protection (Guarantees single execution per Order ID)
 */
export const trackPurchase = (order: {
  id: string;
  total: number;
  deliveryFee?: number;
  discount?: number;
  items: Array<{
    productId?: string;
    sku?: string;
    productName?: string;
    name?: string;
    price: number;
    quantity: number;
    category?: string;
    weight?: string;
  }>;
}) => {
  if (typeof window === 'undefined' || !order || !order.id) return;

  // Idempotency check: Ensure purchase for this order ID fires only ONCE
  const storageKey = `alham_purchase_tracked_${order.id}`;
  if (localStorage.getItem(storageKey)) {
    console.log(`[Analytics] Purchase event for order "${order.id}" already tracked. Skipping duplicate.`);
    return;
  }

  const orderItems = (order.items || []).map((item) => ({
    item_id: item.sku || item.productId || 'UNKNOWN',
    item_name: item.productName || item.name || 'Product',
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 1),
    item_category: item.category || 'Confectionery',
    item_variant: item.weight || ''
  }));

  const totalQty = orderItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalVal = Number(order.total || 0);

  // 1. Meta Pixel Purchase
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Purchase', {
      content_ids: orderItems.map((i) => i.item_id),
      content_type: 'product',
      value: totalVal,
      currency: 'BDT',
      num_items: totalQty,
      order_id: order.id,
      contents: orderItems.map((i) => ({ id: i.item_id, quantity: i.quantity, item_price: i.price }))
    });
  }

  // 2. GTM dataLayer purchase
  pushDataLayer({ ecommerce: null });
  pushDataLayer({
    event: 'purchase',
    currency: 'BDT',
    value: totalVal,
    transaction_id: order.id,
    content_ids: orderItems.map((i) => i.item_id),
    content_type: 'product',
    num_items: totalQty,
    ecommerce: {
      transaction_id: order.id,
      currency: 'BDT',
      value: totalVal,
      shipping: Number(order.deliveryFee || 0),
      discount: Number(order.discount || 0),
      items: orderItems
    }
  });

  // Mark as tracked
  try {
    localStorage.setItem(storageKey, 'true');
  } catch (e) {
    // Ignore storage quota errors
  }
};

/**
 * Universal trackEvent dispatcher that maps event names to standard analytics tracking
 */
export const trackEvent = (eventName: string, data: any = {}) => {
  const normEvent = String(eventName).toLowerCase();

  if (normEvent === 'pageview' || normEvent === 'page_view') {
    trackPageView(data);
  } else if (normEvent === 'viewcontent' || normEvent === 'view_item') {
    if (data.product) {
      trackViewItem(data.product);
    } else if (data.items?.[0]) {
      const first = data.items[0];
      trackViewItem({
        id: first.item_id || first.id || data.content_ids?.[0],
        sku: first.sku || first.item_id,
        name: first.item_name || first.name,
        price: first.price || data.value,
        category: first.item_category,
        weight: first.item_variant
      });
    }
  } else if (normEvent === 'addtocart' || normEvent === 'add_to_cart') {
    if (data.product) {
      trackAddToCart(data.product, data.quantity || 1);
    } else if (data.items?.[0]) {
      const first = data.items[0];
      trackAddToCart(
        {
          id: first.item_id || first.id || data.content_ids?.[0],
          sku: first.sku || first.item_id,
          name: first.item_name || first.name,
          price: first.price,
          category: first.item_category,
          weight: first.item_variant
        },
        first.quantity || data.quantity || 1
      );
    }
  } else if (normEvent === 'viewcart' || normEvent === 'view_cart') {
    if (data.cartItems && data.cartTotal !== undefined) {
      trackViewCart(data.cartItems, data.cartTotal);
    } else if (data.items) {
      const cartItems = data.items.map((i: any) => ({
        product: { id: i.item_id, sku: i.item_id, name: i.item_name, price: i.price, category: i.item_category, weight: i.item_variant },
        quantity: i.quantity
      }));
      trackViewCart(cartItems, data.value || 0);
    }
  } else if (normEvent === 'initiatecheckout' || normEvent === 'begin_checkout') {
    if (data.cartItems && data.cartTotal !== undefined) {
      trackBeginCheckout(data.cartItems, data.cartTotal, data.coupon);
    } else if (data.items) {
      const cartItems = data.items.map((i: any) => ({
        product: { id: i.item_id, sku: i.item_id, name: i.item_name, price: i.price, category: i.item_category, weight: i.item_variant },
        quantity: i.quantity
      }));
      trackBeginCheckout(cartItems, data.value || 0, data.coupon);
    }
  } else if (normEvent === 'purchase') {
    trackPurchase({
      id: data.id || data.order_id || data.transaction_id,
      total: data.total || data.value,
      deliveryFee: data.deliveryFee || data.shipping,
      discount: data.discount,
      items: data.items
    });
  } else {
    // Custom non-ecommerce event push to dataLayer
    pushDataLayer({
      event: eventName,
      ...data
    });
  }
};
