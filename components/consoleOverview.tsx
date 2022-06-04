import { collection, doc, DocumentData, getDoc, getDocs, limit, query, Query, where } from 'firebase/firestore';
import { db } from '../pages/_app';
import { useState, } from 'react';


export interface VotesForDay {
    Happy: number;
    Sad: number;
}

export interface DailyReports {
    [key:number]:VotesForDay
}

export default function ConsoleOverview() {
    const [isLoading, setLoading] = useState(false)
    const [pageUIDs, setPageUIDs] = useState<string[]>()
    const [pageURLUIDtoURLMap, setPageURLUIDtoURLMap] = useState<Map<string,string>>();
    const [datesWithVotes, setDatesWithVotes] = useState<number[]>()
    const [dailyReports, setDailyReports] = useState<DailyReports>()
    const [showOnlyReadComments, setShowOnlyReadComments] = useState<boolean | undefined>(undefined)

    // THIS IS HARDWIRED
    const hostname = 'localhost'

    function calculatePercent(numerator:number, denominator:number):string {

        if ((numerator === 0) || (denominator === 0)) {
            return 'na'
        } else {
            const percentage = numerator/denominator * 100
            const percentageAsString = String(percentage) ?? 'error'

            return  percentageAsString + '%'
        }
        
    }
        
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
                setDailyReports(data)
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
        console.log('RenderDailyReport yields dailyReportObject of: ' + dailyReports?.hasOwnProperty('20220531'))
        if (dailyReports !== undefined) {
            console.log('RenderDailyReport dailyReportObject.Object.getOwnPropertyNames(): ' + Object.getOwnPropertyNames(dailyReports) )
            console.log('dailyReportObject[20220531]: ' + dailyReports[20220531].Happy)
        
            return(
                <div>
                {datesWithVotes?.map((dateAsNumber) => (
                    <div key={dateAsNumber}>
                        <b>{dateAsNumber}</b>
                        <p>Happy votes = {dailyReports[dateAsNumber].Happy ?? 0}</p>
                        <p>Sad votes = {dailyReports[dateAsNumber].Sad ?? 0}</p>
                        <p>Percent Happy = {
                            calculatePercent(dailyReports[dateAsNumber].Happy, ((dailyReports[dateAsNumber].Happy ?? 0) + (dailyReports[dateAsNumber].Sad ?? 0)))
                        }
                        </p>
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

    async function filterComments(pageUID: string | undefined, read: boolean | undefined, commentStatusIsOpen: boolean | undefined) {
        
        let commentsRef = collection(db, 'userFeedback', 'commentsGroupedByHostname', hostname)

        let commentsQuery: Query<DocumentData>
        
        let queryConstraints = []

        if (pageUID !== undefined) {
            // NEED TO FIGURE THIS OUT
            // IT IS NOT THIS: queryConstraints.push(where('pageURL', '==', pageUID))
        }

        if (read !== undefined) {
            queryConstraints.push(where('read', '==', read))
        }

        if (commentStatusIsOpen !== undefined) {
            queryConstraints.push(where('commentStatusIsOpen', '==', commentStatusIsOpen))
        }
    
        commentsQuery =  query(commentsRef, ...queryConstraints);

        const querySnapshot = await getDocs(commentsQuery)
        querySnapshot.forEach((doc) => {
            console.log(doc.id, '=>', doc.data())
        });

    }

    function handleSubmit(){
        console.log('handleSubmit showOnlyReadComments yields: ' + JSON.stringify(showOnlyReadComments))
        filterComments(undefined, showOnlyReadComments, undefined)
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.persist()
        switch (event.target.id) {
            case 'readStatus':
                switch (event.target.value) {
                    case 'read':
                        setShowOnlyReadComments(true);
                        break;
                    case 'unread':
                        setShowOnlyReadComments(false);
                        break;
                    case 'all':
                        setShowOnlyReadComments(undefined);
                        break;
                    default:
                        setShowOnlyReadComments(undefined);
                        break;
                }
                break;
            default:
                break;
        }
    };

    return(
        <div>
            Hello, world!
            <div>
                <button onClick={getPageURLs}>See My Analytics Data</button>
            </div>
            <ListOfPageURLs/>
            <RenderDailyReport/>
            <form onSubmit={handleSubmit}>
                <fieldset>
                    <legend>
                        Read / Unread / All
                    </legend>
                    <input type='radio' id='readStatus' name='readStatus' value='read' onChange={handleChange}></input>
                    <label htmlFor='read'>Read</label><br/>
                    <input type='radio' id='readStatus' name='readStatus' value='unread'  onChange={handleChange}></input>
                    <label htmlFor='unread'>Unread</label><br/>
                    <input type='radio' id='readStatus' name='readStatus' value='all' onChange={handleChange}></input>
                    <label htmlFor='all'>All</label><br/>
                </fieldset>
                <div>
                    <button type='submit'>Submit</button>
                </div>
            </form>
        </div>
    )
}