import productPageStyles from '../../../styles/product-page.module.css';
import utilStyles from '../../../styles/utils.module.css'

import { InferGetServerSidePropsType, GetServerSideProps, GetServerSidePropsContext } from 'next';
import Link from 'next/link';

// React core.
import React, { useContext } from 'react';

import { doc, getDoc } from "firebase/firestore";

import {db} from '../../_app'

import { UserContext } from '../../../components/userContext'

export const getServerSideProps:GetServerSideProps = async (context: GetServerSidePropsContext ) => {


    if (context.params !== undefined) {
        const dataPointUIDRouteParam = context.params.dataPointUID;

        const dataPointRouteParamAsString = dataPointUIDRouteParam?.toString() ?? ''

        
        const docRef = doc(db, 'dataPoints', dataPointRouteParamAsString);
        const docSnap = await getDoc(docRef);
        let authorUID:string = 'Error';
        let brandName:string = 'Error';
        let comments:string = 'Error';
        let gTIN:string = 'Error';
        let identifierExists:boolean = false;
        let needsReplacement:boolean = false;
        let itemModelNumber:string = 'Error';
        let timeToReplaceInDays:number = -1;
        let title:string = 'Error';
        let youTubeURL:string = 'Error';
        let purchaseDate:string = 'Error';
        let requiredReplacementDate:string = 'Error';


        if (docSnap.exists()) {
            console.log('dataPointUID.tsx reached and docSnap.exists()')
            authorUID = docSnap.data().authorUID ?? 'error'
            brandName = docSnap.data().brand ?? 'error'
            comments = docSnap.data().comments ?? 'error'
            gTIN = docSnap.data().gTIN ?? 'error'
            
            if ((docSnap.data().identifierExists !== undefined) && (typeof docSnap.data().identifierExists === 'boolean')) {
                if (docSnap.data().identifierExists === true) { identifierExists = true }  else { identifierExists = false}
            } else {
                identifierExists = false
            }

            if ((docSnap.data().needsReplacement !== undefined) && (typeof docSnap.data().needsReplacement === 'boolean')) {
                if (docSnap.data().needsReplacement === true) { needsReplacement = true } else { needsReplacement = false}
            } else {
                needsReplacement = false
            }


            itemModelNumber = docSnap.data().itemModelNumber ?? 'error'
    
            if ((docSnap.data().timeToReplaceInDays !== undefined) && (typeof docSnap.data().timeToReplaceInDays === 'number')) {
                timeToReplaceInDays = docSnap.data().timeToReplaceInDays
            }

            title = docSnap.data().title ?? 'error'
            youTubeURL = docSnap.data().youTubeURL ?? 'error'
            purchaseDate = docSnap.data().purchaseDate ?? ''
            requiredReplacementDate = docSnap.data().requiredReplacementDate ?? ''

        } else {
            console.log("No such document!");
        }
        
            return {
                props: {
                    dataPointUID: dataPointRouteParamAsString,
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
                }
            }

    } else {
        console.log('context.params === undefined so point to 404')
        return {
            notFound: true
        }
    }
}



function DataPointPage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    let userContextObject = useContext(UserContext)

    function calculateProductLongevity(){

        let numberOfSecondsInAYear = (365*24*60*60)
        let numberOfSecondsInADay = (24*60*60)

        let purchaseDateAsUnixTimeStamp = Date.parse(props.purchaseDate)
        let replacementDateAsUnixTimeStamp = Date.parse(props.requiredReplacementDate)
        let productLifeSpanInSeconds = (replacementDateAsUnixTimeStamp - purchaseDateAsUnixTimeStamp)/1000

         if (   (props.purchaseDate === '') ||
                (props.requiredReplacementDate === '') ||
                (Number.isNaN(purchaseDateAsUnixTimeStamp)) ||
                (Number.isNaN(replacementDateAsUnixTimeStamp)) ||
                productLifeSpanInSeconds < 0
             ) { return 'Error' } 

        let productLifeSpanInYears = Math.floor(productLifeSpanInSeconds/numberOfSecondsInAYear)
        let productLifeSpanRemainderAfterDivisionByYears = (productLifeSpanInSeconds % numberOfSecondsInAYear)
        let productLifeSpanRemainderAfterDivisionByYearsStatedInDays = productLifeSpanRemainderAfterDivisionByYears/numberOfSecondsInADay
        let yearOrYearsString:string = 'years'
        if (productLifeSpanInYears === 1) {
            yearOrYearsString = 'year'
        }
        let dayOrDaysString = 'days';
        if (productLifeSpanRemainderAfterDivisionByYearsStatedInDays === 1) {
            dayOrDaysString = 'day'
        }

        return (
                productLifeSpanInYears + ' ' + yearOrYearsString + ' and ' + productLifeSpanRemainderAfterDivisionByYears/numberOfSecondsInADay + ' ' + dayOrDaysString +'.' 
                )

    }

    function YouTubeVideoComponent(){

        const correctEmbedURLPrefix = '^https://www.youtube.com/embed/';
        const regexp = new RegExp(correctEmbedURLPrefix);
        const candidateURL = props.youTubeURL;
        const regExTestResult = regexp.test(candidateURL);
        const candidateURLStringLength = candidateURL.length;
        if ((regExTestResult === true) && (candidateURLStringLength === 41)) {
            return (
                <div>
                    <iframe 
                        width="560" 
                        height="315" 
                        src={props.youTubeURL}
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen>
                    </iframe>
                </div>
            )
        } else {
            return(
                <div>
                    <p>A YouTube video does not exist for this data point.</p>
                </div>
            )
        }
    }

    return(
        <div className={productPageStyles.wrapper}>
            <h3>PRODUCT REVIEW: Is it durable?</h3> 
            <h1>{props.brandName}, {props.title}</h1>
            <h3>Link to YouTube durability video:</h3>
            <YouTubeVideoComponent/>
            <div>
                <h3>Date purchased (YYYY-MM-DD)</h3>
                <p>{props.purchaseDate}</p>
                <h3>Did this product break down and require replacement?</h3>
                <div>
                    {props.needsReplacement && 
                        <div>
                            <p>Yes.  It needed replacing on: <span>{props.requiredReplacementDate}</span> (YYYY-MM-DD).</p>  
                            <div>
                                This product lasted: {calculateProductLongevity()}
                            </div>
                        </div>}
                    {!props.needsReplacement && 
                    <div>
                        No. This product was still functional at the time of this report.    
                    </div>}
                </div>
            </div>
            <h3>Additional comments:</h3>
            <div className={utilStyles.preWrap}>
                <p>{props.comments}</p>
            </div>
            <div className={productPageStyles.productInformationContainer}>
                <h3>Product Information</h3>
                <p>Manufacturer: {props.brandName}</p>
                <p>GTIN: {props.gTIN}</p>
                <p>Item Model Number: {props.itemModelNumber}</p>
            </div>
            <p>AuthorUID: {props.authorUID}</p>
            <div>
                <b>About Duuurable</b>
                <p>What&#39;s the best product for you?  We believe the best products should be durable and last.  
                    Help others find the best products.  Write a product review focused on durability today!</p>
            </div>
            <div>
                {(userContextObject.userUIDString === props.authorUID) &&
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
                }
            </div>
        </div>
    )
}


export default DataPointPage