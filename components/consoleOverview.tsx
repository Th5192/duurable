import { collection, getDocs } from 'firebase/firestore';
import { db } from '../pages/_app';
import { useState, } from 'react';

export default function ConsoleOverview() {
    const [isLoading, setLoading] = useState(false)
    const [pageUIDs, setPageUIDs] = useState<string[]>()
    const [pageURLUIDtoURLMap, setPageURLUIDtoURLMap] = useState<Map<string,string>>();

    // THIS IS HARDWIRED
    const hostName = 'localhost'
        
    async function getPageURLs() {
        const pageURLsRef = collection(db, 'userFeedback', 'pageURLDirectories', hostName, 'pageURLDirectory', 'pageURLUIDs')
        const querySnapshot = await getDocs(pageURLsRef)
        const tempMap = new Map()
        const tempPageUIDArray = new Array()
        querySnapshot.forEach((doc) => {
            console.log(doc.id, '=>', doc.data().pageURL)
            tempMap.set(doc.id, doc.data().pageURL)    
            tempPageUIDArray.push(doc.id)
        });
        console.log('tempMap.size after forEach yields: ' + JSON.stringify(tempMap.size))
        console.log('tempMap.get(foo) yields: + ' + tempMap.get('foo'))
        setPageURLUIDtoURLMap(tempMap)
        setPageUIDs(tempPageUIDArray)
        setLoading(false)
    }

    function getPageData(pageUID:string){
        if (pageURLUIDtoURLMap !== undefined) {
            console.log('pageURLUIDtoURLMap: ' + JSON.stringify(pageURLUIDtoURLMap.size))
            console.log('getpage data for this pageUID: ' + pageURLUIDtoURLMap.get(pageUID))
        }
    }

    function ListOfPageURLs(){
        if (pageUIDs === undefined) {
            return(
                <div>
                    No data exists
                </div>
            )
        }

        return(
            <div>
                {
                    pageUIDs.map((urlUID) => (
                        <button key={urlUID} onClick={() => getPageData(urlUID)}>{pageURLUIDtoURLMap?.get(urlUID) ?? 'error'}</button>
                    ))
                }
            </div>
        )
        
    }

    return(
        <div>
            Hello, world!
            <div>
                <button onClick={getPageURLs}>See My Analytics Data</button>
            </div>
            <ListOfPageURLs/>
        </div>
    )
}