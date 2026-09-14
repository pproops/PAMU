function missing(name: string): never {
  throw new Error(
    `Nedostaje ${name}. Kopirajte .env.example u .env i unesite vrijednosti.`
  );
}

const firebaseApiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const firebaseAuthDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
const firebaseProjectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
const firebaseStorageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
const firebaseMessagingSenderId =
  process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const env = {
  firebaseApiKey: firebaseApiKey ?? missing('EXPO_PUBLIC_FIREBASE_API_KEY'),
  firebaseAuthDomain:
    firebaseAuthDomain ?? missing('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  firebaseProjectId:
    firebaseProjectId ?? missing('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  firebaseStorageBucket:
    firebaseStorageBucket ?? missing('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  firebaseMessagingSenderId:
    firebaseMessagingSenderId ??
    missing('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  firebaseAppId: firebaseAppId ?? missing('EXPO_PUBLIC_FIREBASE_APP_ID'),
  supabaseUrl: supabaseUrl ?? missing('EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: supabaseAnonKey ?? missing('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
};
