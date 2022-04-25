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
              console.log(name, brandDirectoryData[name]);
              brandStringArray.push(name)
            });
        
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

           