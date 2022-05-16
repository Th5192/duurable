// Typescript recommends using undefined and not null.  Source: https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines#null-and-undefined

import { InferGetServerSidePropsType, GetServerSideProps, GetServerSidePropsContext } from 'next';
import type { NextPage } from 'next'
import Link from 'next/link';

import Layout from '../components/layout'

import reviewEditorStyles from '../styles/review-editor.module.css'
import utilStyles from '../styles/utils.module.css'

// React core.
import React, { useContext, useEffect, useState } from 'react';

import { deleteField, doc, DocumentData, DocumentReference, collection, writeBatch, runTransaction, serverTimestamp, Timestamp } from "firebase/firestore";

import {db} from './_app'

import { UserContext } from '../components/userContext'

import { calculateProductLongevityInDays } from '../shared/utils/utilityFunctions';

export const getServerSideProps:GetServerSideProps = async (context: GetServerSidePropsContext) => {

  let dataPointUID:string = '';
  let authorUID:string = '';
  let brandName:string = '';
  let comments:string = '';
  let gTIN:string = ''; 
  let identifierExists:boolean = false;
  let itemModelNumber:string = '';

  // timeToReplaceInDays is not used in this app.  But it is still present in the code because the app may use this variable in the future.
  let timeToReplaceInDays:number = 0;
  
  let title:string = '';
  let youTubeURL:string = '';
  let needsReplacement:boolean = false;
  let purchaseDate:string = '';
  let requiredReplacementDate:string = '';



  if (context.query !== undefined
      && context.query.dataPointUID !== undefined
      && context.query.authorUID !== undefined
      && context.query.brandName !== undefined
      && context.query.comments !== undefined
      && context.query.gTIN !== undefined
      && context.query.identifierExists !== undefined
      && context.query.itemModelNumber !== undefined
      && context.query.timeToReplaceInDays !== undefined
      && context.query.title !== undefined
      && context.query.youTubeURL !== undefined
      && context.query.needsReplacement !== undefined
      && context.query.purchaseDate !== undefined
      && context.query.requiredReplacementDate !== undefined
     ){
      let dataPointUIDAsString = context.query.dataPointUID as string;
      dataPointUID = dataPointUIDAsString  
      let authorUIDAsString = context.query.authorUID as string;
      authorUID = authorUIDAsString
      let brandNameAsString = context.query.brandName as string;
      brandName = brandNameAsString

      let commentsAsString = context.query.comments as string;
      comments = commentsAsString
      let gTINAsString = context.query.gTIN as string;
      gTIN = gTINAsString
      let identifierExistsAsString = context.query.identifierExists as string;
      if (identifierExistsAsString === 'true') {
      identifierExists = true
      }
      if (identifierExistsAsString === 'false') {
        identifierExists = false
      }
      let itemModelNumberAsString = context.query.itemModelNumber as string;
      itemModelNumber = itemModelNumberAsString
      let timeToReplaceInDaysAsString = context.query.timeToReplaceInDays as string;
      let timeToReplaceInDaysAsNumber:number = Number(timeToReplaceInDaysAsString)
      timeToReplaceInDays = timeToReplaceInDaysAsNumber
      let titleAsString = context.query.title as string;
      title = titleAsString
      let youTubeURLAsString = context.query.youTubeURL as string;
      youTubeURL = youTubeURLAsString
      let needsReplacementAsString = context.query.needsReplacement as string;
      if (needsReplacementAsString === 'true') {
        needsReplacement = true
      }
      if (needsReplacementAsString === 'false') {
        needsReplacement = false
      }
      let purchaseDateAsString = context.query.purchaseDate as string;
      purchaseDate = purchaseDateAsString
      let requiredReplacementDateAsString = context.query.requiredReplacementDate as string;
      requiredReplacementDate = requiredReplacementDateAsString
  }

  return {
    props: {
      authorUID: authorUID,
      dataPointUID: dataPointUID,
      brandName: brandName,
      comments:comments,
      gTIN:gTIN, 
      identifierExists:identifierExists,
      itemModelNumber:itemModelNumber,
      timeToReplaceInDays:timeToReplaceInDays,
      title:title,
      youTubeURL:youTubeURL,
      needsReplacement: needsReplacement,
      purchaseDate: purchaseDate,
      requiredReplacementDate: requiredReplacementDate
    }
  }

}



