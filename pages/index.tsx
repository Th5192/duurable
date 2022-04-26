// Typescript recommends using undefined and not null.  Source: https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines#null-and-undefined


import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import productPageStyles from '../styles/product-page.module.css'

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
          <p>The current user uid is:</p>
          <p>{currentUserUID}</p>
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


interface DataPointEditingFormProps {
  brand: string;
  title: string;
  identifierExists: boolean;
  gTIN: string;
  itemModelNumber: string;
  timeToReplaceInDays: number;
  youTubeURL: string;
  comments: string;
  dataPointUID: string;
}

function DataPointEditingForm(props: DataPointEditingFormProps) {

  let existingBrand = undefined
  if (props.brand == undefined) {

  } else {
    existingBrand = props.brand
  }

  let existingTitle = undefined
  if (props.title == undefined) {

  } else {
    existingTitle = props.title
  }

  let existingIdentifierExists = false
  if (props.identifierExists == undefined) {

  } else {
    existingIdentifierExists = props.identifierExists
  }

  // ASIN is a subset of GTIN
  let existingGTIN = undefined
  if (props.gTIN == undefined) {

  } else {
    existingGTIN = props.gTIN
  }

  let existingItemModelNumber = undefined
  if (props.itemModelNumber == undefined) {

  } else {
    existingItemModelNumber = props.itemModelNumber
  }

  let existingTimeToReplaceInDays = undefined
  if (props.timeToReplaceInDays == undefined) {

  } else {
    existingTimeToReplaceInDays = Number(props.timeToReplaceInDays)
  }

  let existingYouTubeURL = undefined
  if (props.youTubeURL == undefined) {

  } else {
    existingYouTubeURL = props.youTubeURL
  }

  let existingComments = undefined
  if (props.comments == undefined) {

  } else {
    existingComments = props.comments
  }

  const [brand, setBrand] = useState(existingBrand || '');
  const [title, setTitle] = useState(existingTitle || '');
  const [identifierExists, setIdentifierExists] = useState(existingIdentifierExists || false);
  const [gTIN, setGTIN] = useState(existingGTIN || '');
  const [itemModelNumber, setItemModelNumber] = useState(existingItemModelNumber || '');
  const [timeToReplaceInDays, setTimeToReplaceInDays] = useState(existingTimeToReplaceInDays || 0);
  const [youTubeURL, setYouTubeURL] = useState(existingYouTubeURL || '');
  const [comments, setComments] = useState(existingComments || '');
  

  async function pushToFirebase() {
    
    const newOrEditedDataPointRef = doc(collection(db, 'dataPoints'));
    
    await setDoc(newOrEditedDataPointRef, {
      brand: brand,
      title: title,
      identifierExists: identifierExists,
      gTIN: gTIN,
      itemModelNumber: itemModelNumber,
      timeToReplaceInDays: timeToReplaceInDays,
      youTubeURL: youTubeURL,
      comments: comments
    })    

    const dataPointUID = newOrEditedDataPointRef.id

    const durabilityBrandGTINRef = doc(db,'products', 'durabilityInDaysSortedByBrandAndGTIN', brand, gTIN)
    await setDoc(durabilityBrandGTINRef, {
      [dataPointUID]: timeToReplaceInDays
    }, {merge: true});

    const brandRouteParametersRef = doc(db, 'products', 'brandRouteParameters')
    await setDoc(brandRouteParametersRef, {
      [brand]:true
    }, {merge: true})

    const itemRouteParametersRef = doc(db, 'products', 'itemRouteParameters', brand, 'itemRouteParameters')
    await setDoc(itemRouteParametersRef, {
      [gTIN]:true
    }, {merge: true})

    const dataPointRouteParametersRef = doc(db, 'products', 'dataPointRouteParameters', brand, gTIN)
    await setDoc(dataPointRouteParametersRef, {
      [dataPointUID]:true
    }, {merge: true})

  }

  const handleSubmit = (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    pushToFirebase()
    console.log('handleSubmit')
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.persist();
    switch (event.target.id) {
      case 'brand':
        setBrand(event.target.value);
        break;
      case 'title':
        setTitle(event.target.value);
        break;
      case 'identifierExists':
        setIdentifierExists(!identifierExists) 
        break;
      case 'gTIN':
        setGTIN(event.target.value);
        break;
      case 'itemModelNumber':
        setItemModelNumber(event.target.value);
        break;
      case 'timeToReplaceInDays':
        let timeToReplaceInDaysAsInt = parseInt(event.target.value);
        setTimeToReplaceInDays(timeToReplaceInDaysAsInt);
        break;
      case 'youTubeURL':
        setYouTubeURL(event.target.value);
        break;
      case 'comments':
        setComments(event.target.value);
        break;
      default:
        break;
    }
  }

  function handleEditButtonState() {
    console.log("handleEditButtonState pressed")
  }

  return(
    <div className={productPageStyles.dataPointEditingForm}>
      <form onSubmit={handleSubmit}>
        <label>Brand name: </label>
        <input id='brand' className='form-field' type='text' placeholder='Enter brand name...' name='brand' value={brand} onChange={handleChange}/>
        <br></br>
        <label>Product Title (Name of product): </label>
        <input id='title' className='form-field' type='text' placeholder='Enter name of product...' name='title' value={title} onChange={handleChange}/>
        <br></br>
        <label>GTIN exists? 
        <input id='identifierExists' type='checkbox' checked={identifierExists} name='identifierExists' onChange={handleChange}/>
        </label>
        <br></br>
        <label>GTIN: </label>
        <input id='gTIN' className='form-field' type='text' placeholder='Enter GTIN...' name='gTIN' value={gTIN} onChange={handleChange}/>
        <br></br>
        <label>Item Model Number: </label>
        <input id='itemModelNumber' className='form-field' type='text' placeholder='Enter Item Model Number...' name='itemModelNumber' value={itemModelNumber} onChange={handleChange}/>
        <br></br>
        <label>Time To Replace In Days: </label>
        <input id='timeToReplaceInDays' className='form-field' type='number' min='0' max='365000' placeholder='Enter Time To Replace In Days...' name='timeToReplaceInDays' value={timeToReplaceInDays} onChange={handleChange}/>
        <br></br>
        <label>YouTube URL:</label>
        <input id='youTubeURL' className='form-field' type='text' placeholder='Enter YouTube URL ...' name='youTubeURL' value={youTubeURL} onChange={handleChange}/>
        <br></br>
        <label>Comments:</label>
        <input id='comments' className='form-field' type='text' placeholder='Enter comments ...' name='comments' value={comments} onChange={handleChange}/>
        <br></br>
        <button className={productPageStyles.saveButton} type='submit'>Save</button>
        <br></br>
      </form>
      <button className={productPageStyles.doNotSaveButton} onClick={() => handleEditButtonState()}>Do not save</button> 
    </div>
  )
}


const Home: NextPage = () => {
  return (
    <div>
      <p>Hello, world!</p>
      <MonitorUserLoginStatus/>
      <DataPointEditingForm brand={''} title={''} identifierExists={false} gTIN={''} itemModelNumber={''} timeToReplaceInDays={0} youTubeURL={''} comments={''} dataPointUID={''}/>
    </div>
  )
}

export default Home
