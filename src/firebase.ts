import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const dbId = firebaseConfig.firestoreDatabaseId;
export const db = (!dbId || dbId === '(default)' || dbId === 'default')
  ? getFirestore(app)
  : getFirestore(app, dbId);

if (typeof window !== 'undefined') {
  try {
    enableIndexedDbPersistence(db).catch((err) => {
      console.warn('Firestore persistence notice:', err?.code || err?.message);
    });
  } catch (e) {}
}

export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;


