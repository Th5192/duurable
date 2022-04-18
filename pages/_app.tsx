import '../styles/globals.css'
import type { AppProps } from 'next/app'

// React core.
import React from 'react';

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Source: https://github.com/firebase/firebaseui-web-react
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

class Authui extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showCreateAccountOrSignInUI: true,
      showCreateAccountUI: true,
      showSignInUI:false
    };
  }

    uiConfig = {
        signInFlow: 'popup',
        signInOptions: [
          GoogleAuthProvider.PROVIDER_ID,
        ],
        callbacks: {
          signInSuccessWithAuthResult: () => false,
        },
      };
    
      state = {
        isSignedIn: undefined,
      };
    
      /**
       * @inheritDoc
       */
      componentDidMount() {
        this.unregisterAuthObserver = onAuthStateChanged(auth, user => {
          this.setState({isSignedIn: !!user});
        });
      }
    
      /**
       * @inheritDoc
       */
      componentWillUnmount() {
        this.unregisterAuthObserver();
      }
      
  /**
   * @inheritDoc
   */
  render() {
    return (
      <div>
        <div>
          <i></i>
        </div>
        {/* <div className={styles.caption}>This is a cool demo app</div> */}
        {this.state.isSignedIn !== undefined && !this.state.isSignedIn &&
          <div>
            {(this.state.showCreateAccountOrSignInUI===false) &&
              <div className={utilStyles.containerForSignUpButtonandCreateAccountButton}>
                <button className={utilStyles.signInButton} onClick={()=>{this.setState({showCreateAccountOrSignInUI:true, showSignInUI:true, showCreateAccountUI:false})}}>Sign In</button>
                <button className={utilStyles.createAccountButton} onClick={()=>{this.setState({showCreateAccountOrSignInUI:true, showSignInUI:false, showCreateAccountUI:true})}}>Create Account</button>
              </div>
            }
            {(this.state.showCreateAccountOrSignInUI===true) &&
            <div className={utilStyles.signInOrSignUpFlexBox}>
              <div className={utilStyles.signInOrSignUpComponent}>
                <div className={utilStyles.closeSignInOrSignUpFlexBoxButtonContainer}>
                  <button onClick={()=>{this.setState({showCreateAccountOrSignInUI:false, showSignInUI:false, showCreateAccountUI:false})}}><span className="material-icons">close</span></button>
                </div>
                <div>
                  {(this.state.showCreateAccountUI === true) && 
                    <h2>Create Account</h2>
                  }
                </div>
                <div>
                  {(this.state.showSignInUI === true) && 
                    <h2>Sign In</h2>
                  }
                </div>
                <div>
                  <StyledFirebaseAuth uiConfig={this.uiConfig}
                                      firebaseAuth={auth}/>
                </div>
                {(this.state.showCreateAccountUI === true) &&
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
                    {(this.state.showCreateAccountUI === true) && 
                      <div>
                        <p>Already have an account?</p>
                        <button className={utilStyles.signInOrSignUpComponentToggleAccountExistsStatusButton} onClick={()=> {
                          this.setState({showCreateAccountUI:false});
                          this.setState({showSignInUI:true});
                          }}>Sign In</button>
                      </div>
                    }
                  </div>
                  <div>
                    {(this.state.showSignInUI === true) && 
                      <div>
                        <p>Don&#39;t have an account?</p>
                        <button className={utilStyles.signInOrSignUpComponentToggleAccountExistsStatusButton} onClick={()=> {
                          this.setState({showCreateAccountUI:true});
                          this.setState({showSignInUI:false});
                          }}>Create Account</button>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>}
           </div>
        }
        {this.state.isSignedIn &&
          <div className={utilStyles.signedIn}>
            Welcome {auth.currentUser.displayName}. 
            <br></br>
            <a onClick={() => signOut(auth)}>Sign-out</a>
          </div>
        }
      </div>
    );
  }
}


function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
