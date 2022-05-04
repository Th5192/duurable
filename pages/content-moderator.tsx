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
     const [unmoderatedDocID, setUnmoderatedDocID] = useState('')
     const [unmoderatedDataPointExists, setUnmoderatedDataPointExists] = useState(false)

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

          if (querySnapshot.empty) {
               console.log('fetchNotModeratedYetDataPoints yields zero results')
               setUnmoderatedDataPointExists(false)
          } else {
               setUnmoderatedDataPointExists(true)
          querySnapshot.forEach((doc) => {
               console.log(doc.id, ' => ', doc.data());
          });
          }

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

/*
<Link
href={{
    pathname: `/review-editor`,
    query: {
        dataPointUID: props.dataPointUID,
        authorUID: props.authorUID,
        brandName: props.brandName,
        comments: props.comments,
        gTIN: props.gTIN,
        identifierExists: props.identifierExists,
        itemModelNumber: props.itemModelNumber,
        timeToReplaceInDays: props.timeToReplaceInDays,
        title: props.title,
        youTubeURL: props.youTubeURL,
        needsReplacement: props.needsReplacement,
        purchaseDate: props.purchaseDate,
        requiredReplacementDate: props.requiredReplacementDate            
    },
}}>
    <a>Edit this data point</a>
</Link>
*/