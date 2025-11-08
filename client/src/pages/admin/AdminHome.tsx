import AdminDashboard from "@/components/_admin/AdminDashboard";
import AdminHeader from "@/components/_admin/AdminHeader";

const AdminHome = () => {
  return (
    <div>
      <AdminHeader />
      <AdminDashboard />
      <h1>This is Admin</h1>
    </div>
  );
};

export default AdminHome;
