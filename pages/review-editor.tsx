// Typescript recommends using undefined and not null.  Source: https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines#null-and-undefined

import { InferGetServerSidePropsType, GetServerSideProps, GetServerSidePropsContext } from 'next';
import type { NextPage } from 'next'
import Link from 'next/link';

import Layout from '../components/layout'

import productPageStyles from '../styles/product-page.module.css'

// React core.
import React, { useContext, useState } from 'react';

import { deleteField, doc, collection, writeBatch, serverTimestamp, Timestamp } from "firebase/firestore";

import {db} from './_app'

import { UserContext } from './userContext'

export const getServerSideProps:GetServerSideProps = async (context: GetServerSidePropsContext) => {

  let authorUID:string = '';
  let dataPointUID:string = '';
  let brandName:string = '';


  if (context.query !== undefined
      && context.query.authorUID !== undefined
      && context.query.dataPointUID !== undefined
      && context.query.brandName !== undefined
     ){
    let authorUIDAsString = context.query.authorUID as string;
    authorUID = authorUIDAsString
    let dataPointUIDAsString = context.query.dataPointUID as string;
    dataPointUID = dataPointUIDAsString
    let brandNameAsString = context.query.brandName as string;
    brandName = brandNameAsString
    
  }

  return {
    props: {
      authorUID: authorUID,
      dataPointUID: dataPointUID,
      brandName: brandName
    }
  }

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
    setVisibilityForDataPointEditingForm: Function,
    setShowErrorMessage: Function,
    setShowSuccessMessage: Function
  }
  
  function DataPointEditingForm(props: DataPointEditingFormProps) {

    const userContextObject = useContext(UserContext)
  
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
    const [purchaseDate, setPurchaseDate] = useState('2018-07-22')
    const [needsReplacement, setNeedsReplacement] = useState(false)
    const [requiredReplacementDate, setRequiredReplacementDate] = useState<string>('');
    const [timeToReplaceInDays, setTimeToReplaceInDays] = useState(existingTimeToReplaceInDays || 0);
    const [youTubeURL, setYouTubeURL] = useState(existingYouTubeURL || '');
    const [comments, setComments] = useState(existingComments || '');
    
  
    async function pushToFirebase() {
      
      const batch = writeBatch(db);

      const newOrEditedDataPointRef = doc(collection(db, 'dataPoints'));

      let purchaseDateStringAsDate = new Date(purchaseDate)
      let purchaseDateAsFirebaseTimeStamp = Timestamp.fromDate(purchaseDateStringAsDate)

      if (requiredReplacementDate === '') {
        batch.set(newOrEditedDataPointRef, {
            requiredReplacementDate: deleteField()
        }, {merge: true})

      } else {
        let dateStringAsDate = new Date(requiredReplacementDate)
        let requiredReplacementDateAsFirebaseTimeStamp = Timestamp.fromDate(dateStringAsDate)  

        batch.set(newOrEditedDataPointRef, {
          requiredReplacementDate: requiredReplacementDateAsFirebaseTimeStamp
        }, {merge: true})

      }

      batch.set(newOrEditedDataPointRef, {
        authorUID: userContextObject.userUIDString,
        brand: brand,
        title: title,
        identifierExists: identifierExists,
        gTIN: gTIN,
        itemModelNumber: itemModelNumber,
        purchaseDate: purchaseDateAsFirebaseTimeStamp,
        needsReplacement: needsReplacement,
        timeToReplaceInDays: timeToReplaceInDays,
        youTubeURL: youTubeURL,
        comments: comments,
        timestamp: serverTimestamp()
      }, {merge: true})    
  
      const dataPointUID = newOrEditedDataPointRef.id
  
      const durabilityBrandGTINRef = doc(db,'products', 'durabilityInDaysSortedByBrandAndGTIN', brand, gTIN)
      batch.set(durabilityBrandGTINRef, {
        [dataPointUID]: timeToReplaceInDays
      }, {merge: true});
  
      const brandRouteParametersRef = doc(db, 'products', 'brandRouteParameters')
      batch.set(brandRouteParametersRef, {
        [brand]:true
      }, {merge: true})
  
      const itemRouteParametersRef = doc(db, 'products', 'itemRouteParameters', brand, 'itemRouteParameters')
      batch.set(itemRouteParametersRef, {
        [gTIN]:true
      }, {merge: true})
  
      const dataPointRouteParametersRef = doc(db, 'products', 'dataPointRouteParameters', brand, gTIN)
      batch.set(dataPointRouteParametersRef, {
        [dataPointUID]:true
      }, {merge: true})
  
      const dataPointsOwnedByUserRef = doc(db, 'users', userContextObject.userUIDString, 'private-documents', 'dataPointsOwnedByUser');
      batch.set(dataPointsOwnedByUserRef, {
        [dataPointUID]:true
      }, {merge:true})


      try {
        await batch.commit()
        return true
      } catch (e) {
        throw e
      }

    }

    const handleSubmit = (event: React.ChangeEvent<HTMLFormElement>) => {
      event.preventDefault();
      pushToFirebase()
      .then(result => {
        console.log('.then triggered now')
        if (result === true) {
          props.setShowSuccessMessage(true)
          props.setShowErrorMessage(false)
          props.setVisibilityForDataPointEditingForm(false)
          console.log('.then result yields: TRUE')
        } else {
          console.log('.then result yields: FALSE')
        }
      })
      .catch(error => {
        props.setShowErrorMessage(true)
        console.log('.catch yields error of: ' + error)
      })
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
        case 'purchaseDate':
          setPurchaseDate(event.target.value)
          break;
        case 'needsReplacementRadioButton':
          const value = event.target.value
          if (value === 'Yes'){ 
            setNeedsReplacement(true);
          } else {
            setNeedsReplacement(false)
            setRequiredReplacementDate('')
          }
          break;
        case 'requiredReplacementDate':
          setRequiredReplacementDate(event.target.value)
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
          <label>When did you purchase this product? </label>
          <input id='purchaseDate' className='form-field' type='date' name='purchaseDate' value={purchaseDate} onChange={handleChange}/>
          <br></br>
          <fieldset>
            <legend>Does it need to be replaced?</legend>
            <div>
              <input type='radio' id='needsReplacementRadioButton' name = 'replacement-required' value='Yes' checked={needsReplacement === true} onChange={handleChange} /><label htmlFor='Yes'>Yes</label>           
            </div>
            <div>
              <input type='radio' id='needsReplacementRadioButton' name = 'replacement-required' value='No' checked={needsReplacement === false} onChange={handleChange} /><label htmlFor='No'>No</label>           
            </div>
          </fieldset>
          <div>
            {(needsReplacement) && 
              <div>
                <label>When did this product require replacing?</label>
                <input id='requiredReplacementDate' className='form-field' type='date' name='requiredReplacementDate' required value={requiredReplacementDate} onChange={handleChange}/><span className="validity"></span>
                <br></br>
              </div>
            }
          </div>
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
      </div>
    )
  }

