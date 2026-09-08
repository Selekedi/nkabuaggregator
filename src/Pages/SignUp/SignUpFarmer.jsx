import { useState } from "react"
import isValidEmail from "../../utils/validateEmail"
import "./SignUp.css"
import { registerUserWithProfile } from "../../Server/server"
import { useNavigate } from "react-router-dom"

export default function SignUpFarmer(){
    const [step,setStep] = useState(1)
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [error,setError] = useState("")
    const [formData,setFormData] = useState({
        nameOfFarm:"",
        mobileNo:"",
        location:"",
        crop:"",
        harvestDate:"",
        quantityAvailable:""
    })
    const navigate = useNavigate()

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
    }

    const handleBackBtn = () => {
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
            const userId = await registerUserWithProfile(email,password,"farmer",formData)
            navigate("/userProfile/" + userId)
        } catch (error) {
            console.error(error)
        }
    }
    
    return (
        <div className="sign-up-page">
            <h1>Sign Up</h1>
            {step === 1 && 
            <div>
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
                    Next
                </button>
                {error && <div>{error}</div>}
            </div>
            }
            {
                step === 2 && 
                <div>
                    <div className="form-group">
                        <label>Name of Farm or Of Farmer</label>
                        <input type="text" placeholder="Enter name" name="nameOfFarm" value={formData.nameOfFarm} onChange={(e) => handleChange(e.target)}/>
                    </div>
                    <div className="form-group">
                        <label>Mobile Number</label>
                        <input type="text" placeholder="Enter Mobile Number" name="mobileNo" value={formData.mobileNo} onChange={(e) => handleChange(e.target)}/>
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <input type="text" placeholder="Enter Location" name="location" value={formData.location} onChange={(e) => handleChange(e.target)}/>
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
            {
                step === 3 && 
                <div>
                    <div className="form-group">
                        <label>Crop</label>
                        <input type="text" placeholder="Enter Crop" name="crop" value={formData.crop} onChange={(e) => handleChange(e.target)}/>
                    </div>
                    <div className="form-group">
                        <label>Harvest Date</label>
                        <input type="date" name="harvestDate" value={formData.harvestDate} onChange={(e) => handleChange(e.target)}/>
                    </div>
                    <div className="form-group">
                        <label>Quantity Available</label>
                        <input type="text" placeholder="Enter Quantity Available" value={formData.quantityAvailable} name="quantityAvailable" onChange={(e) => handleChange(e.target)}/>
                    </div>
                    <div className="actions">
                        <button onClick={handleBackBtn}>
                            back
                        </button>
                        <button onClick={handleSubmit}>submit</button>
                    </div>
                    {error && <div>{error}</div>}
                </div>
            }                      

        </div>
    )
}
