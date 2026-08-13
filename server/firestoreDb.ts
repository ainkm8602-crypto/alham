import { db } from './firebaseAdmin';
import {
  initialProducts,
  initialCmsData,
  initialDeliverySettings,
  initialIngredients,
  initialArticles,
  initialReviews,
  initialCoupons
} from '../src/data/initialData';

function cleanObject(obj: any): any {
  if (obj === undefined) return null;
  return JSON.parse(JSON.stringify(obj));
}

function handleFirestoreError(action: string, err: any) {
  if (err?.code === 5 || err?.code === 7 || err?.message?.includes('NOT_FOUND') || err?.message?.includes('PERMISSION_DENIED')) {
    console.warn(`Notice (${action}): Firestore database setup pending or permission required on cloud project. Operating on local storage.`);
  } else {
    console.warn(`Notice (${action}): Firestore sync note:`, err?.message || err);
  }
}

export async function loadInitialDataFromFirestore() {
  try {
    console.log('🔥 Connecting to Firestore Cloud Database...');

    // Load Products
    const prodSnap = await db.collection('products').get();
    let products = prodSnap.docs.map(d => d.data());
    if (products.length === 0) {
      console.log('🌱 Seeding initial products to Firestore...');
      for (const p of initialProducts) {
        await db.doc(`products/${p.id}`).set(cleanObject(p));
      }
      products = [...initialProducts];
    }

    // Load Users
    const userSnap = await db.collection('users').get();
    let users = userSnap.docs.map(d => d.data());

    // Load Orders
    const orderSnap = await db.collection('orders').get();
    let orders = orderSnap.docs.map(d => d.data());

    // Load Settings
    const deliveryDoc = await db.doc('settings/delivery').get();
    let deliverySettings = deliveryDoc.exists ? deliveryDoc.data() : null;
    if (!deliverySettings) {
      console.log('🌱 Seeding initial delivery settings to Firestore...');
      await db.doc('settings/delivery').set(cleanObject(initialDeliverySettings));
      deliverySettings = { ...initialDeliverySettings };
    }

    const paymentDoc = await db.doc('settings/payment').get();
    let paymentSettings = paymentDoc.exists ? paymentDoc.data() : null;
    if (!paymentSettings) {
      const defaultPayment = {
        bKash: { enabled: false, number: '01XXXXXXXXX', accountType: 'Personal', instructions: 'Send the exact amount', referenceInstructions: 'Use your Order ID as reference', transactionIdInstructions: 'Enter the Transaction ID below', requireScreenshot: true },
        nagad: { enabled: false, number: '01XXXXXXXXX', accountType: 'Personal', instructions: 'Send the exact amount', referenceInstructions: 'Use your Order ID as reference', transactionIdInstructions: 'Enter the Transaction ID below', requireScreenshot: true },
        rocket: { enabled: false, number: '01XXXXXXXXX', accountType: 'Personal', instructions: 'Send the exact amount', referenceInstructions: 'Use your Order ID as reference', transactionIdInstructions: 'Enter the Transaction ID below', requireScreenshot: true },
        cashOnDelivery: { enabled: true, charge: 80, minOrder: 0, maxOrder: 10000, instructions: 'Pay cash upon delivery' }
      };
      await db.doc('settings/payment').set(cleanObject(defaultPayment));
      paymentSettings = defaultPayment;
    }

    const trackingDoc = await db.doc('settings/tracking').get();
    let trackingSettings = trackingDoc.exists ? trackingDoc.data() : null;
    if (!trackingSettings) {
      const defaultTracking = {
        gtm: { enabled: true, containerId: 'GTM-WRRNCLCK' },
        ga4: { enabled: true, measurementId: 'G-49NPC58FRP' },
        metaPixel: { enabled: false, pixelId: '' },
        googleAds: { enabled: false, conversionId: '', conversionLabel: '' },
        tikTokPixel: { enabled: false, pixelId: '' },
        customScripts: { headScript: '', bodyScript: '', footerScript: '' }
      };
      await db.doc('settings/tracking').set(cleanObject(defaultTracking));
      trackingSettings = defaultTracking;
    }

    // Load CMS Main Data
    const cmsDoc = await db.doc('cms/main').get();
    let cmsData = cmsDoc.exists ? cmsDoc.data() : null;
    if (!cmsData) {
      console.log('🌱 Seeding initial CMS data to Firestore...');
      await db.doc('cms/main').set(cleanObject(initialCmsData));
      cmsData = JSON.parse(JSON.stringify(initialCmsData));
    } else if (cmsData.cms && typeof cmsData.cms === 'object') {
      // Clean up legacy wrapper if present
      cmsData = { ...cmsData.cms, ...cmsData };
      delete cmsData.cms;
    }

    // Load Ingredients
    const ingSnap = await db.collection('ingredients').get();
    let ingredients = ingSnap.docs.map(d => d.data());
    if (ingredients.length === 0) {
      console.log('🌱 Seeding initial ingredients to Firestore...');
      for (const ing of initialIngredients) {
        await db.doc(`ingredients/${ing.id}`).set(cleanObject(ing));
      }
      ingredients = [...initialIngredients];
    }

    // Load Articles
    const artSnap = await db.collection('articles').get();
    let articles = artSnap.docs.map(d => d.data());
    if (articles.length === 0) {
      console.log('🌱 Seeding initial articles to Firestore...');
      for (const art of initialArticles) {
        await db.doc(`articles/${art.id}`).set(cleanObject(art));
      }
      articles = [...initialArticles];
    }

    // Load Reviews
    const revSnap = await db.collection('reviews').get();
    let reviews = revSnap.docs.map(d => d.data());
    if (reviews.length === 0) {
      console.log('🌱 Seeding initial reviews to Firestore...');
      for (const rev of initialReviews) {
        await db.doc(`reviews/${rev.id}`).set(cleanObject(rev));
      }
      reviews = [...initialReviews];
    }

    // Load Coupons
    const couponSnap = await db.collection('coupons').get();
    let coupons = couponSnap.docs.map(d => d.data());
    if (coupons.length === 0 && initialCoupons.length > 0) {
      console.log('🌱 Seeding initial coupons to Firestore...');
      for (const c of initialCoupons) {
        await db.doc(`coupons/${c.id}`).set(cleanObject(c));
      }
      coupons = [...initialCoupons];
    }

    // Load Media
    const mediaSnap = await db.collection('media').get();
    let mediaItems = mediaSnap.docs.map(d => d.data());
    if (mediaItems.length === 0 && cmsData.mediaItems && cmsData.mediaItems.length > 0) {
      for (const m of cmsData.mediaItems) {
        if (m.id) await db.doc(`media/${m.id}`).set(cleanObject(m));
      }
      mediaItems = [...cmsData.mediaItems];
    } else if (mediaItems.length > 0) {
      cmsData.mediaItems = mediaItems;
    }

    console.log(`✅ Loaded from Firestore: ${products.length} products, ${ingredients.length} ingredients, ${articles.length} articles, ${reviews.length} reviews, ${mediaItems.length} media assets.`);

    return {
      products,
      users,
      orders,
      deliverySettings,
      paymentSettings,
      trackingSettings,
      cmsData,
      ingredients,
      articles,
      reviews,
      coupons,
      mediaItems
    };
  } catch (err: any) {
    handleFirestoreError('load initial data from Firestore', err);
    return null;
  }
}

