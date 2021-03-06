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

        
        const docRef = doc(db, "products", "dataPointRouteParameters", brandRouteParamAsString, gTINRouteParamAsString);
        const docSnap = await getDoc(docRef);
        let dataPointRouteParametersExistOnFirebase:boolean = false
        let dataPointUIDStringArray:string[] = []

        if (docSnap.exists()) {
            dataPointRouteParametersExistOnFirebase = true
            
            let dataPointDirectoryData = docSnap.data();
            Object.keys(dataPointDirectoryData).forEach((dataPointUID) => {
              console.log(dataPointUID, dataPointDirectoryData[dataPointUID]);
              if (dataPointDirectoryData[dataPointUID] = true) {
                dataPointUIDStringArray.push(dataPointUID)
              }
            });
            dataPointUIDStringArray.sort()

        } else {
            dataPointRouteParametersExistOnFirebase = false
            console.log("No such document!");
        }
        
        if(dataPointRouteParametersExistOnFirebase===true) {
            return {
                props: {
                    dataPointUIDStringArray: dataPointUIDStringArray,
                    brandRouteParamAsString: brandRouteParamAsString,
                    gTINRouteParamAsString: gTINRouteParamAsString
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



function ListOfLinks({dataPointUIDStringArray, brandRouteParamAsString, gTINRouteParamAsString}:{dataPointUIDStringArray:string[], brandRouteParamAsString:string, gTINRouteParamAsString:string}) {
    return (
        <div>
            <h1>Search customer submitted durability videos</h1>
            <p>Each link below represents a user submitted durability report.  Click one to see what they had to say!</p>
            <ul>
                {dataPointUIDStringArray.map((dataPointUID) => (
                    <li key={dataPointUID}>
                        <a href={`/${brandRouteParamAsString}/${gTINRouteParamAsString}/${dataPointUID}`}>
                            {dataPointUID}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}


function DataPointDirectoryPage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    return(
        <div>
            <ListOfLinks dataPointUIDStringArray={props.dataPointUIDStringArray}  brandRouteParamAsString={props.brandRouteParamAsString} gTINRouteParamAsString={props.gTINRouteParamAsString} ></ListOfLinks>
        </div>        
    )

}


export default DataPointDirectoryPage

           