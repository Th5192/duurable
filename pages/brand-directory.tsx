import { InferGetServerSidePropsType, GetServerSideProps, GetServerSidePropsContext } from 'next';

// React core.
import React from 'react';

import { doc, DocumentData, getDoc } from "firebase/firestore";

import {db} from '../pages/_app'

export const getServerSideProps:GetServerSideProps = async (context: GetServerSidePropsContext ) => {

        const docRef = doc(db, 'products', 'brandRouteParameters');
        const docSnap = await getDoc(docRef);
        let brandDirectoryData:DocumentData = {}
        let brandStringArray:String[] = []

        if (docSnap.exists()) {

            brandDirectoryData = docSnap.data();
            Object.keys(brandDirectoryData).forEach((name) => {
              if (brandDirectoryData[name] > 0) {
                    brandStringArray.push(name)
                }
            });
            brandStringArray.sort()
        
        } else {
            console.log("No such document!");
        }
        
        return {
            props: {
                brandStringArray: brandStringArray
            }
        }
          
}

function ListOfBrandLinks({brandStringArray}:{brandStringArray:string[]}) {
    return (
        <div>
            <h1>Search by brand:</h1>
            <ul>
                {brandStringArray.map((brand) => (
                    <li key={brand}>
                        <a href={`/${brand}`}>{brand}</a>
                    </li>
                ))}
            </ul>
        </div>
    )
}


function BrandDirectoryPage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    return(
        <div>
            <ListOfBrandLinks brandStringArray={props.brandStringArray}></ListOfBrandLinks>
        </div>        
    )

}


export default BrandDirectoryPage

           