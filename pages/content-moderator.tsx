import productPageStyles from '../../../styles/product-page.module.css';
import Link from 'next/link';

// React core.
import React, { useContext, useEffect, useState } from 'react';

import { doc, getDoc } from "firebase/firestore";

import {db} from '../pages/_app'

import { UserContext } from '../pages/userContext'


function ContentModeratorPage(){

     let userContext = useContext(UserContext)
     const [userIsAdmin, setUserIsAdmin] = useState(false)

     useEffect(() => {

          async function fetchUserAdminStatus() {
               if (userContext.userUIDString !== '') {
                    const userAdminStatusRef = doc(db, 'users', userContext.userUIDString);
                    const docSnap = await getDoc(userAdminStatusRef);
                    if(docSnap.exists()){
                         let userIsAdminAPICallResult = docSnap.data().admin ?? false
                         setUserIsAdmin(userIsAdminAPICallResult)
                         console.log('ContentModerationPage userIsAdmin async callback reached now...')
                    }
               }
          }
     
          fetchUserAdminStatus();

     },[userContext.userUIDString]);

     return(
          <div>
               {(userIsAdmin === true) && 
                    <p>User Is Admin</p>
               }
               {(userIsAdmin === false) && 
                    <p>User Is NOT Admin</p>
               }

          </div>
     )

}

export default ContentModeratorPage


