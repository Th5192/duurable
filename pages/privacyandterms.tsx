import Layout from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import { getMarkdownData } from '../lib/markdown'

export async function getStaticProps() {
    const pageData = await getMarkdownData('privacyandterms')
    return {
        props: {
            pageData
        }
    }
}

export default function PrivacyAndTerms( { pageData } ) {
    return (
    <Layout>
        {pageData.title}
        <br />
        {pageData.date}
        <br />
        <div dangerouslySetInnerHTML={{ __html: pageData.contentHtml }} />
    </Layout>
    ) 
}