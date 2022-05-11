// Typescript recommends using undefined and not null.  Source: https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines#null-and-undefined


import type { NextPage } from 'next'
import Link from 'next/link';

import Layout from '../components/layout'

import productPageStyles from '../styles/product-page.module.css'
import utilStyles from '../styles/utils.module.css'

// React core.
import React, {useState, useEffect} from 'react';

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, addDoc, collection, updateDoc  } from "firebase/firestore";

import {db} from '../pages/_app'


function MonitorUserLoginStatus() {
  const [currentUserUID, setCurrentUserUID] = useState('');
  const auth = getAuth();
  const user = auth.currentUser;
  
  
  useEffect(() => {
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserUID(user.uid)
      } else {
        setCurrentUserUID('')
      }
    });

    return () => {
      unsubscribe();
    };

  // To prevent 1000s of Firebase calls I use the array below to tell the useEffect hook when to skip a re-render.  Did I do this right?
  }, [currentUserUID, auth, user]);

  
  


  return(
    <div>
      {user && 
        <div>
            <LandingPage/>
        </div>
      }
      {(user==undefined) &&
       <div>
         <LandingPage/>
        </div>
      }
    </div>
  )
}

function LandingPage(){
  return(
    <div>
      <div className={utilStyles.fullWidthContainerVeryPeri}>
        <div className={utilStyles.heroHeadline}>
          <span>Duuurable </span>
          <span className="material-icons md-48">query_stats</span>
        </div>
        <div className={utilStyles.heroSubHeadline}>
          <span>Is it durable? Will it last?</span>
        </div>
      </div>
      <div className={utilStyles.fullWidthContainerWhite}>
        <div>
          <Link href='/brand-directory'><a>Search Durability Data</a></Link>
        </div>
        <div>
          <p>Click the link above to search for durability videos.</p>  
          <p>Watch videos showing wear and tear. Search by brand and model number.</p>
        </div>
      </div>
      <div className={utilStyles.landingPageFeaturesWrapper}>
        <div className={utilStyles.landingPageFeatureWrapper}>
          <span className="material-icons md-48 very-peri">manage_search</span>
          <p>Search by brand and model number.</p>
        </div>
        <div className={utilStyles.landingPageFeatureWrapper}>
          <span className="material-icons md-48 very-peri">video_library</span>
          <p>Watch wear and tear videos.</p>
        </div>
        <div className={utilStyles.landingPageFeatureWrapper}>
          <span className="material-icons md-48 very-peri">insights</span>
          <p>Analyze durability data.</p>
        </div>
        <div className={utilStyles.landingPageFeatureWrapper}>
          <span className="material-icons md-48 very-peri">sentiment_satisfied</span>
          <p>Find products that last!</p>
        </div>
        <div className={utilStyles.landingPageFeatureWrapper}>
          <span className="material-icons md-48 very-peri">library_add</span>
          <p>New videos on the way!  We&#39;re just starting out.</p>
        </div>
      </div>
      <div className={utilStyles.fullWidthContainerVeriPeriAmusementsOrange}>
        <h1>Spend your money on products that last.</h1>
        <h1>Making durable products costs extra.  Reward brands that take on this responsibility.</h1>
        <h1>Support the environment by reducing waste.</h1>
      </div>
    </div>
  )
}



const Home: NextPage = () => {
  return (
    <div>
      <Layout>
        <MonitorUserLoginStatus/>
      </Layout>
    </div>
  )
}

export default Home
