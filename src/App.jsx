import { HashRouter as Router, Routes, Route } from "react-router-dom"
import SignUp from "./Pages/SignUp/SignUp"
import UserProfile from "./Pages/UserProfile/UserProfile"
import SignUpFarmer from "./Pages/SignUp/SignUpFarmer"
import SignUpBuyer from "./Pages/SignUp/SignUpBuyer"
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./services/firebaseConfig"
import SplashScreen from "./Components/Loaders/SplashScreen"
import ProtectedRoute from "./utils/ProtectedRoute"
import RootRedirect from "./utils/RootRedirect"
import LogIn from "./Pages/Login/Login"

function App() {
  const [user,setUser] = useState(undefined)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth,(currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  },[])

  if(user === undefined) return <SplashScreen/>

  return (
    <Router>
      <Routes>
        <Route path="/signUp" element={<SignUp/>} />
        <Route path="/signUpFarmer" element={<SignUpFarmer/>}/>
        <Route path="/signUpBuyer" element={<SignUpBuyer/>}/>
        <Route path="/login" element={<LogIn/>}/>
        <Route element={<ProtectedRoute user={user}/>}>
          <Route path="/userProfile/:id" element={<UserProfile/>}/>
          <Route path="/" element={<RootRedirect user={user}/>}/>
        </Route>
        
      </Routes>
    </Router>
  )
}

export default App
