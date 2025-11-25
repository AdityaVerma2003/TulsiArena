import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // Assuming you store role in localStorage
  
  // Check if user is logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if admin access is required
  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default ProtectedRoute;