import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

// React core.
import React, {useState, useEffect} from 'react';

import { getAuth, onAuthStateChanged} from "firebase/auth";
import { doc, setDoc  } from "firebase/firestore";

import {db} from '../pages/_app'

async function setMyFirstDoc(){
  // Add a new document in collection "cities"
  await setDoc(doc(db, "cities", "LA"), {
    name: "Boston",
    state: "MA",
    country: "USA"
  });
  
}

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
          <p>The current user uid is:</p>
          <p>{currentUserUID}</p>
          <button onClick={()=>{setMyFirstDoc()}}>Set My First Doc</button>
        </div>
      }
      {(user==undefined) &&
       <div>
         <p>No user is logged in.</p>
        </div>
      }
    </div>
  )
}




const Home: NextPage = () => {
  return (
    <div>
      <p>Hello, world!</p>
      <MonitorUserLoginStatus/>
    </div>
  )
}

export default Home
