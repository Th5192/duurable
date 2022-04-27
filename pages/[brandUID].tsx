import { InferGetServerSidePropsType, GetServerSideProps, GetServerSidePropsContext } from 'next';

// React core.
import React from 'react';

import { doc, DocumentData, getDoc } from "firebase/firestore";

import {db} from '../pages/_app'

export const getServerSideProps:GetServerSideProps = async (context: GetServerSidePropsContext ) => {

        let brandUID:string = 'error'
        if (context.params !== undefined) {
            let brandUIDASString:string = context.params.brandUID as string
            brandUID = brandUIDASString ?? 'error'
        }

        const docRef = doc(db, 'products', 'itemRouteParameters', brandUID, 'itemRouteParameters');
        const docSnap = await getDoc(docRef);
        let data:DocumentData = {}
        let itemStringArray:String[] = []

        if (docSnap.exists()) {

            data = docSnap.data();
            Object.keys(data).forEach((item) => {
              console.log(item, data[item]);
              itemStringArray.push(item)
            });
            itemStringArray.sort()
        
        } else {
            console.log("No such document!");
        }
        
        return {
            props: {
                brandUID: brandUID,
                itemStringArray: itemStringArray
            }
        }
          
}

function ListOfBrandLinks({brandUID, itemStringArray}:{brandUID:string, itemStringArray:string[]}) {
    return (
        <div>
            <h1>Search by Global Trade Item Number (GTIN)</h1>
            <ul>
                {itemStringArray.map((item) => (
                    <li key={item}>
                        <a href={`/${brandUID}/${item}`}>{brandUID} {item}</a>
                    </li>
                ))}
            </ul>
        </div>
    )
}


function BrandDirectoryPage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    return(
        <div>
            <ListOfBrandLinks brandUID={props.brandUID} itemStringArray={props.itemStringArray}></ListOfBrandLinks>
        </div>        
    )

}


export default BrandDirectoryPage

           