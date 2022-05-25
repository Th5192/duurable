import Link  from 'next/link'
import { push as Menu } from 'react-burger-menu'

interface SidebarProps {
    pageWrapId:string
    outerContainerId:string
    isOpen: boolean
    handleStateChange:Function
    childToParent:Function
}

export default function Sidebar(props: SidebarProps) {
    return(
    <div>
        <Menu itemListElement='div' isOpen={props.isOpen} onStateChange={(state) => props.handleStateChange(state)} pageWrapId={props.pageWrapId} outerContainerId={props.outerContainerId}>
            <div>
                <Link href='/'><a onClick={() => props.childToParent()}>Home</a></Link>
            </div>
            <div>
                <Link href='/review-editor'><a onClick={() => props.childToParent()}>Create a review</a></Link>
            </div>
            <div>
                <Link href='/brand-directory'><a onClick={() => props.childToParent()}>Search for reviews</a></Link>
            </div>
        </Menu>
    </div>
    )
}