export async function syncProductToFirestore(product: any) {
  if (!product?.id) return;
  try {
    await db.doc(`products/${product.id}`).set(cleanObject(product));
  } catch (err: any) {
    handleFirestoreError('sync product to Firestore', err);
  }
}

export async function deleteProductFromFirestore(id: string) {
  if (!id) return;
  try {
    await db.doc(`products/${id}`).delete();
  } catch (err: any) {
    handleFirestoreError('delete product from Firestore', err);
  }
}

export async function syncIngredientToFirestore(ing: any) {
  if (!ing?.id) return;
  try {
    await db.doc(`ingredients/${ing.id}`).set(cleanObject(ing));
  } catch (err: any) {
    handleFirestoreError('sync ingredient to Firestore', err);
  }
}

export async function deleteIngredientFromFirestore(id: string) {
  if (!id) return;
  try {
    await db.doc(`ingredients/${id}`).delete();
  } catch (err: any) {
    handleFirestoreError('delete ingredient from Firestore', err);
  }
}

export async function syncArticleToFirestore(art: any) {
  if (!art?.id) return;
  try {
    await db.doc(`articles/${art.id}`).set(cleanObject(art));
  } catch (err: any) {
    handleFirestoreError('sync article to Firestore', err);
  }
}

export async function deleteArticleFromFirestore(id: string) {
  if (!id) return;
  try {
    await db.doc(`articles/${id}`).delete();
  } catch (err: any) {
    handleFirestoreError('delete article from Firestore', err);
  }
}

