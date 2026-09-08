import { useState } from "react"
import isValidEmail from "../../utils/validateEmail"
import { registerUserWithProfile } from "../../Server/server"
import { useNavigate } from "react-router-dom"

export default function SignUpBuyer(){
    const [step,setStep] = useState(1)
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [error,setError] = useState("")
    const navigate = useNavigate()
    const [formData,setFormData] = useState({
        nameOfBuyer:"",
        type:"",
        nameOfContact:"",
        mobileNo:"",
        terms:"",
    })

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
            const userId = await registerUserWithProfile(email,password,"buyer",formData)
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
                    <h2>Buyer Details</h2>
                    <div className="form-group">
                        <label htmlFor="nameOfBuyer">
                            name of entity
                        </label>
                        <input 
                            type="text"
                            value={formData.nameOfBuyer}
                            name="nameOfBuyer"
                            onChange={(e) => handleChange(e.target)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="type">
                            Type of Entity 
                        </label>
                        <input 
                            type="text"
                            value={formData.type}
                            name="type"
                            onChange={(e) => handleChange(e.target)}
                            placeholder="e.g retail / wholesale .etc"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="terms">
                            terms
                        </label>
                        <input 
                            type="text"
                            value={formData.terms}
                            name="terms"
                            onChange={(e) => handleChange(e.target)}
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
