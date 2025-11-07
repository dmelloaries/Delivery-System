import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Landing from "./pages/LandingPage";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminHome from "./pages/admin/AdminHome";
import UserHome from "./pages/user/UserHome";
import PartnerHome from "./pages/partner/PartnerHome";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Role-based Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]} element={<AdminHome />} />
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={["user"]} element={<UserHome />} />
          }
        />
        <Route
          path="/partner"
          element={
            <ProtectedRoute
              allowedRoles={["partner"]}
              element={<PartnerHome />}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
