import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Link from 'next/link'
import Image from 'next/image'

// React core.
import React, {useState, useEffect} from 'react';

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import utilStyles from '../styles/utils.module.css';

// Styles required by StyledFirebaseAuth
import '../styles/firebaseui-styling.global.css'; // Import globally.



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

const app = !getApps().length ? initializeApp( firebaseConfig ) : getApp()

const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export {db};

const DuuurableAuthUI = () => {

  const[isSignedIn, setIsSignedIn] = useState(false);
  const[showCreateAccountOrSignInUI, setShowCreateAccountOrSignInUI] = useState(true);
  const[showCreateAccountUI, setShowCreateAccountUI] = useState(true);
  const[showSignInUI, setShowSignInUI] = useState(false);

    
  useEffect( () => {
    const unregisterAuthObserver = onAuthStateChanged(auth, user => {
      setIsSignedIn(!!user);
    });

    return () => { 
      unregisterAuthObserver(); 
    }
  });  
  
  const provider = new GoogleAuthProvider();

  function showSignInWithPopUp() {
    signInWithPopup(auth, provider)
     .then((result) => {
         // This gives you a Google Access Token. You can use it to access the Google API.
         const credential = GoogleAuthProvider.credentialFromResult(result);
         //const token = credential.accessToken;
         // The signed-in user info.
         const user = result.user;
         // ...
     }).catch((error) => {
         // Handle Errors here.
         const errorCode = error.code;
         const errorMessage = error.message;
         // The email of the user's account used.
         const email = error.email;
         // The AuthCredential type that was used.
         const credential = GoogleAuthProvider.credentialFromError(error);
         // ...
     });
 }
      
  /**
   * @inheritDoc
   */
    return (
      <div>
        <div>
          <i></i>
        </div>
        {/* <div className={styles.caption}>This is a cool demo app</div> */}
        {isSignedIn !== undefined && !isSignedIn &&
          <div>
            {(showCreateAccountOrSignInUI===false) &&
              <div className={utilStyles.containerForSignUpButtonandCreateAccountButton}>
                <button className={utilStyles.signInButton} onClick={()=>{
                    setShowCreateAccountOrSignInUI(true), 
                    setShowSignInUI(true), 
                    setShowCreateAccountUI(false)
                  }}>Sign In</button>
                <button className={utilStyles.createAccountButton} onClick={()=>{
                    setShowCreateAccountOrSignInUI(true),
                    setShowSignInUI(false), 
                    setShowCreateAccountUI(true)
                  }}>Create Account</button>
              </div>
            }
            {(showCreateAccountOrSignInUI===true) &&
            <div className={utilStyles.signInOrSignUpFlexBox}>
              <div className={utilStyles.signInOrSignUpComponent}>
                <div className={utilStyles.closeSignInOrSignUpFlexBoxButtonContainer}>
                  <button onClick={()=>{
                    setShowCreateAccountOrSignInUI(false), 
                    setShowSignInUI(false), 
                    setShowCreateAccountUI(false)
                  }}><span className="material-icons">close</span></button>
                </div>
                <div>
                  {(showCreateAccountUI === true) && 
                    <h2>Create Account</h2>
                  }
                </div>
                <div>
                  {(showSignInUI === true) && 
                    <h2>Sign In</h2>
                  }
                </div>
                <div>
                  <button className={utilStyles.googleSignInButton} onClick={() => {showSignInWithPopUp()}}>
                      <div>
                        <Image src="/btn_google_light_normal_ios.svg" alt="Sign In With Google" height={30} width={30}/>
                      </div>
                      <div>
                        <p>Continue with Google</p>
                      </div>
                  </button>  
                </div>
                {(showCreateAccountUI === true) &&
                  <div className={utilStyles.signInOrSignUpComponentLegal}>
                    <span>By continuing you agree to our </span>
                    <span>
                        <Link href="/privacyandterms"> 
                          <a>Privacy Policy</a>
                        </Link>
                      </span>
                    <span> and </span>
                    <span>
                      <Link href="/privacyandterms"> 
                        <a>Terms of Use</a>
                      </Link> 
                    </span>
                  </div>
                }
                <div>
                  <hr></hr>
                  <div>
                    {(showCreateAccountUI === true) && 
                      <div>
                        <p>Already have an account?</p>
                        <button className={utilStyles.signInOrSignUpComponentToggleAccountExistsStatusButton} onClick={()=> {
                          setShowCreateAccountUI(false),
                          setShowSignInUI(true)
                          }}>Sign In</button>
                      </div>
                    }
                  </div>
                  <div>
                    {(showSignInUI === true) && 
                      <div>
                        <p>Don&#39;t have an account?</p>
                        <button className={utilStyles.signInOrSignUpComponentToggleAccountExistsStatusButton} onClick={()=> {
                            setShowCreateAccountUI(true),
                            setShowSignInUI(false)
                          }}>Create Account</button>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>}
           </div>
        }
        {isSignedIn &&
          <div className={utilStyles.signedIn}>
            NEED TO ADD USER NAME HERE
            <br></br>
            <a onClick={() => signOut(auth)}>Sign-out</a>
          </div>
        }
      </div>
    );
  }


function MyApp({ Component, pageProps }: AppProps) {
  return (
          <div>
            <DuuurableAuthUI/>
            <Component {...pageProps} />
          </div>
          )
}

export default MyApp
