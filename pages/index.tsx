// Typescript recommends using undefined and not null.  Source: https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines#null-and-undefined


import type { NextPage } from 'next'
import Link from 'next/link';
import Image from 'next/image';

import utilStyles from '../styles/utils.module.css'

// React core.
import React, {useState, useEffect, useContext} from 'react';


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
      <div className={utilStyles.fullWidthContainerWhite}>
        <div className={utilStyles.heroHeadline}>
          <span>Duuurable </span>
          <Image src="/query_stats_FILL0_wght400_GRAD0_opsz48.svg" alt="logo image of statistics chart" width="48" height="48" />
        </div>
        <div className={utilStyles.heroSubHeadline}>
          <span>Is it durable? Will it last?</span>
        </div>
      </div>
      <div className={utilStyles.fullWidthContainerWhite}>
        <div>
          <div className={utilStyles.boldText}>Write a durability review.</div> 
          <div className={utilStyles.lighterText}>Help people know if products really do last.</div>
        </div>
        <div className={utilStyles.linkContainer}>
          <Link href='/review-editor'><a>Write a Review</a></Link>
        </div>
      </div>
      <div className={utilStyles.fullWidthContainerWhite}>
        <div>
          <div className={utilStyles.boldText}>Watch videos that reveal wear and tear.</div> 
          <div className={utilStyles.lighterText}>Search by brand and model number.</div>
        </div>
        <div className={utilStyles.linkContainer}>
          <Link href='/brand-directory'><a>Search Durability Data</a></Link>
        </div>
      </div>

      <div className={utilStyles.fullWidthContainerWhite}>
        <h2>Spend your money on products that last.</h2>
        <h2>Making durable products costs extra.  Reward brands that take on this responsibility.</h2>
        <h2>Support the environment by reducing waste.</h2>
      </div>
    </div>
  )
}



const Home: NextPage = () => {
  return (
    <div>
        <LandingPage/>
    </div>
  )
}

export default Home
