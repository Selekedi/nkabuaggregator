import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getOrderById} from "../../Server/server";

export default function BuyerOrderView(){
	const { id } = useParams()
	const [order,setOrder] = useState(undefined)
	
	useEffect(() => {
        getOrderById(id).then((ord) => {
        	setOrder(ord)
        }).catch(console.error)
    },[id])
	
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
						<span>total cost:</span>
						<span>{order.totalCost}</span>
					</div>
				</div>
				<div className="verfications">
					<div>
						<span>
							farmer accept order:
						</span>
						<span>
							{order.farmerApproval}
						</span>
					</div>
					<div>
						<span>
							Transporter accept order:
						</span>
						<span>
							{order.transporterApproval}
						</span>
					</div>
				</div>
				<div>
					<button disabled={!(order.farmerApproval === true && order.transporterApproval === true)}>Pay for Order</button>
				</div>
			</div>}
		</section>
	)
}
