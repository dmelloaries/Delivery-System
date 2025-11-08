import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/LandingPage";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminHome from "./pages/admin/AdminHome";
import UserHome from "./pages/user/UserHome";
import PartnerHome from "./pages/partner/PartnerHome";
import Register from "./pages/Register";
import UserCart from "./pages/user/UserCart";
import UserOrders from "./pages/user/UserOrders";
import AdminProfile from "./pages/admin/AdminProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Role-based Protected Routes */}
        <Route
          path="/adminHome"
          element={
            <ProtectedRoute allowedRoles={["admin"]} element={<AdminHome />} />
          }
        />
        <Route
          path="/AdminProfile"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
              element={<AdminProfile />}
            />
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={["user"]} element={<UserHome />} />
          }
        />
        <Route
          path="/UserOrders"
          element={
            <ProtectedRoute allowedRoles={["user"]} element={<UserOrders />} />
          }
        />
        <Route
          path="/UserCart"
          element={
            <ProtectedRoute allowedRoles={["user"]} element={<UserCart />} />
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