interface DataPointEditingFormProps {
    authorUID: string;
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
    setShowSuccessMessage: Function;
    setCorrectlyFormattedYouTubeUID: Function;
    needsReplacement: boolean;
    purchaseDate: string;
    requiredReplacementDate: string; 
  }
  
  function DataPointEditingForm(props: DataPointEditingFormProps) {

  
    let existingAuthorUID = undefined
    if (props.authorUID === '') {

    } else {
      existingAuthorUID = props.authorUID
    }

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

    let existingNeedsReplacement = false
    if (props.needsReplacement == undefined) {
  
    } else {
      existingNeedsReplacement = props.needsReplacement
    }

    let existingPurchaseDate = undefined
    if (props.purchaseDate == undefined) {
  
    } else {
      existingPurchaseDate = props.purchaseDate
    }

    let existingRequiredReplacementDate = undefined
    if (props.requiredReplacementDate == undefined) {
  
    } else {
      existingRequiredReplacementDate = props.requiredReplacementDate
    }


    const [userIsAdmin, setUserIsAdmin] = useState(false)
    const [authorUID, setAuthorUID] = useState(existingAuthorUID || '')
    const [brand, setBrand] = useState(existingBrand || '');
    const [title, setTitle] = useState(existingTitle || '');
    const [identifierExists, setIdentifierExists] = useState(existingIdentifierExists || false);
    const [gTIN, setGTIN] = useState(existingGTIN || '');
    const [itemModelNumber, setItemModelNumber] = useState(existingItemModelNumber || '');
    const [purchaseDate, setPurchaseDate] = useState(existingPurchaseDate || '')
    const [needsReplacement, setNeedsReplacement] = useState(existingNeedsReplacement || false)
    const [requiredReplacementDate, setRequiredReplacementDate] = useState(existingRequiredReplacementDate || '');
    const [timeToReplaceInDays, setTimeToReplaceInDays] = useState(existingTimeToReplaceInDays || undefined);
    const [candidateYouTubeVideoUID, setCandidateYouTubeVideoUID] = useState<string|undefined>(undefined)
    const [youTubeURL, setYouTubeURL] = useState(existingYouTubeURL || '');
    const [comments, setComments] = useState(existingComments || '');
    
  
    const userContextObject = useContext(UserContext)

    useEffect(() => {
      extractYouTubeVideoUID(youTubeURL)
    })

    useEffect(() => {
      console.log('%%% review-editor userIsAdmin useEffect triggered now yields: ' + userContextObject.userIsAdminContextValue)
      if (userContextObject.userIsAdminContextValue === true ) {
        console.log('%%% review-editor userIsAdmin useEffect / setUserAdmin is true')
        setUserIsAdmin(true)
      } else {
        console.log('%%% review-editor userIsAdmin useEffect / setUserAdmin is false')  
        setUserIsAdmin(false)
      }
  
    },[userContextObject.userIsAdminContextValue, userIsAdmin]);
  

    useEffect(() => {
      console.log('@ review-editor userUID useEffect triggered now. / setUserUID performed now yields:' + userContextObject.userUIDString )
          if (authorUID === '') {
            console.log('@ review-editor userUID useEffect triggered now. / setAuthorUID performed now ..')
            setAuthorUID(userContextObject.userUIDString)
          }

    },[userContextObject.userUIDString, authorUID]);
  
    useEffect(() => {

      if (
        (purchaseDate === '') ||
        (needsReplacement === false) ||
        (requiredReplacementDate === '') ||
        (Number.isNaN(Date.parse(purchaseDate))) ||
        (Number.isNaN(Date.parse(requiredReplacementDate)))) {
            console.log('setTimeToReplaceInDays as undefined')
            setTimeToReplaceInDays(undefined)
          } else {
            let timeToReplaceInDaysPlaceholder = calculateProductLongevityInDays(purchaseDate, requiredReplacementDate)
            setTimeToReplaceInDays(timeToReplaceInDaysPlaceholder)
            console.log('setTimeToReplaceInDays as: ' + timeToReplaceInDaysPlaceholder)
          }

    }, [purchaseDate, needsReplacement, requiredReplacementDate, timeToReplaceInDays])



    async function pushToFirebase() {
      
      const batch = writeBatch(db);

      let newOrEditedDataPointRef:DocumentReference<DocumentData>
      if (props.dataPointUID === '') {
        newOrEditedDataPointRef = doc(collection(db, 'dataPoints'));
      } else {
        newOrEditedDataPointRef = doc(db, 'dataPoints', props.dataPointUID)
      }

      if (userIsAdmin === true) {
        batch.set(newOrEditedDataPointRef, {
            hasBeenModerated: true
        }, {merge: true})
      } else {
        batch.set(newOrEditedDataPointRef, {
          hasBeenModerated: false
        }, {merge: true})
      }

      // This code can be used to convert string type date to FirebaseTimeStamp type date.
      // let purchaseDateStringAsDate = new Date(purchaseDate)
      // let purchaseDateAsFirebaseTimeStamp = Timestamp.fromDate(purchaseDateStringAsDate)

      if (requiredReplacementDate === '') {
        batch.set(newOrEditedDataPointRef, {
            requiredReplacementDate: deleteField()
        }, {merge: true})

      } else {

        batch.set(newOrEditedDataPointRef, {
          requiredReplacementDate: requiredReplacementDate
        }, {merge: true})

      }

      let youTubeEmbedURL = undefined
      if (candidateYouTubeVideoUID !== undefined) {
        youTubeEmbedURL = 'https://www.youtube.com/embed/' + candidateYouTubeVideoUID
      }


      batch.set(newOrEditedDataPointRef, {
        authorUID: authorUID,
        brand: brand,
        title: title,
        identifierExists: identifierExists,
        gTIN: gTIN,
        itemModelNumber: itemModelNumber,
        purchaseDate: purchaseDate,
        needsReplacement: needsReplacement,
        timeToReplaceInDays: timeToReplaceInDays ?? deleteField(),
        youTubeURL: youTubeEmbedURL ?? deleteField(), 
        comments: comments,
        timestamp: serverTimestamp()
      }, {merge: true})    
  
      const dataPointUID = newOrEditedDataPointRef.id
  
      if (props.dataPointUID !== '') {
        if (
            ((props.brand !== '') && (props.brand !== brand))
                    ||
            ((props.gTIN !== '') && (props.gTIN !== gTIN))  ){
              console.log('DATA SCRUB PERFORMED: pre-existing brand or GTIN was edited so need to retractively delete effected denormalized fields')
          
              const priorDurabilityBrandGTINRef = doc(db,'products', 'durabilityInDaysSortedByBrandAndGTIN', props.brand, props.gTIN)
              batch.set(priorDurabilityBrandGTINRef, {
                [dataPointUID]: deleteField()
              }, {merge: true});

              const newDurabilityBrandGTINRef = doc(db,'products', 'durabilityInDaysSortedByBrandAndGTIN', brand, gTIN)
              batch.set(newDurabilityBrandGTINRef, {
                [dataPointUID]: timeToReplaceInDays ?? deleteField()
              }, {merge: true});
        
          
              const priorDataPointRouteParametersRef = doc(db, 'products', 'dataPointRouteParameters', props.brand, props.gTIN)
              batch.set(priorDataPointRouteParametersRef, {
                [dataPointUID]: deleteField()
              }, {merge: true})

              const newDataPointRouteParametersRef = doc(db, 'products', 'dataPointRouteParameters', brand, gTIN)
              batch.set(newDataPointRouteParametersRef, {
                [dataPointUID]:true
              }, {merge: true})
        
            } else {
              if (props.timeToReplaceInDays !== timeToReplaceInDays) {
                const newDurabilityBrandGTINRef = doc(db,'products', 'durabilityInDaysSortedByBrandAndGTIN', brand, gTIN)
                batch.set(newDurabilityBrandGTINRef, {
                  [dataPointUID]: timeToReplaceInDays ?? deleteField()
                }, {merge: true});
              }
            }
      } else {
        const durabilityBrandGTINRef = doc(db,'products', 'durabilityInDaysSortedByBrandAndGTIN', brand, gTIN)
        batch.set(durabilityBrandGTINRef, {
          [dataPointUID]: timeToReplaceInDays ?? deleteField()
        }, {merge: true});

        const dataPointRouteParametersRef = doc(db, 'products', 'dataPointRouteParameters', brand, gTIN)
        batch.set(dataPointRouteParametersRef, {
          [dataPointUID]:true
        }, {merge: true})  
      }
  
      const dataPointsOwnedByUserRef = doc(db, 'users', authorUID, 'private-documents', 'dataPointsOwnedByUser');
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

    async function runTransactionsOnFirebase() {

      let priorBrandState = 'Error'
      if (props.brand !== '') {
        priorBrandState = props.brand
      }

      let newBrandState = 'Error'
      if (brand !== '') {
        newBrandState = brand
      }

      let priorGTINState = 'Error'
      if (props.gTIN !== '') {
        priorGTINState = props.gTIN
      }

      let newGTINState = 'Error'
      if (gTIN !== '') {
        newGTINState = gTIN
      }

      async function handleSingleTransactionInOneDoc(docRef:DocumentReference<DocumentData>, stateToAdjust: string, transactionAmount: number) {
        try {
          await runTransaction(db, async (transaction) => {
            const countDoc = await transaction.get(docRef);
            let priorCount = 0 
            if((countDoc.exists())){
                let docData = countDoc.data()
                if (docData === undefined) {
                  priorCount = 0
                } else {
                  let stateToAdjustValue = docData[stateToAdjust]
                  if (stateToAdjustValue === undefined) {
                    priorCount = 0
                  } else {
                    priorCount = stateToAdjustValue
                  }
                }
              
            } 
            const newCount = Math.max(0, priorCount + transactionAmount)
            transaction.set(docRef, {[stateToAdjust]: newCount}, {merge: true})
          });
        } catch (e) {
          console.error(e)
        }
      }

      async function handleTwoTransactionsInOneDoc(docRef:DocumentReference<DocumentData>, firstStateToAdjust: string, secondStateToAdjust:string, firstStateToAdjustTransactionAmount: number, secondStateToAdjustTransactionAmount: number) {
        try {
          await runTransaction(db, async (transaction) => {
            const countDoc = await transaction.get(docRef);
            let priorCountOfFirstState = 0 
            let priorCountOfSecondState = 0
            if((countDoc.exists())){
                let docData = countDoc.data()
                if (docData === undefined) {
                  priorCountOfFirstState = 0
                  priorCountOfSecondState = 0
                } else {
                  let firstStateToAdjustPriorValue = docData[firstStateToAdjust]
                  if (firstStateToAdjustPriorValue === undefined) {
                    priorCountOfFirstState = 0
                  } else {
                    priorCountOfFirstState = firstStateToAdjustPriorValue
                  }
                  let secondStateToAdjustPriorValue = docData[secondStateToAdjust]
                  if (secondStateToAdjustPriorValue === undefined) {
                    priorCountOfSecondState = 0
                  } else {
                    priorCountOfSecondState = secondStateToAdjustPriorValue
                  }
                }
              
            } 
            const newValueOfFirstState = Math.max(0, priorCountOfFirstState + firstStateToAdjustTransactionAmount)
            const newValueOfSecondState = Math.max(0, priorCountOfSecondState + secondStateToAdjustTransactionAmount)
            transaction.set(docRef, {[firstStateToAdjust]: newValueOfFirstState, [secondStateToAdjust]: newValueOfSecondState}, {merge: true})
          });
        } catch (e) {
          console.error(e)
        }
      }


      const brandRouteParametersRef = doc(db, 'products', 'brandRouteParameters')
      const priorItemRouteParametersRef = doc(db, 'products', 'itemRouteParameters', priorBrandState, 'itemRouteParameters')
      const newItemRouteParametersRef = doc(db, 'products', 'itemRouteParameters', newBrandState, 'itemRouteParameters')

      if (props.dataPointUID !== '') {
        if (
          ((props.brand !== '') && (props.brand !== brand))
                  ||
          ((props.gTIN !== '') && (props.gTIN !== gTIN))  ){
            handleTwoTransactionsInOneDoc(brandRouteParametersRef, priorBrandState, newBrandState, -1, 1)

            handleSingleTransactionInOneDoc(priorItemRouteParametersRef, priorGTINState, -1)
            handleSingleTransactionInOneDoc(newItemRouteParametersRef, newGTINState, 1)
          }

      } else {
        handleSingleTransactionInOneDoc(brandRouteParametersRef,newBrandState,1)
        handleSingleTransactionInOneDoc(newItemRouteParametersRef, newGTINState, 1)
      }
    }

    function extractYouTubeVideoUID(youTubeURLString:string) {

      
      const youTubeURLStringLowercased = youTubeURLString.toLowerCase()
      
      // Note: Special characters like the question mark ? need to be 'escaped' in a RegExp
      const fullYouTubePrefix = '^https://www.youtube.com/watch\\?v='      
      const shortenedYouTubePrefix = '^https://youtu.be/'
      const embedYouTubePrefix = '^https://www.youtube.com/embed/'

      const fullYouTubePrefixRegExp = new RegExp(fullYouTubePrefix)
      const shortenedYouTubePrefixRegExp = new RegExp(shortenedYouTubePrefix)
      const embedYouTubePrefixRegExp = new RegExp(embedYouTubePrefix)

      if( (!fullYouTubePrefixRegExp.test(youTubeURLStringLowercased)) &&
          (!shortenedYouTubePrefixRegExp.test(youTubeURLStringLowercased)) && 
          (!embedYouTubePrefixRegExp.test(youTubeURLStringLowercased))){
            setCandidateYouTubeVideoUID(undefined)
            props.setCorrectlyFormattedYouTubeUID(undefined)
            return
          }
      
      let fullLengthURLLink = youTubeURLString.split('https://www.youtube.com/watch?v=')
      if (fullLengthURLLink[1] !== undefined) {
        if (fullLengthURLLink[1].length === 11) {
          setCandidateYouTubeVideoUID(fullLengthURLLink[1])
          props.setCorrectlyFormattedYouTubeUID(fullLengthURLLink[1])
          return
        }
      }

      let shortenedURLLink = youTubeURLString.split('https://youtu.be/')
      if (shortenedURLLink[1] !== undefined) {
        if (shortenedURLLink[1].length === 11) {
          setCandidateYouTubeVideoUID(shortenedURLLink[1])
          props.setCorrectlyFormattedYouTubeUID(shortenedURLLink[1])
          return
        }
      } 

      let embedURLLink = youTubeURLString.split('https://www.youtube.com/embed/')
      if (embedURLLink[1] !== undefined) {
        if (embedURLLink[1].length === 11) {
          setCandidateYouTubeVideoUID(embedURLLink[1])
          props.setCorrectlyFormattedYouTubeUID(embedURLLink[1])
          return
        }
      } 

      setCandidateYouTubeVideoUID(undefined)
      props.setCorrectlyFormattedYouTubeUID(undefined)

    }


    const handleSubmit = (event: React.ChangeEvent<HTMLFormElement>) => {
      event.preventDefault();

      runTransactionsOnFirebase()

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
        default:
          break;
      }
    }
  
    const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      event.persist();
      setComments(event.target.value)
    }
  
    return(
      <div>
        <form className={reviewEditorStyles.reviewEditorForm} onSubmit={handleSubmit}>
          <div>
            <p>Data point authorUID: {authorUID}</p>
          </div>
          <label>Brand name: </label>
          <input id='brand' className='form-field' type='text' placeholder='Enter brand name...' name='brand' value={brand} minLength={2} required onChange={handleChange}/>
          <br></br>
          <label>Product Title (Name of product): </label>
          <input id='title' className='form-field' type='text' placeholder='Enter name of product...' name='title' value={title} minLength={2} required onChange={handleChange}/>
          <br></br>
          <div className={reviewEditorStyles.checkBoxRow}>
              <label>
                GTIN exists?
                <input id='identifierExists' type='checkbox' checked={identifierExists} name='identifierExists' onChange={handleChange}/>
              </label>
          </div>
          <br></br>
          <label>GTIN: </label>
          <input id='gTIN' className='form-field' type='text' placeholder='Enter GTIN...' name='gTIN' value={gTIN} minLength={5} required onChange={handleChange}/>
          <br></br>
          <label>Item Model Number: </label>
          <input id='itemModelNumber' className='form-field' type='text' placeholder='Enter Item Model Number...' name='itemModelNumber' value={itemModelNumber} onChange={handleChange}/>
          <br></br>
          <label>When did you purchase this product? </label>
          <input id='purchaseDate' className={reviewEditorStyles.reviewEditorFormInputTypeDate} type='date' name='purchaseDate' value={purchaseDate} onChange={handleChange}/>
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
                <br></br>
                <input id='requiredReplacementDate' className={reviewEditorStyles.reviewEditorFormInputTypeDate} type='date' name='requiredReplacementDate' required value={requiredReplacementDate} onChange={handleChange}/><span className="validity"></span>
              </div>
            }
          </div>
          <br></br>
          <b>YouTube Video</b>
          <label>We encourage users to document their durability experience by creating videos on YouTube&reg; and linking them here.  To submit your YouTube video please copy its URL here.</label>  
          <br></br>
          <label>Your YouTube link should look like one of these links:</label>
          <br></br>
          <label>https://www.youtube.com/watch?v=FQmr0GuylJI</label>
          <label>or</label>
          <label>https://youtu.be/FQmr0GuylJI</label>
          <br></br>
          <input id='youTubeURL' className='form-field' type='text' placeholder='Enter YouTube URL ...' name='youTubeURL' value={youTubeURL} onChange={handleChange}/>
          <div>
            {(youTubeURL !== '') && (candidateYouTubeVideoUID !== undefined) && 
              <p><span className="material-icons">done</span> YouTube link looks good! You can see a preview at the bottom of this page.</p>
            }
            {(youTubeURL !== '') && (candidateYouTubeVideoUID === undefined) && 
              <p><span className="material-icons">close</span> Please enter a correctly formatted YouTube link.</p>
            }
          </div>
          <br></br>
          <label>Comments:</label>
          <textarea id='comments' placeholder='Enter comments ...' name='comments' rows={10} value={comments} onChange={handleTextAreaChange}/>
          <br></br>
          <button className={utilStyles.largeButton} type='submit'>Save</button>
          <br></br>
        </form>
        <div>
          {(userIsAdmin === true) && 
            <div>
              <p>You are now viewing as Admin.</p>
             </div>
          }
        </div>
      </div>
    )
  }

