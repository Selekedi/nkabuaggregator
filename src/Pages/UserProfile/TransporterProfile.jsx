// ProfileCard.jsx
import React, { useEffect, useState } from 'react';
import { useParams,useNavigate } from "react-router-dom"
import './TransporterProfile.css';
import { logOut, getOrderByTransporterId } from '../../Server/server';

export default function TransporterProfile({userDetails}) {
  // Parsing your specific backend data sample into component state
  const [orders, setOrders] = useState(undefined)
  const navigate = useNavigate()
  
  useEffect(() => {
  		if(!userDetails?.id) return
        getOrderByTransporterId(userDetails.id).then((ord) => {
		    	setOrders(ord)
		}).catch(console.error)
  },[userDetails?.id])

  return (
    <div class="profile-container">
      {/* Visual Accent Banner */}
      <div class="profile-banner">
        <span class={`status-badge ${userDetails.approved ? 'approved' : ''}`}>
          {userDetails.approved ? '● Active Approved' : '⚠️ Pending Vet'}
        </span>
      </div>

      {/* Identity Row Elements */}
      <div class="profile-avatar-wrapper">
        <div class="profile-avatar">
          {userDetails.nameOfTransporter.charAt(0)}
        </div>
        <span class="usertype-tag">{userDetails.userType}</span>
      </div>

      <div class="profile-body">
        <h2 class="profile-title">{userDetails.nameOfTransport}</h2>
        <p class="profile-subtitle">📍 Hub: <span style={{ textTransform: 'capitalize' }}>{userDetails.location}</span></p>

        {/* Contact Group */}
        <div class="info-section">
          <div class="section-label">Account Contact</div>
          <div class="info-row">
            <span class="info-label">Assigned Rep</span>
            <span class="info-value">{userDetails.nameOfContact}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Mobile</span>
            <span class="info-value"><a href={`tel:${userDetails.mobileNo}`}>{userDetails.mobileNo}</a></span>
          </div>
          <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-value"><a href={`mailto:${userDetails.email}`}>{userDetails.email}</a></span>
          </div>
        </div>

        {/* Logistics Operations Group */}
        <div class="info-section">
          <div class="section-label">Logistics & Fleet</div>
          <div class="info-row">
            <span class="info-label">Primary Vehicle</span>
            <span class="info-value" style={{ textTransform: 'capitalize' }}>🛻 {userDetails.typeOfVehicle}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Fleet Name</span>
            <span class="info-value">
              {userDetails.nameOfTransport || <span class="italic-placeholder">Individual Operator</span>}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Geo-Coordinates</span>
            <span class="info-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
              {userDetails.coords.lat.toFixed(4)}, {userDetails.coords.lng.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Actions Contextual to Status */}
        <div>
        	<h2>
        		Orders
        	</h2>
        	<div className="orders-container">
        		{
        			orders && (
        				orders.map(order => 
        				<div className={"order-item"} onClick={() => navigate("/transporter-order-view/" + order.id)}>
        					<div>
        						<strong>
        							Order:
        						</strong>
        						<span>
        							{order.id}
        						</span>
        					</div>
        					<div>
        						{!(order.transporterApproval === true) ? <span>
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
        
        <div>
          <button onClick={logOut}>
            log out
          </button>
        </div>
      </div>
    </div>
  );
}

