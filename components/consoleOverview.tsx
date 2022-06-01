import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../pages/_app';
import { useState, } from 'react';


export interface VotesForDay {
    Happy: number;
    Sad: number;
}

export interface DailyReport {
    [key:number]:VotesForDay
}

export default function ConsoleOverview() {
    const [isLoading, setLoading] = useState(false)
    const [pageUIDs, setPageUIDs] = useState<string[]>()
    const [pageURLUIDtoURLMap, setPageURLUIDtoURLMap] = useState<Map<string,string>>();
    const [datesWithVotes, setDatesWithVotes] = useState<number[]>()
    const [dailyReportObject, setDailyReportObject] = useState<DailyReport>()

    // THIS IS HARDWIRED
    const hostname = 'localhost'
        
    async function getPageURLs() {
        const pageURLsRef = collection(db, 'userFeedback', 'pageURLDirectories', hostname, 'pageURLDirectory', 'pageURLUIDs')
        const querySnapshot = await getDocs(pageURLsRef)
        const tempMap = new Map()
        const tempPageUIDArray = new Array()
        querySnapshot.forEach((doc) => {
            console.log(doc.id, '=>', doc.data().pageURL)
            tempMap.set(doc.id, doc.data().pageURL)    
            tempPageUIDArray.push(doc.id)
        });
        console.log('tempMap.size after forEach yields: ' + JSON.stringify(tempMap.size))
        setPageURLUIDtoURLMap(tempMap)
        setPageUIDs(tempPageUIDArray)
        setLoading(false)
    }

    function getPageData(pageUID:string){
        if (pageURLUIDtoURLMap !== undefined) {
            console.log('pageURLUIDtoURLMap: ' + JSON.stringify(pageURLUIDtoURLMap.size))
            console.log('getpage data for this pageUID: ' + pageURLUIDtoURLMap.get(pageUID))
            getDailyVoteReport(pageUID)
        }
    }

    async function getDailyVoteReport(pageUID:string){
        if (hostname !== undefined) {
            const dailyVoteReportRef = doc(db, 'userFeedback', 'panelData', hostname, 'dailyReports', pageUID, 'dailyReport');
            let docSnapshot = await getDoc(dailyVoteReportRef);
            if (docSnapshot.exists()){
                let data = docSnapshot.data()
                setDailyReportObject(data)
                let tempDatesWithVotes = new Array() 
                for (const[key,value] of Object.entries(data)){
                    console.log('key yields: ' + key)
                    console.log('value yields: ' + JSON.stringify(value))
                    console.log('value.Happy yields: ' + JSON.stringify(value.Happy))
                    console.log('Number(key) yields' + Number(key))
                    if (Number(key) !== NaN) {
                        tempDatesWithVotes.push(Number(key))
                    }
                }
                setDatesWithVotes(tempDatesWithVotes)

            }
        }
    }


    function RenderDailyReport(){
        console.log('RenderDailyReport yields datesWithVotes of: ' + JSON.stringify(datesWithVotes) + ' length: ' + datesWithVotes?.length)
        console.log('RenderDailyReport yields dailyReportObject of: ' + dailyReportObject?.hasOwnProperty('20220531'))
        if (dailyReportObject !== undefined) {
            console.log('RenderDailyReport dailyReportObject.Object.getOwnPropertyNames(): ' + Object.getOwnPropertyNames(dailyReportObject) )
            console.log('dailyReportObject[20220531]: ' + dailyReportObject[20220531].Happy)
        
            return(
                <div>
                {datesWithVotes?.map((dateAsNumber) => (
                    <div key={dateAsNumber}>
                        <b>{dateAsNumber}</b>
                        <p>Happy votes = {dailyReportObject[dateAsNumber].Happy}</p>
                        <p>Sad votes = {dailyReportObject[dateAsNumber].Sad ?? 0}</p>
                    </div>
                ))}
                </div>
            )
        } else {
            return(
                <p> No data available</p>
            )
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
            <RenderDailyReport/>
        </div>
    )
}