const CreateReview: NextPage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {


  const [showDataPointEditingForm, setShowDataPointEditingForm] = useState(true);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [correctlyFormattedYouTubeUID, setCorrectlyFormattedYouTubeUID] = useState<string|undefined>(undefined)

  let userContextObject = useContext(UserContext);

  useEffect(() => {
    console.log('### CreateReview useEffect userIsAdmin triggered now')
    if (userContextObject.userIsAdminContextValue === true) {
      console.log('### CreateReview useEffect userIsAdmin triggered now / setUserIsAdmin to true')
      setUserIsAdmin(true)
    } else {
      console.log('### CreateReview useEffect userIsAdmin triggered now / setUserIsAdmin to false')
      setUserIsAdmin(false)
    }
  },[userContextObject.userIsAdminContextValue, userIsAdmin])

  function setVisibilityForDataPointEditingForm(formIsVisible: boolean) {
    setShowDataPointEditingForm(formIsVisible)
  }

  function CandidateYouTubeVideoComponent() {
    if (correctlyFormattedYouTubeUID === undefined) {
      return(
        <div className={reviewEditorStyles.videoPreviewPlaceholder}>After you enter a valid YouTube link a preview will appear here.</div>
      )
    }

    let srcString = 'https://www.youtube.com/embed/' + correctlyFormattedYouTubeUID


    return (
      <div>
        <iframe 
          width="560" 
          height="315" 
          src={srcString}
          title="YouTube video player" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen>
        </iframe>
      </div>
    )
  }


    return (
      <div>
        <Layout>
            <h1>Data Point Form</h1>
            <div>
              {(showDataPointEditingForm === true) &&
                <DataPointEditingForm
                  authorUID={props.authorUID}
                  brand={props.brandName} 
                  title={props.title} 
                  identifierExists={props.identifierExists} 
                  gTIN={props.gTIN} 
                  itemModelNumber={props.itemModelNumber} 
                  timeToReplaceInDays={props.timeToReplaceInDays} 
                  youTubeURL={props.youTubeURL} 
                  comments={props.comments} 
                  dataPointUID={props.dataPointUID} 
                  purchaseDate={props.purchaseDate}
                  needsReplacement={props.needsReplacement}
                  requiredReplacementDate={props.requiredReplacementDate}
                  setVisibilityForDataPointEditingForm={setVisibilityForDataPointEditingForm}
                  setShowErrorMessage={setShowErrorMessage} 
                  setShowSuccessMessage={setShowSuccessMessage}
                  setCorrectlyFormattedYouTubeUID={setCorrectlyFormattedYouTubeUID}
                />}
            </div>
            <div>
                <CandidateYouTubeVideoComponent/>
            </div>
            <div>
              {(showErrorMessage === true) && 
                <p>An error occurred.  Please try again.</p>
              }
              {(showSuccessMessage === true) && 
                <div>
                  <p>Saved successfully!</p>
                  <Link href='/'>Back to home</Link>
                  <div>
                    {(userIsAdmin === true) &&
                      <Link href='/content-moderator'>Content Moderation Console</Link>
                    }
                  </div>
                </div>
              }
            </div>
        </Layout>
      </div>
    )
  }
  
export default CreateReview