import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getUserProfile } from "../../Server/server"
import FullScreenLoader from "../../Components/Loaders/FullScreenLoader"
import FarmerProfile from "./FarmerProfile"
import BuyerProfile from "./BuyerProfile"
import TransporterProfile from "./TransporterProfile"

export default function UserProfile(){
    const {id} = useParams()
    const [userDetails, setUserDetails] = useState(undefined)
    useEffect(() => {
       (async () => {
            const userInfo = await getUserProfile(id)
            setUserDetails(userInfo)
            console.log(userInfo)
       })()
    },[])
    if(userDetails === undefined) return <FullScreenLoader/>
    return (
        <section className="user-profile">
            {userDetails?.userType === "farmer" && <FarmerProfile userDetails={userDetails}/> }
            {userDetails?.userType === "buyer" && <BuyerProfile userDetails={userDetails}/>}
            {userDetails?.userType === "transporter" && <TransporterProfile userDetails={userDetails}/>}
        </section>
    )
}