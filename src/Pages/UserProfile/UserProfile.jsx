import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getUserProfile } from "../../Server/server"

export default function UserProfile(){
    const {id} = useParams()
    const [userDetails, setUserDetails] = useState(undefined)
    useEffect(() => {
       (async () => {
            const userInfo = await getUserProfile(id)
            setUserDetails(userInfo)
            console.log(userDetails)
       })()
    },[])
    return (
        <section className="user-profile">
            <h1>
                Hi 
            </h1>
        </section>
    )
}