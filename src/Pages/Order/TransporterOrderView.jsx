import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getOrderById, updateOrderById} from "../../Server/server";

export default function TransporterOrderView(){
	const { id } = useParams()
	const [order,setOrder] = useState(undefined)
	
	useEffect(() => {
        getOrderById(id).then((ord) => {
        	setOrder(ord)
        }).catch(console.error)
    },[id])
    
    const acceptOffer = async () => {
    	try {
    		await updateOrderById(id,"transporterApproval",true)
    		console.log("done")
    	} catch (error) {
    		console.error(error)
    	}
    }
    
    const denyOffer = async () => {
    	try {
    		await updateOrderById(id,"transporterApproval",false)
    	} catch (error) {
    		console.error(error)
    	}
    }
	
	return (
		<section>
			<h1>Order View</h1>
			{order && <div>
				<h3>{order.crop}</h3>
				<div className="data">
					<div>
						<span>qty:</span>
						<span>{order.quantity}</span>
					</div>
					<div>
						<span>Cost:</span>
						<span>{order.transportCost}</span>
					</div>
				</div>

				<div>
					{ order.transporterApproval === "pending" && (<>
						<button onClick={acceptOffer}>Accept Offer</button>
						<button onClick={denyOffer}>Deny Offer</button>
						</>
					)}
				</div>
			</div>}
		</section>
	)
}
