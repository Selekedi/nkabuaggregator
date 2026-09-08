import { Navigate } from "react-router-dom";

export default function RootRedirect({ user }) {
  // If user somehow bypasses ProtectedRoute but isn't logged in, send to signup
  if (!user) return <Navigate to="/login" replace />;
  
  // Dynamically redirect them to their specific profile ID URL
  return <Navigate to={`/userProfile/${user.uid}`} replace />;
}
