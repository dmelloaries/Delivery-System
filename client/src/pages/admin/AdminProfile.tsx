import { HyperText } from "@/components/ui/hyper-text";
import { useUserStore } from "@/context/useUserStore";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminHeader from "@/components/_admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminData {
  fullname: {
    firstname: string;
    lastname: string;
  };
  email: string;
  role: string;
}

const AdminProfile = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { token } = useUserStore();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/admin/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch admin profile");
        }

        const data = await response.json();
        setAdminData(data.admin);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAdminProfile();
    }
  }, [backendUrl, token]);

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-purple-50">
      <AdminHeader />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Title */}
        <Button
          variant="ghost"
          onClick={() => navigate("/adminHome")}
          className="mb-4 flex items-center gap-2 cursor-pointer hover:bg-purple-200/30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
        <div className="mb-8">
          <HyperText className="text-4xl font-bold text-gray-800 mb-2">
            Admin Profile
          </HyperText>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-8">
              <div className="text-center text-red-600">
                <svg
                  className="mx-auto h-12 w-12 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-lg font-semibold">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : adminData ? (
          <div className="space-y-6">
            {/* Profile Overview Card */}
            <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-linear-to-r from-purple-100 to-purple-50 border-b border-purple-200">
                <CardTitle className="text-2xl text-purple-900">
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Name Section */}
                <div className="flex items-start space-x-4 p-4 rounded-lg bg-purple-50 border border-purple-100">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-purple-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="grow">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                      Full Name
                    </h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {adminData.fullname.firstname}{" "}
                      {adminData.fullname.lastname}
                    </p>
                  </div>
                </div>

                {/* Email Section */}
                <div className="flex items-start space-x-4 p-4 rounded-lg bg-purple-50 border border-purple-100">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-purple-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="grow">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                      Email Address
                    </h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {adminData.email}
                    </p>
                  </div>
                </div>

                {/* Role Section */}
                <div className="flex items-start space-x-4 p-4 rounded-lg bg-purple-50 border border-purple-100">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-purple-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="grow">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                      Role
                    </h3>
                    <p className="text-lg font-semibold text-gray-900">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-200 text-purple-800">
                        {adminData.role.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdminProfile;
