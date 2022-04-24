import productPageStyles from '../../styles/product-page.module.css';
import { InferGetServerSidePropsType, GetServerSideProps, GetServerSidePropsContext } from 'next';

// React core.
import React from 'react';

import { doc, getDoc } from "firebase/firestore";

import {db} from '../_app'

export const getServerSideProps:GetServerSideProps = async (context: GetServerSidePropsContext ) => {
    
    if (context.params !== undefined) {
        const brandUIDRouteParam = context.params.brandUID
        const productUIDRouteParam = context.params.productUID

        const brandRouteParamAsString = brandUIDRouteParam?.toString() ?? ''
        const gTINRouteParamAsString = productUIDRouteParam?.toString() ?? ''

        
        const docRef = doc(db, "products", "itemsSortedByBrand", brandRouteParamAsString, gTINRouteParamAsString);
        const docSnap = await getDoc(docRef);
        let productDetailsExistOnFirebase:boolean = false
        let brandName:string = 'Error';
        let comments:string = 'Error';
        let gTIN:string = 'Error';
        let identifierExists:boolean = false;
        let itemModelNumber:string = 'Error';
        let timeToReplaceInDays:number = -1;
        let title:string = 'Error';
        let youTubeURL:string = 'Error';

        if (docSnap.exists()) {
            productDetailsExistOnFirebase = true
            brandName = docSnap.data().brand ?? 'error'
            comments = docSnap.data().comments ?? 'error'
            gTIN = docSnap.data().gTIN ?? 'error'
            
            if ((docSnap.data().identifierExists !== undefined) && (typeof docSnap.data().identifierExists === 'boolean')) {
                if (docSnap.data().identifierExists === true) { identifierExists = true }  else { identifierExists = false}
            } else {
                identifierExists = false
            }
            
            itemModelNumber = docSnap.data().itemModelNumber ?? 'error'
    
            if ((docSnap.data().timeToReplaceInDays !== undefined) && (typeof docSnap.data().timeToReplaceInDays === 'number')) {
                timeToReplaceInDays = docSnap.data().timeToReplaceInDays
            }

            title = docSnap.data().title ?? 'error'
            youTubeURL = docSnap.data().youTubeURL ?? 'error'

        } else {
            productDetailsExistOnFirebase = false
            console.log("No such document!");
        }
        
        if(productDetailsExistOnFirebase===true) {
            return {
                props: {
                    brandName: brandName,
                    comments: comments,
                    gTIN: gTIN,
                    identifierExists: identifierExists,
                    itemModelNumber: itemModelNumber,
                    timeToReplaceInDays: timeToReplaceInDays,
                    title: title,
                    youTubeURL: youTubeURL
                }
            }
        } else {
            return {
                notFound: true
            }      
        }
    } else {
        return {
            notFound: true
        }
    }
}



function ProductPage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    return(
        <div className={productPageStyles.wrapper}>
            <h2>IS IT DURABLE?</h2>
            <h1>{props.brandName}, {props.title}</h1>
            <div className={productPageStyles.videoContainer}>
                <iframe
                    src={props.youTubeURL}
                    frameBorder='0'
                    allow='autoplay; encrypted-media'
                    allowFullScreen
                    title='Video showing durability test.'
                />
            </div>
            <h3>How long did it last before you needed a new one?</h3>
            <p>{props.timeToReplaceInDays} days</p>
            <h3>Additional comments:</h3>
            <p>{props.comments}</p>
            <div className={productPageStyles.productInformationContainer}>
                <h3>Product Information</h3>
                <p>Manufacturer: {props.brandName}</p>
                <p>GTIN: {props.gTIN}</p>
                <p>Item Model Number: {props.itemModelNumber}</p>
            </div>
        </div>
    )
}


export default ProductPage