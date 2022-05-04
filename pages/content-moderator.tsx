import productPageStyles from '../../../styles/product-page.module.css';
import Link from 'next/link';

// React core.
import React, { useContext, useEffect, useState } from 'react';

import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";

import {db} from '../pages/_app'

import { UserContext } from '../pages/userContext'


function ContentModeratorPage(){

     let userContext = useContext(UserContext)
     const [userIsAdmin, setUserIsAdmin] = useState(false)

     useEffect(() => {
          console.log('content-moderator useEffect triggered now...')
          if (userContext.userIsAdminContextValue === true ) {
               setUserIsAdmin(true)
          } else {
               setUserIsAdmin(false)
          }

     },[userContext.userIsAdminContextValue]);

      
     async function fetchNotModeratedYetDataPoints() {
          const q = query(collection(db, 'dataPoints'), where('hasBeenModerated', '==', false), limit(1));
          const querySnapshot = await getDocs(q)
          querySnapshot.forEach((doc) => {
               console.log(doc.id, ' => ', doc.data());
          });
     }


     return(
          <div>
               {(userIsAdmin === true) && 
                    <div>
                         <p>User Is Admin</p>
                         <button onClick={()=>{fetchNotModeratedYetDataPoints()}}>Get next unmoderated data point</button>
                    </div>
               }
               {(userIsAdmin === false) && 
                    <p>User Is NOT Admin</p>
               }

          </div>
     )

}

export default ContentModeratorPage