export async function syncReviewToFirestore(rev: any) {
  if (!rev?.id) return;
  try {
    await db.doc(`reviews/${rev.id}`).set(cleanObject(rev));
  } catch (err: any) {
    handleFirestoreError('sync review to Firestore', err);
  }
}

export async function deleteReviewFromFirestore(id: string) {
  if (!id) return;
  try {
    await db.doc(`reviews/${id}`).delete();
  } catch (err: any) {
    handleFirestoreError('delete review from Firestore', err);
  }
}

export async function syncCouponToFirestore(coupon: any) {
  if (!coupon?.id) return;
  try {
    await db.doc(`coupons/${coupon.id}`).set(cleanObject(coupon));
  } catch (err: any) {
    handleFirestoreError('sync coupon to Firestore', err);
  }
}

export async function deleteCouponFromFirestore(id: string) {
  if (!id) return;
  try {
    await db.doc(`coupons/${id}`).delete();
  } catch (err: any) {
    handleFirestoreError('delete coupon from Firestore', err);
  }
}

export async function syncOrderToFirestore(order: any) {
  if (!order?.id) return;
  try {
    await db.doc(`orders/${order.id}`).set(cleanObject(order));
  } catch (err: any) {
    handleFirestoreError('sync order to Firestore', err);
  }
}

export async function syncUserToFirestore(user: any) {
  if (!user?.id) return;
  try {
    await db.doc(`users/${user.id}`).set(cleanObject(user));
  } catch (err: any) {
    handleFirestoreError('sync user to Firestore', err);
  }
}

export async function syncSettingsToFirestore(type: 'delivery' | 'payment' | 'tracking', data: any) {
  if (!data) return;
  try {
    await db.doc(`settings/${type}`).set(cleanObject(data));
  } catch (err: any) {
    handleFirestoreError(`sync settings (${type}) to Firestore`, err);
  }
}

export async function syncCmsDataToFirestore(cmsData: any) {
  if (!cmsData) return;
  try {
    const cleaned = cleanObject(cmsData);
    delete cleaned.cms;
    await db.doc('cms/main').set(cleaned);
  } catch (err: any) {
    handleFirestoreError('sync CMS data to Firestore', err);
  }
}

export async function syncMediaItemToFirestore(mediaItem: any) {
  if (!mediaItem?.id) return;
  try {
    await db.doc(`media/${mediaItem.id}`).set(cleanObject(mediaItem));
  } catch (err: any) {
    handleFirestoreError('sync media item to Firestore', err);
  }
}

export async function deleteMediaItemFromFirestore(id: string) {
  if (!id) return;
  try {
    await db.doc(`media/${id}`).delete();
  } catch (err: any) {
    handleFirestoreError('delete media item from Firestore', err);
  }
}

