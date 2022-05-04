import productPageStyles from '../../../styles/product-page.module.css';
import Link from 'next/link';

// React core.
import React, { useContext, useEffect, useState } from 'react';

import { collection, getDocs, limit, query, where } from "firebase/firestore";

import {db} from '../pages/_app'

import { UserContext } from '../pages/userContext'


function ContentModeratorPage(){

     let userContext = useContext(UserContext)
     const [userIsAdmin, setUserIsAdmin] = useState(false)
     const [unmoderatedDataPointExists, setUnmoderatedDataPointExists] = useState<boolean>()

     const [dataPointUID, setDataPointUID] = useState('');
     const [authorUID, setAuthorUID] = useState('');
     const [brandName, setBrandName] = useState('');
     const [comments, setComments] = useState('');
     const [gTIN, setGTIN] = useState('');
     const [identifierExists, setIdentifierExists] = useState<boolean>();
     const [itemModelNumber, setItemModelNumber] = useState('');
     const [timeToReplaceInDays, setTimeToReplaceInDays] = useState<number>();
     const [title, setTitle] = useState('');
     const [youTubeURL, setYouTubeURL] = useState('');
     const [needsReplacement, setNeedsReplacement] = useState<boolean>();
     const [purchaseDate, setPurchaseDate] = useState<string>('');
     const [requiredReplacementDate, setRequiredReplacementDate] = useState<string>('');

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
                    setDataPointUID(doc.data().dataPointUID) 
                    setAuthorUID(doc.data().authorUID)
                    setBrandName(doc.data().brand)
                    setComments(doc.data().comments)
                    setGTIN(doc.data().gTIN)
                    setIdentifierExists(doc.data().identifierExists)
                    setItemModelNumber(doc.data().itemModelNumber)
                    setTimeToReplaceInDays(doc.data().timeToReplaceInDays)
                    setTitle(doc.data().title)
                    setYouTubeURL(doc.data().youTubeURL)
                    setNeedsReplacement(doc.data().needsReplacement)
                    setPurchaseDate(doc.data().purchaseDate)
                    setRequiredReplacementDate(doc.data().requiredReplacementDate)
               });
          }

     }


     return(
          <div>
               {(userIsAdmin === true) && 
                    <div>
                         <p>User Is Admin</p>
                         <button onClick={()=>{fetchNotModeratedYetDataPoints()}}>Get next unmoderated data point</button>
                         <div>
                              {(unmoderatedDataPointExists === true) &&
                                   <div>
                                        <Link
                                             href={{
                                             pathname: `/review-editor`,
                                             query: {
                                                  dataPointUID: dataPointUID,
                                                  authorUID: authorUID,
                                                  brandName: brandName,
                                                  comments: comments,
                                                  gTIN: gTIN,
                                                  identifierExists: identifierExists,
                                                  itemModelNumber: itemModelNumber,
                                                  timeToReplaceInDays: timeToReplaceInDays,
                                                  title: title,
                                                  youTubeURL: youTubeURL,
                                                  needsReplacement: needsReplacement,
                                                  purchaseDate: purchaseDate,
                                                  requiredReplacementDate: requiredReplacementDate            
                                             },
                                             }}>
                                             <a>Go to unmoderated data point</a>
                                        </Link>
                                   </div>
                              }
                              {(unmoderatedDataPointExists === false) &&
                                   <div>
                                        <p>All data points have been moderated</p>
                                   </div>
                              }
                         </div>
                    </div>
               }
               {(userIsAdmin === false) && 
                    <p>User Is NOT Admin</p>
               }

          </div>
     )

}

export default ContentModeratorPage

