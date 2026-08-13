import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import config from '../firebase-applet-config.json' assert { type: 'json' };

if (!getApps().length) {
  initializeApp({
    projectId: config.projectId,
    storageBucket: config.storageBucket || `${config.projectId}.firebasestorage.app`,
  });
}

const app = getApp();

const dbId = config.firestoreDatabaseId;
const finalDbId = (dbId === 'default' || dbId === '(default)' || !dbId) ? undefined : dbId;

export const db = finalDbId ? getFirestore(app, finalDbId) : getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
