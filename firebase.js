import { initializeApp } from "@firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database'
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import firebaseConfig from "./FirebaseConfig";

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const database = getDatabase(app);

export { auth, database };