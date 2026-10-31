import { useEffect, useState } from "react"
import { useParams,useNavigate } from "react-router-dom"
import CropsFusySearchBar from "../../Components/fuseSearch/CropsFusySearchBar";
import { getFarmers, getTransportersByVehicleTypes, getUserProfile, placeOrder} from "../../Server/server";
import { cropsDetails, transportDetails } from "../../Server/crops";
import FullScreenLoader from "../../Components/Loaders/FullScreenLoader";

export default function MakeOrder(){
	const {id} = useParams()
    const [farmers,setFarmers] = useState(undefined)
    const [buyer,setBuyer] = useState(undefined)
    const [step,setStep] = useState(1)
    const [selectedCrop,setSelectedCrop] = useState("")
    const [selectedFarmer,setSelectedFarmer] = useState(undefined)
    const [quantity,setQuantity] = useState(undefined)
    const [transporters,setTransporters] = useState(undefined)
    const [selectedTransporter,setSelectedTransporter] = useState(undefined)
    const [isLoading,setIsLoading] = useState(false)
    const navigate = useNavigate()
    

    useEffect(() => {
        getFarmers().then((far) => {
            setFarmers(far)
        }).catch((error) => {
            console.error(error)
        })
    },[])
    
    useEffect(() => {
        getUserProfile(id).then((profile) => {
        	if(profile.userType !== "buyer"){
        		setBuyer(null)
        		return
        	}
            setBuyer(profile)
        }).catch((error) => {
            console.error(error)
        })
    },[id])

    useEffect(() => {
        if(step !== 3) return
        const vehicleTypes = transportDetails[selectedCrop]?.find(dets => dets.from <= quantity && dets.to >= quantity)?.["vehicles"]
        getTransportersByVehicleTypes(vehicleTypes).then((trans) => setTransporters(trans)).catch(console.error)

    },[step])
    
    const handleSubmit = async () => {
    	const orderObject = {
    		buyer,
    		crop:selectedCrop,
    		farmer:selectedFarmer,
    		quantity,
    		farmerCost:500,
    		transporter:selectedTransporter,
    		transportCost:500,
    		totalCost:10000
    	}
    	
    	try{
    		setIsLoading(true)
    		const orderId = await placeOrder(orderObject)
    		navigate("/buyer-order-view/" + orderId)
    	}
    	
    	catch (err) {
    		console.error(err)
    	}finally {
    		setIsLoading(false)
    	}
    	
    }


    const handleNextStep = () => {
        if(step === 1){
            setStep(2)
            return
        }
        if(step === 2){
            setStep(3)
            return
        }
        if(step === 3){
            setStep(4)
            return
        }
    }
    const handleBackStep = () => {
        if(step === 4){
            setStep(3)
            return
        }
        if(step === 3){
            setStep(2)
            return
        }
        if(step === 2){
            setStep(1)
            return
        }
    }

    const filteredFarmers =  farmers?.filter(farmer => farmer.crop === selectedCrop)
    return (
        <section>
            <h1>
                Create New Order
            </h1>
            {step === 1 && <>
            
                <div className="search">
                    <CropsFusySearchBar
                        onSelect={(item) => {
                            setSelectedCrop(item)
                            setQuantity(cropsDetails[item].min)
                        }}
                    />
                </div>
                {
                    selectedCrop && <div className="farmer-choice">
                    {
                        filteredFarmers?.map(farmer => (
                            <div onClick={(e) => {
                                setSelectedFarmer(farmer)
                                handleNextStep()
                            }}>
                                <div>
                                    <strong>
                                        {farmer.nameOfFarm}
                                    </strong>
                                </div>
                                <div>
                                    <span>
                                        Qty:
                                    </span>
                                    <span>
                                        {farmer.quantityAvailable}
                                    </span>
                                </div>
                            </div>
                        ))
                    }
                    </div>
                }
            </>
            }
            {
                step === 2 && <>
                    {selectedFarmer && <>
                        <h2>{selectedFarmer.nameOfFarm}</h2>
                        <p>Crop : {selectedCrop}</p>
                        <input 
                            type="number" 
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min={cropsDetails[selectedCrop].min} 
                        />
                        <span>{cropsDetails[selectedCrop].unit}</span>
                        <div>
                            <p>R {quantity * 10}</p>
                        </div>
                        <div className="actions">
                            <button onClick={handleBackStep}>back</button>
                            <button onClick={handleNextStep}>next</button>
                        </div>

                    </>}
                </>
            }
            {
                step === 3 && <>
                    <h3>
                        transportation
                    </h3>
                    {transporters && (
                        <div className="transporters">
                            {transporters?.map(trans => (
                                <div onClick= {(e) => {
                                	setSelectedTransporter(trans)
                                	handleNextStep()
                                }}>
                                    <strong>{trans.nameOfTransporter}</strong>
                                    <span>{trans.typeOfVehicle}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="actions">
                        <button onClick={handleBackStep}>back</button>
                    </div>

                </>
            }
            {
                step === 4 && <>
                    <h3>
                        final review
                    </h3>
                    <div>
                        <strong>Crop:</strong>
                        <span>{selectedCrop}</span>

                    </div>
                    <div>
                        <strong>
                            Qty:
                        </strong>
                        <span>
                            {quantity}
                        </span>
                    </div>
                    <div>
                        <strong>
                            Farmer:
                        </strong>
                        <span>
                            {selectedFarmer.nameOfFarm}
                        </span>
                    </div>
                    <div>
                        <strong>Transporter:</strong>
                        <span>
                            {selectedTransporter.nameOfTransporter}
                        </span>
                    </div>
                    <div>
                        <strong>total cost</strong>
                        <span>
                            R10000.00
                        </span>
                    </div>
                    <div className="actions">
                        <button onClick={handleBackStep}>back</button>
                        <button onClick={handleSubmit}>place order</button>
                    </div>
                </>
            }
            {isLoading && <FullScreenLoader/>}
        </section>
    )
}
