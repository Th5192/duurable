import userFeedbackStyles from './userFeedback.module.css'
import { useState } from 'react'




export default function UserFeedback() {
    const [showHappyNotHappy, setShowHappyNotHappy] = useState(true)
    const [showFeedbackForm, setShowFeedbackForm] = useState(false)
    const [showFeedbackSentConfirmation, setShowFeedbackSentConfirmation] = useState(false)
    const [showFeedbackSendError, setShowFeedbackSendError] = useState(false)

    function handleHappyNotHappyClick() {
        setShowHappyNotHappy(false)
        setShowFeedbackForm(true)
    }

    function handleCloseButtonClick() {
        setShowFeedbackForm(false)
        setShowFeedbackSentConfirmation(true)
    }
    
    // I can use window.location.href to get the url of the page in question.

    return(
        <div>
            { (showHappyNotHappy === true) && 
                <div className={userFeedbackStyles.userFeedbackContainer}>
                        <p>Was this helpful?</p>
                        <div className={userFeedbackStyles.happyNotHappyContainer}>
                            <div onClick={() => handleHappyNotHappyClick()} className={userFeedbackStyles.happy}>
                                <span className='material-icons'>sentiment_satisfied</span>
                            </div>
                            <div onClick={() => handleHappyNotHappyClick()} className={userFeedbackStyles.notHappy}>
                                <span className='material-icons'>sentiment_dissatisfied</span>
                            </div>
                        </div>
                </div>
            }
            { (showFeedbackForm === true) &&
                <div>
                    <form className={userFeedbackStyles.feedbackForm}>
                    <p>Thank you!</p>
                    <p>If you&#39;d like to leave a comment please do so below. Otherwise, click CLOSE.</p>
                    <label>Email (optional):</label>
                    <input type='text' placeholder='example@example.com'></input>
                    <label>Comment:</label>
                    <textarea rows={10}></textarea>
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