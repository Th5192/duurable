import userFeedbackStyles from './userFeedback.module.css'
import React, { useEffect, useState } from 'react'
import { collection, doc, getDocs, limit, setDoc, query, runTransaction, where, Timestamp, DocumentReference, DocumentData, serverTimestamp } from 'firebase/firestore'
import {db} from '../pages/_app'
import Image from 'next/image'

export default function UserFeedback() {
    const [showHappyNotHappy, setShowHappyNotHappy] = useState(true)
    const [showFeedbackForm, setShowFeedbackForm] = useState(false)
    const [showFeedbackSentConfirmation, setShowFeedbackSentConfirmation] = useState(false)
    const [hostname, setHostname] = useState<string|undefined>(undefined)
    const [hostnameSavedInFirebase, setHostnameSavedInFirebase] = useState<boolean|undefined>(undefined)
    const [emailAddress, setEmailAddress] = useState('')
    const [comment, setComment] = useState('')

    useEffect(() => {
        setHostname(window.location.hostname)
        console.log('!!! useEffect/setPageURL triggered...')
    }, [])

    let newPageURLUIDRef:DocumentReference<DocumentData> | undefined = undefined

    enum Sentiment {
        Happy = "Happy",
        Sad = "Sad"
    }

    function getPageURL():string {
        let pageURL:string = 'errorCouldNotRetrieveWindowLocationHref'
        pageURL = window.location.href
        return pageURL
    }

    async function checkIfHostnameExistsInFirebase(sentimentValue:Sentiment) {
        if (hostnameSavedInFirebase === true) {
            console.log('hostnameSavedInFirebase === true so skipping to getPageURLUID.')
            getPageURLUID(sentimentValue)
        } else {
            if (hostname !== undefined) {
                console.log('hostnameSavedInFirebase === undefined so SET or GET triggered now.')
                const hostnameRef = collection(db, 'userFeedback', 'hostnameDirectory', 'hostnameDirectory');
                let q = query(hostnameRef, where('hostnameUID', '==', hostname));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    try {
                        await setDoc(doc(hostnameRef), {
                            hostnameUID: hostname
                        }, {merge:true} )
                        setHostnameSavedInFirebase(true)
                        getPageURLUID(sentimentValue)
                    } catch (e) {
                        setHostnameSavedInFirebase(false)
                    }
                } else {
                    setHostnameSavedInFirebase(true)
                    getPageURLUID(sentimentValue)
                }
            }
        }
    }

    async function getPageURLUID(sentimentValue:Sentiment) {

        let pageURL:string = getPageURL()

        if (hostname !== undefined) {
            const pageURLCollectionRef = collection(db, 'userFeedback', 'pageURLDirectories', hostname, 'pageURLDirectory', 'pageURLUIDs')
            const q = query(pageURLCollectionRef, where("pageURL", "==", pageURL), limit(1))
            const querySnapshot = await getDocs(q)

            if (querySnapshot.empty) {
                newPageURLUIDRef = doc(collection(db, 'userFeedback', 'pageURLDirectories', hostname, 'pageURLDirectory', 'pageURLUIDs'))
                setDoc((newPageURLUIDRef),{
                    pageURL: pageURL
                })
                .then(()=>{
                    if (newPageURLUIDRef !== undefined) {
                        console.log('done and pageURLUID yields: ' + JSON.stringify(newPageURLUIDRef.id))
                        recordTransactions(newPageURLUIDRef.id, sentimentValue)
                    }
                })
                .catch((error)=>{

                });
            } else {
                querySnapshot.forEach((doc) => {
                    recordTransactions(doc.id, sentimentValue)
                })
            }
        }
    }


    // This code was created to log detailed vote ledgers by page. But in the end I decided not to use this type of data.
    // This code is therefore commented out.  If I reinstate this code it needs to be proofed to make sure it works correctly.
    /*
    async function recordVote(pageURLUID: string, sentimentValue:Sentiment) {
        const batch = writeBatch(db)
        let voteUID:string|undefined = undefined

        if (hostname !== undefined){
            const hostnameVotesAsDocsRef = doc(collection(db, 'userFeedback', 'hostnameVotesAsDocs', hostname))
            voteUID = hostnameVotesAsDocsRef.id
            batch.set(hostnameVotesAsDocsRef, {
                    pageURL: pageURL,
                    sentimentValue: sentimentValue,
                    timestamp: Timestamp.now()
            }, {merge:true});

            const hostnameVotesAsFieldsRef = doc(db, 'userFeedback', 'hostnameVotesAsFields', hostname, 'allVotesForHostname')
            batch.set(hostnameVotesAsFieldsRef, {
                [voteUID]:{
                    pageURL: pageURL,
                    sentimentValue: sentimentValue,
                    timestamp: Timestamp.now()
                }
            }, {merge:true});

            const pageVotesRef = doc(db, 'userFeedback', 'pageVotes', 'pageVotes', pageURLUID)
            batch.set(pageVotesRef, {
                [voteUID]:{
                    pageURL: pageURL,
                    sentimentValue: sentimentValue,
                    timestamp: Timestamp.now()
                }
            }, {merge:true});

            await batch.commit()
       
        }

    }
    */

    async function recordTransactions(pageURLUID:string, sentimentValue:Sentiment){
        let now = Timestamp.now()
        let nowAsDate = now.toDate()
        let dayOfMonth = nowAsDate.getDate()
        let dayOfMonthAsTwoDigitString = dayOfMonth.toLocaleString('en-US',{minimumIntegerDigits:2})
        // .getMonth() method returns January as 0 so need to add plus 1 to make this number human readable
        let monthofYear = nowAsDate.getMonth() + 1
        let monthOfYearAsTwoDigitString = monthofYear.toLocaleString('en-US',{minimumIntegerDigits:2})
        let fullYear = nowAsDate.getFullYear()
        let fullYearAsFourDigitString = fullYear.toLocaleString('en-US',{minimumIntegerDigits:4, useGrouping:false})
        let nowAsYYYYMMDDString:string = fullYearAsFourDigitString + monthOfYearAsTwoDigitString + dayOfMonthAsTwoDigitString

        console.log('nowAsYYYYMMDDString: ' + nowAsYYYYMMDDString)
            if (hostname !== undefined && pageURLUID !== undefined) {
    
                const panelDataRef = doc(db, 'userFeedback', 'panelData', hostname,'dailyReports', pageURLUID, 'dailyReport')

                try {
                    await runTransaction(db, async (transaction) => {
                    const panelDataDoc = await transaction.get(panelDataRef);
                    
                    let newVoteCount = 1
                    if(panelDataDoc.exists()) {
                        if (panelDataDoc.data() !== undefined) {
                            if (panelDataDoc.data()[nowAsYYYYMMDDString] !== undefined) {
                                if (panelDataDoc.data()[nowAsYYYYMMDDString][sentimentValue] !== undefined) {
                                    newVoteCount = panelDataDoc.data()[nowAsYYYYMMDDString][sentimentValue] + 1;
                                }
                            }
                        }
                    }
                    
                    transaction.set(panelDataRef, { 
                        [nowAsYYYYMMDDString]:{
                            [sentimentValue]:newVoteCount
                        }
                    }, {merge:true});
                    });
                    console.log("Transaction successfully committed!");
                } catch (e) {
                    console.log("Transaction failed: ", e);
                }
            }
    }

    function handleHappyNotHappyClick(sentimentValue:Sentiment) {

        checkIfHostnameExistsInFirebase(sentimentValue)

        setShowHappyNotHappy(false)
        setShowFeedbackForm(true)
    }

    const handleEmailAddressInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmailAddress(event.target.value)
    }
    
    const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComment(event.target.value)
    }
  
    async function pushCommentToFirebase(){

        let pageURL:string = getPageURL()

        if (hostname !== undefined) {
            const commentsGroupedByHostnameRef = doc(collection(db, 'userFeedback', 'commentsGroupedByHostname', hostname))
            const commentData = {
                comment: comment,
                emailAddress: emailAddress,
                pageURL: pageURL,
                timestamp: serverTimestamp(),
                read: false,
                commentStatusIsOpen: true
            }

            try { 
                await setDoc(commentsGroupedByHostnameRef,  commentData , {merge:true})
            } catch (e) {

            }
        }

    }

    const handleSubmit = (event: React.ChangeEvent<HTMLFormElement>) => {
        event.preventDefault()
        pushCommentToFirebase()
        setShowFeedbackForm(false)
        setShowFeedbackSentConfirmation(true)
    }

    function handleCloseButtonClick() {
        setShowFeedbackForm(false)
        setShowFeedbackSentConfirmation(true)
    }
    
    
    return(
        <div>
            { (showHappyNotHappy === true) && 
                <div className={userFeedbackStyles.userFeedbackContainer}>
                        <p>Was this helpful?</p>
                        <div className={userFeedbackStyles.happyNotHappyContainer}>
                            <div onClick={() => handleHappyNotHappyClick(Sentiment.Happy)} className={userFeedbackStyles.happy}>
                                <Image src='/thumb_up_FILL0_wght400_GRAD0_opsz48.svg' alt='happy' width='20' height='20'/> 
                            </div>
                            <div onClick={() => handleHappyNotHappyClick(Sentiment.Sad)} className={userFeedbackStyles.notHappy}>
                                <Image src='/thumb_down_FILL0_wght400_GRAD0_opsz48.svg' alt='happy' width='20' height='20'/> 
                            </div>
                        </div>
                </div>
            }
            { (showFeedbackForm === true) &&
                <div>
                    <form className={userFeedbackStyles.feedbackForm} onSubmit={handleSubmit}>
                    <p>Thank you!</p>
                    <p>If you&#39;d like to leave a comment please do so below. Otherwise, click CLOSE.</p>
                    <label>Email (optional):</label>
                    <input type='text' placeholder='example@example.com' value={emailAddress} onChange={handleEmailAddressInputChange}></input>
                    <label>Comment:</label>
                    <textarea required placeholder='My comment goes here...' rows={10} value={comment} onChange={handleTextAreaChange}></textarea>
                    <button className={userFeedbackStyles.submitButton}>Submit</button>
                    <button className={userFeedbackStyles.closeButton} onClick={() => handleCloseButtonClick()}>Close</button>
                    </form>
                </div>
            }
            { (showFeedbackSentConfirmation) &&
                <div className={userFeedbackStyles.feedbackSentConfirmation}>
                    <i>Thank you for your feedback!</i>
                </div>
            }
        </div>
    )
}