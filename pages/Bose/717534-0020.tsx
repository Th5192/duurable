import productPageStyles from '../../styles/product-page.module.css'

export default function ProductPage(){
    return(
        <div className={productPageStyles.wrapper}>
            <h2>IS IT DURABLE?</h2>
            <h1>Bose SoundSport 717534-0020</h1>
            <div className={productPageStyles.videoContainer}>
                <iframe
                    src='https://www.youtube.com/embed/nSM7Jkkxn-s'
                    frameBorder='0'
                    allow='autoplay; encrypted-media'
                    allowFullScreen
                    title='Is it durable? Bose SoundSport 717534-0020'
                />
            </div>
            <h3>How long did it last before you needed a new one?</h3>
            <p>Approximately 3 years.</p>
            <h3>Additional comments:</h3>
            <p>They still work.  The issue is there is exposed wiring at the joint where the wires from the ears join together.  It makes me worry water will get into the wiring when I run outside and just looks ugly.</p>
            <div className={productPageStyles.productInformationContainer}>
            <h3>Product Information</h3>
            <p>Manufacturer: Bose Corporation</p>
            <p>Item Model Number: 717534-0020</p>
            </div>
        </div>
    )
}
