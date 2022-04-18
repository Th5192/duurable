import '../styles/globals.css'
import type { AppProps } from 'next/app'

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDiiGV62v8dIgSGPwGDufAJzhSeocc16h4",
  authDomain: "duuurable.firebaseapp.com",
  projectId: "duuurable",
  storageBucket: "duuurable.appspot.com",
  messagingSenderId: "733409707773",
  appId: "1:733409707773:web:45a3e105500d22107f2094",
  measurementId: "G-95VG6J9P8T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