const CreateReview: NextPage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {

  let existingBrand = undefined
  if (props.brandName == undefined) {

  } else {
    existingBrand = props.brandName
  }


  const userContextObject = useContext(UserContext)

  const [showDataPointEditingForm, setShowDataPointEditingForm] = useState(true);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  function setVisibilityForDataPointEditingForm(formIsVisible: boolean) {
    setShowDataPointEditingForm(formIsVisible)
  }

  function createAnotherReview() {
    setShowDataPointEditingForm(true)
    setShowErrorMessage(false)
    setShowSuccessMessage(false)
  }

    return (
      <div>
        <Layout>
            <h1>Create a review:</h1>
            <p>{userContextObject.userUIDString}</p>
            <div>
              {(showDataPointEditingForm === true) &&
                <DataPointEditingForm brand={existingBrand} title={''} identifierExists={false} gTIN={''} itemModelNumber={''} timeToReplaceInDays={0} youTubeURL={''} comments={''} dataPointUID={''} 
                  setVisibilityForDataPointEditingForm={setVisibilityForDataPointEditingForm}
                  setShowErrorMessage={setShowErrorMessage} 
                  setShowSuccessMessage={setShowSuccessMessage}
                />}
            </div>
            <div>
              {(showErrorMessage === true) && 
                <p>An error occurred.  Please try again.</p>
              }
              {(showSuccessMessage === true) && 
                <div>
                  <p>Saved successfully!  To leave another review please click below:</p>
                  <button onClick={() => createAnotherReview()}>Create Another Review</button>
                </div>
              }
            </div>
            <div>
              <p>AuthorUID: {props.authorUID}</p>
            </div>
        </Layout>
      </div>
    )
  }
  
export default CreateReview