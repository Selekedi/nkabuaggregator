import React, { useEffect, useState } from 'react';
import { useParams,useNavigate } from "react-router-dom"
import { logOut, getOrderByFarmerId} from "../../Server/server"
import { cropsDetails } from "../../Server/crops"

export default function FarmerProfile({userDetails}){
	const [orders, setOrders] = useState(undefined)
    const navigate = useNavigate()
	

	useEffect(() => {
  		if(!userDetails?.id) return
        getOrderByFarmerId(userDetails.id).then((ord) => {
		    	setOrders(ord)
		}).catch(console.error)
    },[userDetails?.id])

    return (
        <div className="farmer-dashboard-container">
                {/* Welcome & Account Status Block */}
                <header className="dashboard-header">
                <div className="welcome-meta">
                    <span className="greeting">Welcome Back,</span>
                    <h1>{userDetails.nameOfFarm}</h1>
                    <p className="location-text">📍 {userDetails.location}</p>
                </div>
                
                <div className="status-container">
                    <span className={`status-pill ${userDetails?.approved ? "approved" : "pending"}`}>
                    Account Status: {userDetails?.approved ? "Verified & Active" : "Verification Pending"}
                    </span>
                </div>
                </header>

                {/* Primary Metric Grid */}
                <main className="dashboard-grid">
                {/* Contact Profile Tile */}
                <section className="info-tile">
                    <div className="tile-icon">📞</div>
                    <div className="tile-content">
                    <h3>Registered Contact</h3>
                    <p className="tile-value">{userDetails.mobileNo}</p>
                    <button className="text-action-btn">Update Number</button>
                    </div>
                </section>

                {/* NEW: Crop & Quantity Tile */}
                <section className="info-tile crop-highlight-tile">
                    <div className="tile-icon">🌱</div>
                    <div className="tile-content">
                    <h3>Active Produce</h3>
                    <p className="tile-value">
                        {userDetails.crop} <span className="qty-badge">{userDetails.quantityAvailable || "0"} {cropsDetails[userDetails.crop].unit}</span>
                    </p>
                    <button className="text-action-btn">Update Crop or Volume</button>
                    </div>
                </section>

                {/* Timeline/Harvest Tile */}
                <section className="info-tile alert-tile">
                    <div className="tile-icon">📅</div>
                    <div className="tile-content">
                    <h3>Target Harvest Date</h3>
                    <p className="tile-value">{userDetails.harvestDate}</p>
                    <button className="primary-action-btn">Reschedule</button>
                    </div>
                </section>
                </main>

                <footer className="dashboard-footer">
                <button className="secondary-btn">📄 View Supply Contracts</button>
                <button className="secondary-btn">🚜 Request Transport Pickup</button>
                </footer>
                <div>
					<h2>
						Orders
					</h2>
					<div className="orders-container">
						{
							orders && (
								orders.map(order => 
								<div className={"order-item"} onClick={() => navigate("/farmer-order-view/" + order.id)}>
									<div>
										<strong>
											Order:
										</strong>
										<span>
											{order.id}
										</span>
									</div>
									<div>
										{!(order.farmerApproval === true) ? <span>
												action needed </span>:
												<span>
													{order.status}
												</span>
											
										}
									</div>
								</div>
								)
							)
						}
					</div>
				</div>
                <button onClick={logOut}>Log Out</button>
            </div>
    )
}
