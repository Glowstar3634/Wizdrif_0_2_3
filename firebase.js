import { initializeApp } from "@firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database'

import { getStorage } from 'firebase/storage'; // Import Firebase Storage service
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import firebaseConfig from "./FirebaseConfig";

import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';

const app = firebase.initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const database = getDatabase(app);
const storage = getStorage(app); // Initialize Firebase Storage service

export { auth, database, storage, firebase };