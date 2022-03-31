import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCSoMVZuTwu10mfHc3GP_dM7UYJVnrxPUU",
    authDomain: "pedidosalmuerzo-test.firebaseapp.com",
    projectId: "pedidosalmuerzo-test",
    storageBucket: "pedidosalmuerzo-test.appspot.com",
    messagingSenderId: "251043588391",
    appId: "1:251043588391:web:6f6bdaac85e000a6532102",
    measurementId: "G-1MPFNKD5HP"
};
// Initialize Firebase
export const App = initializeApp(firebaseConfig);
const analytics = getAnalytics(App);

// auth
export const Auth = getAuth(App);
export const Database = getDatabase(App);
export const Storage = getStorage(App);