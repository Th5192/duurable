import Link  from 'next/link'
import { push as Menu } from 'react-burger-menu'

interface SidebarProps {
    pageWrapId:string
    outerContainerId:string
}

export default function Sidebar(props: SidebarProps) {
    return(
    <div>
        <Menu itemListElement='div' pageWrapId={props.pageWrapId} outerContainerId={props.outerContainerId}>
            <div>
                <Link href='/'><a>Home</a></Link>
            </div>
            <div>
                <Link href='/review-editor'><a>Create a review</a></Link>
            </div>
            <div>
                <Link href='/brand-directory'><a>Search for reviews</a></Link>
            </div>
        </Menu>
    </div>
    )
}
