import { useEffect, useState } from "react"
import isValidEmail from "../../utils/validateEmail"
import { registerUserWithProfile } from "../../Server/server"
import { useNavigate } from "react-router-dom"
import getUserLocationWithFallback from "../../utils/getUserLocation"
import GoogleMap from "../../Components/GoogleMap/googleMap"

export default function SignUpTransportation(){
    const [step,setStep] = useState(1)
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [error,setError] = useState("")
    const [defaultCoords,setDefaultCoords] = useState(undefined)
    const navigate = useNavigate()
    const [formData,setFormData] = useState({
        nameOfTransporter:"",
        typeOfVehicle:"bakkie",
        nameOfContact:"",
        mobileNo:"",
        location:"",
        "coords":{},
    })

    useEffect(() => {
        getUserLocationWithFallback().then((loc) => {
            setDefaultCoords(loc)
        })
    },[])

    const handleChange = (eventTarget) => {
        const {name, value} = eventTarget
        setFormData(prev => ({
            ...prev,
            [name]:value
        }))
    }

    const handleNextStep = (e) => {
        setError("")
        e.preventDefault()
        if(step === 1){
            if(!isValidEmail(email)){
                setError("email is not valid")
                return
            }
            if(password.length < 6){
                setError("password should be 6 or more chars")
                return
            }
            setStep(2)
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

    const handleBackBtn = () => {
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

    const handleSubmit = async () => {
        try {
            const userId = await registerUserWithProfile(email,password,"transporter",formData)
            navigate("/userProfile/" + userId)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <section className="sign-up-buyer">
            <h1>Sign Up</h1>
            {step === 1 && 
                <div className="step">
                    <h2>log in details</h2>
                    <div className="form-group">
                        <label htmlFor="email">
                            email
                        </label>
                        <input 
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">
                            Password
                        </label>
                        <input 
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button onClick={handleNextStep}>
                        next
                    </button>
                    {error && <div>{error}</div>}
                </div>
            }
            {step === 2 && 
                <div className="step">
                    <h2>Tranporter Details</h2>
                    <div className="form-group">
                        <label htmlFor="nameOfTransporter">
                            name of entity
                        </label>
                        <input 
                            type="text"
                            value={formData.nameOfTransporter}
                            name="nameOfTransporter"
                            onChange={(e) => handleChange(e.target)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="type-of-vehicle">
                            Type of Vehicle
                        </label>
                        <select 
                            id="type-of-vehicle"
                            name="typeOfVehicle"
                            value={formData.typeOfVehicle} 
                            onChange={(e) => handleChange(e.target)}
                        >
                            <option value="bakkie">Bakkie</option>
                            <option value="truck">Truck</option>
                            <option value="refridgeratedTruck">Refridgerated Truck</option>
                        </select>
                    </div>
                    <div className="actions">
                        <button onClick={handleBackBtn}>
                            back
                        </button>
                        <button onClick={handleNextStep}>
                            next
                        </button>
                    </div>
                    {error && <div>{error}</div>}
                </div>
            }
            {step === 3 && 
                <div className="step">
                    <h2>Contact's details</h2>
                    <div className="form-group">
                        <label htmlFor="nameOfContact">
                            name of contact
                        </label>
                        <input 
                            type="text"
                            value={formData.nameOfContact}
                            name="nameOfContact"
                            onChange={(e) => handleChange(e.target)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="contact's-mobile-no">
                            Contact's Mobile no
                        </label>
                        <input 
                            type="text"
                            value={formData.mobileNo}
                            name="mobileNo"
                            onChange={(e) => handleChange(e.target)}
                            placeholder="e.g 0791234567"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="location">
                            location of entity
                        </label>
                        <input 
                            type="text"
                            value={formData.location}
                            name="location"
                            onChange={(e) => handleChange(e.target)}
                            placeholder="e.g groblesdal"
                        />
                    </div>
                    <div className="actions">
                        <button onClick={handleBackBtn}>
                            back
                        </button>
                        <button onClick={handleNextStep}>
                            next
                        </button>
                    </div>
                    {error && <div>{error}</div>}
                </div>
            }
            {step === 4   && 
                <div className="step">
                    <h2>Entity Location on Map</h2>
                    <GoogleMap
                        defaultPosition={defaultCoords}
                        onPositionChange={(loc) => handleChange({"name":"coords","value":loc})}
                    />
                    <div className="actions">
                        <button onClick={handleBackBtn}>
                            back
                        </button>
                        <button onClick={handleSubmit}>
                            submit
                        </button>
                    </div>
                    {error && <div>{error}</div>}
                </div>
            }
            
            
            
        </section>
    )
}