export async function syncAllToFirestore(dbState: any) {
  if (!dbState) return;

  try {
    if (dbState.cmsData) {
      await syncCmsDataToFirestore(dbState.cmsData);
    }
    if (dbState.deliverySettings) {
      await syncSettingsToFirestore('delivery', dbState.deliverySettings);
    }
    if (dbState.paymentSettings) {
      await syncSettingsToFirestore('payment', dbState.paymentSettings);
    }
    if (dbState.trackingSettings) {
      await syncSettingsToFirestore('tracking', dbState.trackingSettings);
    }
    if (Array.isArray(dbState.products)) {
      for (const p of dbState.products) {
        if (p.id) await syncProductToFirestore(p);
      }
    }
    if (Array.isArray(dbState.ingredients)) {
      for (const ing of dbState.ingredients) {
        if (ing.id) await syncIngredientToFirestore(ing);
      }
    }
    if (Array.isArray(dbState.articles)) {
      for (const art of dbState.articles) {
        if (art.id) await syncArticleToFirestore(art);
      }
    }
    if (Array.isArray(dbState.reviews)) {
      for (const rev of dbState.reviews) {
        if (rev.id) await syncReviewToFirestore(rev);
      }
    }
    if (Array.isArray(dbState.coupons)) {
      for (const c of dbState.coupons) {
        if (c.id) await syncCouponToFirestore(c);
      }
    }
  } catch (err: any) {
    handleFirestoreError('sync all to Firestore', err);
  }
}

export async function saveMediaFileToFirestore(fileName: string, mimeType: string, fileBuffer: Buffer) {
  try {
    const base64Str = fileBuffer.toString('base64');
    const MAX_DOC_SIZE = 750000; // ~750KB chunk size

    if (base64Str.length <= MAX_DOC_SIZE) {
      await db.doc(`media_files/${fileName}`).set({
        id: fileName,
        mimeType,
        size: fileBuffer.length,
        data: base64Str,
        createdAt: new Date().toISOString()
      });
    } else {
      const chunks: string[] = [];
      for (let i = 0; i < base64Str.length; i += MAX_DOC_SIZE) {
        chunks.push(base64Str.substring(i, i + MAX_DOC_SIZE));
      }

      await db.doc(`media_files/${fileName}`).set({
        id: fileName,
        mimeType,
        size: fileBuffer.length,
        totalChunks: chunks.length,
        createdAt: new Date().toISOString()
      });

      for (let i = 0; i < chunks.length; i++) {
        await db.doc(`media_files/${fileName}_chunk_${i}`).set({
          chunkIndex: i,
          data: chunks[i]
        });
      }
    }
    console.log(`✅ Saved persistent media file to Firestore: media_files/${fileName} (${(fileBuffer.length / 1024).toFixed(1)} KB)`);
  } catch (err: any) {
    handleFirestoreError(`save media file ${fileName}`, err);
  }
}

export async function getMediaFileFromFirestore(fileName: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
  try {
    const docRef = db.doc(`media_files/${fileName}`);
    const snap = await docRef.get();
    if (!snap.exists) return null;

    const docData = snap.data();
    if (!docData) return null;

    let base64Full = '';
    if (docData.data) {
      base64Full = docData.data;
    } else if (docData.totalChunks && docData.totalChunks > 0) {
      const chunkPromises = [];
      for (let i = 0; i < docData.totalChunks; i++) {
        chunkPromises.push(db.doc(`media_files/${fileName}_chunk_${i}`).get());
      }
      const chunkSnaps = await Promise.all(chunkPromises);
      base64Full = chunkSnaps.map(s => s.data()?.data || '').join('');
    }

    if (!base64Full) return null;

    return {
      buffer: Buffer.from(base64Full, 'base64'),
      mimeType: docData.mimeType || 'image/jpeg'
    };
  } catch (err: any) {
    handleFirestoreError(`get media file ${fileName}`, err);
    return null;
  }
}
