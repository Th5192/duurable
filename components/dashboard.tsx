import { collection, doc, DocumentData, endAt, getDoc, getDocs, limit, limitToLast, orderBy, query, Query, QueryDocumentSnapshot, setDoc, startAfter, Timestamp, where } from 'firebase/firestore';
import { db } from '../pages/_app';
import React, { useState, } from 'react';

import dashboardStyles from './dashboard.module.css'
import utilStyles from '../styles/utils.module.css'

enum ConsoleChoice {
    VotesConsole = 'VotesConsole',
    CommentsConsole = 'CommentsConsole'
}

enum PaginationOption {
    GetNext = 'Next',
    GetPrevious = 'Previous'
}


export interface VotesForDay {
    Happy: number;
    Sad: number;
}

export interface DailyReports {
    [key:number]:VotesForDay
}

export interface RetrievedComment {
    [key:string]: any
}

export default function Dashboard() {
    const [consoleChoice, setConsoleChoice] = useState<ConsoleChoice | undefined>(undefined)
    const [voteReportForPageIsInView, setVoteReportForPageIsInView] = useState<boolean>(false)
    const [voteReportIsForThisURL, setVoteReportIsForThisURL] = useState<string | undefined>(undefined)
    const [isLoading, setLoading] = useState(false)
    const [queryInProgress, setQueryInProgress] = useState(false)
    const [pageUIDs, setPageUIDs] = useState<string[]>()
    const [pageURLUIDtoURLMap, setPageURLUIDtoURLMap] = useState<Map<string,string>>();
    const [datesWithVotes, setDatesWithVotes] = useState<number[]>()
    const [dailyReports, setDailyReports] = useState<DailyReports>()
    const [showOnlyReadComments, setShowOnlyReadComments] = useState<boolean | undefined>(false)
    const [showOnlyOpenCaseStatusComments, setShowOnlyOpenCaseStatusComments] = useState<boolean | undefined>(true)
    const [retrievedComment, setRetrievedComment] = useState<RetrievedComment | undefined>(undefined)
    const [queryCursor, setQueryCursor] = useState<QueryDocumentSnapshot<DocumentData> | undefined>(undefined)
    // const [commentQueryInProgress, setCommentQueryInProgress] = useState(false)
    const [previousButtonEnabled, setPreviousButtonEnabled] = useState(false)
    const [nextButtonEnabled, setNextButtonEnabled] = useState(false)
    const [commentStatusIsOpen, setCommentStatusIsOpen] = useState<boolean | undefined>(undefined)
    const [commentUnderReviewUID, setCommentUnderReviewUID] = useState<string | undefined>(undefined)
    const [commentHasBeenRead, setCommentHasBeenRead] = useState<boolean | undefined>(undefined)

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
            setVoteReportForPageIsInView(true)
            let urlAsString = pageURLUIDtoURLMap.get(pageUID)
            setVoteReportIsForThisURL(urlAsString)
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
                    <div>
                        <h3>Daily user sentiment vote tally for:</h3>
                        <p>{voteReportIsForThisURL}</p>
                    </div>
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

    async function filterComments(pageUID: string | undefined, read: boolean | undefined, commentStatusIsOpen: boolean | undefined, paginationOption: PaginationOption | undefined) {
        
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

        console.log('queryCursor yields: ' + JSON.stringify(queryCursor))
        if (paginationOption !== undefined) {
            switch (paginationOption) {
                case PaginationOption.GetNext:
                    queryConstraints.push(orderBy('timestamp'), startAfter(queryCursor), limit(1))
                    break;
                case PaginationOption.GetPrevious:
                    queryConstraints.push(orderBy('timestamp'), endAt(queryCursor), limitToLast(1))
                    break;
            }
        } else {
            queryConstraints.push(orderBy('timestamp'), limit(1))
        }
    
        commentsQuery =  query(commentsRef, ...queryConstraints);

        const querySnapshot = await getDocs(commentsQuery)

        if (querySnapshot.empty) {
            console.log('no docs returned')
            switch (paginationOption) {
                case PaginationOption.GetPrevious:
                    setPreviousButtonEnabled(false);
                    break;
                case PaginationOption.GetNext:
                    setNextButtonEnabled(false);
                    break;
                default:
                    setQueryCursor(undefined);
                    setRetrievedComment(undefined);
                    setPreviousButtonEnabled(false);
                    setNextButtonEnabled(false);
                    setCommentUnderReviewUID(undefined);
                    setCommentStatusIsOpen(undefined)
                    break;
            }


        } else { 
        querySnapshot.forEach((doc) => {
            let data = doc.data()
            setQueryCursor(doc)
            setRetrievedComment(data)
            setPreviousButtonEnabled(true)
            setNextButtonEnabled(true)
            console.log(doc.id, '=>', doc.data())
            setCommentUnderReviewUID(doc.id)
            if (data.hasOwnProperty('commentStatusIsOpen')){
                setCommentStatusIsOpen(data['commentStatusIsOpen'])
            } 
            if (data.hasOwnProperty('read')){
                if (data['read'] === false){
                    setCommentHasBeenReadInFirebase(doc.id)
                }
            }   

        });

        }

    }

    async function toggleCaseOpenStatusInFirebase() {
        let newState = !commentStatusIsOpen
        if (commentUnderReviewUID !== undefined) {
            let caseStatusRef = doc(db, 'userFeedback', 'commentsGroupedByHostname', hostname, commentUnderReviewUID)
            
            let togglePromise =  setDoc(caseStatusRef, {
                commentStatusIsOpen: newState
            }, {merge:true}) 
            
            togglePromise
                .then( response => {
                        toggleCaseOpenStatus()
                })
                .catch( error => {

                })
        }
    }
    
    
    function toggleCaseOpenStatus(){
        let newState = !commentStatusIsOpen
        setCommentStatusIsOpen(newState)
    }


    async function setCommentHasBeenReadInFirebase(docID:string) {
            let readStatusRef = doc(db, 'userFeedback', 'commentsGroupedByHostname', hostname, docID)
            
            let promise =  setDoc(readStatusRef, {
                read: true
            }, {merge:true}) 
            
            promise
            .then( response => {
                    setCommentHasBeenRead(true)
            })
            .catch( error => {

            })
    }
    
    async function toggleCommentHasBeenReadStatusInFirebase() {
        let newState = !commentHasBeenRead
        if (commentUnderReviewUID !== undefined) {
            let readStatusRef = doc(db, 'userFeedback', 'commentsGroupedByHostname', hostname, commentUnderReviewUID)
            
            let togglePromise =  setDoc(readStatusRef, {
                read: newState
            }, {merge:true}) 
            
            togglePromise
                .then( response => {
                        toggleCommentHasBeenReadStatus()
                })
                .catch( error => {

                })
        }
    }

    function toggleCommentHasBeenReadStatus(){
        let newState = !commentHasBeenRead
        setCommentHasBeenRead(newState)
    }

    function RenderCommentUnderReview(){

        if (retrievedComment === undefined) {
            switch (queryInProgress) {
                case true:
                    return(
                        <div>No results match your search parameters.</div>
                    )
                case false:
                    return(
                        <div></div>
                    )
            }
        }
        
        let comment:string = 'Error'
        let emailAddress:string = 'Error'
        let pageURL:string = 'Error'
        let timestamp:Timestamp = Timestamp.now()

        if (retrievedComment.hasOwnProperty('comment')){
            comment = retrievedComment['comment']
        }


        if (retrievedComment.hasOwnProperty('emailAddress')){
            emailAddress = retrievedComment['emailAddress']
        }

        if (retrievedComment.hasOwnProperty('pageURL')){
            pageURL = retrievedComment['pageURL']
        }

        if (retrievedComment.hasOwnProperty('timestamp')){
            timestamp = retrievedComment['timestamp']
        }

        return(
            <div className={dashboardStyles.commentUnderReviewContainer}>
                <p>Comment: {comment}</p>
                <p>{commentStatusIsOpen ? 'Case is open' : 'Case is closed'}</p>
                <div>
                    <button onClick={toggleCaseOpenStatusInFirebase}>{(commentStatusIsOpen ? 'Close case' : 'Open case')}</button>
                </div>
                <p>Email Address: {emailAddress}</p>
                <p>PageURL: {pageURL}</p>
                <p>{(commentHasBeenRead) ? 'Read' : 'Unread'}</p>
                <div>
                    <button onClick={toggleCommentHasBeenReadStatusInFirebase}>{commentHasBeenRead ? 'Mark as unread' : 'Mark as read'}</button>
                </div>
                <p>Timestamp: {String(timestamp.toDate())}</p>
            </div>
            )
    }

    function RenderPaginationButtons() {
        return(
            <div>
            {(queryCursor !== undefined) &&
                <div>
                    <div>
                        {(nextButtonEnabled === true ) && 
                            <button onClick={() => filterComments(undefined, showOnlyReadComments, showOnlyOpenCaseStatusComments, PaginationOption.GetNext)}>Get Next</button>
                        }
                        {(nextButtonEnabled === false) &&
                            <p>There are no further comments to review.</p>
                        }
                    </div>
                    <div>
                        {(previousButtonEnabled === true) &&
                            <button onClick={() => filterComments(undefined, showOnlyReadComments, showOnlyOpenCaseStatusComments, PaginationOption.GetPrevious)}>Get Previous</button>
                        }   
                        {(previousButtonEnabled === false) &&
                            <p>There are no prior comments.</p>
                        }          
                    </div>
                </div>
            }
            </div>
        )
    }

    const handleSubmit = (event: React.ChangeEvent<HTMLFormElement>) => {
        event.preventDefault()
        filterComments(undefined, showOnlyReadComments, showOnlyOpenCaseStatusComments, undefined)
        setQueryInProgress(true)
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
            case 'caseStatus':
                switch (event.target.value) {
                    case 'open':
                        setShowOnlyOpenCaseStatusComments(true);
                        break;
                    case 'closed':
                        setShowOnlyOpenCaseStatusComments(false);
                        break;
                    case 'all':
                        setShowOnlyOpenCaseStatusComments(undefined);
                        break;
                    default:
                        setShowOnlyOpenCaseStatusComments(undefined);
                        break;
                }
                break;
            default:
                break;
        }
    };

    function RenderCommentsConsole(){
        return(
            <div>
                <div>
                    <h1>Comments</h1>
                    <p>Use the console below to search for comments, e.g., new comments that have not been read yet or comments that created a case that have not been closed yet, etc.</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <fieldset className={dashboardStyles.fieldSetAutoWidth}>
                        <legend>
                            Read / Unread / All
                        </legend>
                        <input type='radio' id='readStatus' name='readStatus' value='read' checked={(showOnlyReadComments === true)} onChange={handleChange}></input>
                        <label htmlFor='read'>Read</label><br/>
                        <input type='radio' id='readStatus' name='readStatus' value='unread'  checked={(showOnlyReadComments === false)} onChange={handleChange}></input>
                        <label htmlFor='unread'>Unread</label><br/>
                        <input type='radio' id='readStatus' name='readStatus' value='all' checked={(showOnlyReadComments === undefined)} onChange={handleChange}></input>
                        <label htmlFor='all'>All</label><br/>
                    </fieldset>
                    <fieldset className={dashboardStyles.fieldSetAutoWidth}>
                        <legend>
                            Case Status: Open / Closed / All
                        </legend>
                        <input type='radio' id='caseStatus' name='caseStatus' value='open' checked={(showOnlyOpenCaseStatusComments === true)} onChange={handleChange}></input>
                        <label htmlFor='read'>Open</label><br/>
                        <input type='radio' id='caseStatus' name='caseStatus' value='closed' checked={(showOnlyOpenCaseStatusComments === false)} onChange={handleChange}></input>
                        <label htmlFor='unread'>Closed</label><br/>
                        <input type='radio' id='caseStatus' name='caseStatus' value='all' checked={(showOnlyOpenCaseStatusComments === undefined)} onChange={handleChange}></input>
                        <label htmlFor='all'>All</label><br/>
                    </fieldset>
                    <div>
                        <button className={utilStyles.largeButton} type='submit'>Search for comments</button>
                    </div>
                </form>
                <RenderCommentUnderReview/>
                <RenderPaginationButtons/>
            </div>
        )
    }

    function RenderVotesConsole(){
        return(
            <div className={dashboardStyles.votesConsole}>
                {(voteReportForPageIsInView === false) && 
                    <div>
                        PAGES WITH VOTE DATA
                        <ListOfPageURLs/>
                        <button onClick={getPageURLs}>Refresh Page URLs</button>
                    </div>
                }
                {(voteReportForPageIsInView === true) &&
                <div>
                    <button onClick={() => setVoteReportForPageIsInView(false)}>Choose a different page</button>
                    <RenderDailyReport/>
                </div>
                }
            </div>
        )
    }

    function chooseConsoleToView(consoleChoice: ConsoleChoice | undefined){
        setConsoleChoice(consoleChoice)

        if (consoleChoice === ConsoleChoice.VotesConsole && pageUIDs === undefined){
            getPageURLs()
            console.log('getPageURLs triggered')
        }
    }

    return(
        <div>
            Analytics: Dashboard
            <div>
                {(consoleChoice === undefined) &&
                    <div> 
                        <button onClick={() => chooseConsoleToView(ConsoleChoice.VotesConsole)}>Votes</button>
                        <button onClick={() => chooseConsoleToView(ConsoleChoice.CommentsConsole)}>Comments</button>
                    </div>
                }
                {(consoleChoice !== undefined) &&
                    <div>
                        <button className={dashboardStyles.simpleButton} onClick={() => chooseConsoleToView(undefined)}>Main Menu</button>
                    </div>
                }
            </div>
            {(consoleChoice === ConsoleChoice.VotesConsole) &&
                <RenderVotesConsole/>
            }
            {(consoleChoice === ConsoleChoice.CommentsConsole) &&
                <RenderCommentsConsole/>            
            }
        </div>
    )
}