import { useUserStore } from "@/context/useUserStore";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  fullname:
    | {
        firstname: string;
        lastname: string;
      }
    | string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  socketId?: string | null;
}

interface UsersResponse {
  users: User[];
  totalPages: number;
  currentPage: string;
  total: number;
}

const UsersList = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { token } = useUserStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${backendUrl}/api/admin/users?page=${currentPage}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data: UsersResponse = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getUserFullName = (fullname: User["fullname"]) => {
    if (typeof fullname === "string") {
      return fullname;
    }
    return `${fullname.firstname} ${fullname.lastname}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-purple-600">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/adminHome")}
        className="mb-4 flex items-center gap-2 cursor-pointer mt-3 hover:bg-purple-200/30"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Button>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Users List</h1>
        <p className="text-gray-600">
          Total Users:{" "}
          <span className="font-semibold text-purple-600">{total}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card
            key={user._id}
            className="hover:shadow-lg transition-shadow duration-300 border-purple-100"
          >
            <CardHeader className="bg-linear-to-r from-purple-50 to-purple-100">
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-800">
                  {getUserFullName(user.fullname)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-800 break-all">
                    {user.email}
                  </p>
                </div>
                {user.socketId && (
                  <div>
                    <p className="text-sm text-gray-500">Connection Status</p>
                    <p className="text-sm font-medium text-green-700">Online</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Joined</p>
                    <p className="text-xs font-medium text-gray-700">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Updated</p>
                    <p className="text-xs font-medium text-gray-700">
                      {formatDate(user.updatedAt)}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-purple-100">
                  <p className="text-xs text-gray-400">ID: {user._id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No users found</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-purple-200 text-purple-800 rounded-md hover:bg-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-purple-200 text-purple-800 rounded-md hover:bg-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersList;
