import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom"
import { logOut, getOrderByBuyerId} from "../../Server/server"
import "./BuyerProfile.css"

export default function BuyerProfile({userDetails}){
	const [orders, setOrders] = useState(undefined)
    const navigate =  useNavigate()
    
    useEffect(() => {
  		if(!userDetails?.id) return
        getOrderByBuyerId(userDetails.id).then((ord) => {
		    	setOrders(ord)
		}).catch(console.error)
  	},[userDetails?.id])
    return (
        <div className="buyer-dashboard-container">
            {/* Corporate Profile Header */}
            <header className="buyer-header">
            <div className="company-meta">
                <span className="account-tag">{userDetails.type?.toUpperCase()} ACCOUNT</span>
                <h1>{userDetails.nameOfBuyer}</h1>
                <p className="contact-person">👤 Account Manager: <strong>{userDetails.nameOfContact}</strong></p>
            </div>
            
            <div className="verification-zone">
                <span className={`status-pill ${userDetails.approved ? "verified" : "review"}`}>
                {userDetails.approved ? "✓ Verified Buyer" : "⏳ Review Pending"}
                </span>
                <p className="buyer-email">{userDetails.email}</p>
            </div>
            </header>

            {/* Procurement & Terms Overview */}
            <main className="buyer-grid">
            {/* Contract Terms Tile */}
            <section className="buyer-tile terms-tile">
                <div className="tile-icon">📜</div>
                <div className="tile-content">
                <h3>Active Payment Terms</h3>
                <p className="tile-value">{userDetails.terms || "Standard"}</p>
                <span className="tile-subtext">Fixed trade credit duration</span>
                </div>
            </section>

            {/* Hotline / Logistics Tile */}
            <section className="buyer-tile contact-tile">
                <div className="tile-icon">📱</div>
                <div className="tile-content">
                <h3>Procurement Hotline</h3>
                <p className="tile-value">{userDetails.mobileNo}</p>
                <span className="tile-subtext">Authorized order confirmations</span>
                </div>
            </section>

            {/* Order Fulfillment Tracking (Simulated Core KPI) */}
            <section className="buyer-tile tracking-tile">
                <div className="tile-icon">📦</div>
                <div className="tile-content">
                <h3>Active Shipments</h3>
                <p className="tile-value">0 Open Orders</p>
                <span className="tile-subtext">Aggregated farm dispatch logs</span>
                </div>
            </section>
            </main>

            {/* Primary Buyer Workflows */}
            <footer className="buyer-actions">
            <button className="cta-primary">🔎 Browse Live Farm Yields</button>
            <button className="cta-primary" onClick={() => navigate("/make-order/" + userDetails.id)}>Make order</button>
            <button className="cta-secondary">📋 View Invoices & Statements</button>
            </footer>
            <div>
		    	<h2>
		    		Orders
		    	</h2>
		    	<div className="orders-container">
		    		{
		    			orders && (
		    				orders.map(order => 
		    				<div className={"order-item"} onClick={() => navigate("/buyer-order-view/" + order.id)}>
		    					<div>
		    						<strong>
		    							Order:
		    						</strong>
		    						<span>
		    							{order.id}
		    						</span>
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
