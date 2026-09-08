import { Link } from "react-router-dom";

export default function SignUp(){
    return (
        <section className="sign-up-page">
            <div className="container">
                <Link to={"/signUpFarmer"}>Farmer</Link>
                <Link to={"/signUpBuyer"}>Buyer</Link>

            </div>
            <p>if you have an account, log in <Link to={"/login"}>here</Link></p>
        </section>
    )
}