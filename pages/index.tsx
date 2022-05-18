// Typescript recommends using undefined and not null.  Source: https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines#null-and-undefined


import type { NextPage } from 'next'
import Link from 'next/link';

import Layout from '../components/layout'

import productPageStyles from '../styles/product-page.module.css'
import utilStyles from '../styles/utils.module.css'

// React core.
import React, {useState, useEffect, useContext} from 'react';

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, addDoc, collection, updateDoc  } from "firebase/firestore";

import {db} from '../pages/_app'

import { UserContext } from '../components/userContext'

function LandingPage(){
  const [currentUserUID, setCurrentUserUID] = useState('')
  const [userIsAdmin, setUserIsAdmin] = useState(false)

  let userContextObject = useContext(UserContext)

  useEffect(() => {
    if (userContextObject.userUIDString === '') {
      setCurrentUserUID('')
    } else {
      setCurrentUserUID(userContextObject.userUIDString)
    }
  },[userContextObject.userUIDString, currentUserUID])

  useEffect(() => {
    if (userContextObject.userIsAdminContextValue === true) {
      setUserIsAdmin(true)
    } else {
      setUserIsAdmin(false)
    }
  }, [userContextObject.userIsAdminContextValue, userIsAdmin])



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
        <LandingPage/>
      </Layout>
    </div>
  )
}

export default Home
