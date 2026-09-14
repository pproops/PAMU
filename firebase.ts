import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  initializeAuth,
} from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

import { env } from '@/lib/env';

const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessagingSenderId,
  appId: env.firebaseAppId,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createAuth() {
  try {
    if (Platform.OS === 'web') {
      return initializeAuth(app, {
        persistence: browserLocalPersistence,
      });
    }

    const authModule = require('firebase/auth') as {
      getReactNativePersistence: (storage: typeof AsyncStorage) => unknown;
    };

    return initializeAuth(app, {
      persistence: authModule.getReactNativePersistence(AsyncStorage) as never,
    });
  } catch {
    return getAuth(app);
  }
}

function createFirestore() {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch {
    return getFirestore(app);
  }
}

export const auth = createAuth();
export const db = createFirestore();
