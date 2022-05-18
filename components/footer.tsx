import footerStyles from '../components/footer.module.css'
import Link from 'next/link'

export default function Footer () {
    return (
        <div className={footerStyles.container}>
            <div className={footerStyles.copyrightContainer}>
                <p>Copyright @ 2022 All rights reserved.</p>
            </div>
            <div className={footerStyles.footerLinksContainer}>
                <div className={footerStyles.footerLinkContainer}>
                    <Link href='/privacyandterms'><a>Terms of Use</a></Link>
                </div>
                <div className={footerStyles.footerLinkContainer}>
                    <Link href='/privacyandterms'><a>Privacy</a></Link>
                </div>
            </div>
        </div>
    )
}