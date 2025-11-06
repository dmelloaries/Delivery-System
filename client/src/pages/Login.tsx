import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Building2, Lock } from "lucide-react";
import { useUserStore, type UserType } from "@/context/useUserStore";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function Login() {
  const navigate = useNavigate();
  const { setUserType: setStoreUserType, setToken: setStoreToken } =
    useUserStore();
  const [userType, setUserType] = useState("user");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Determine the correct API endpoint based on userType
      let endpoint = "";
      if (userType === "user") {
        endpoint = `${backendUrl}/api/users/login`;
      } else if (userType === "partner") {
        endpoint = `${backendUrl}/api/partners/login`;
      } else if (userType === "admin") {
        endpoint = `${backendUrl}/api/admin/login`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);

      // Determine user role from response
      let role: UserType = "user";
      if (data.admin) {
        role = "admin";
      } else if (data.partner) {
        role = "partner";
      } else if (data.user) {
        role = "user";
      }

      // Update Zustand store
      setStoreToken(data.token);
      setStoreUserType(role);

      // Navigate to appropriate dashboard
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "partner") {
        navigate("/partner");
      } else {
        navigate("/user");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const userTypes = [
    {
      id: "user",
      label: "user",
      icon: User,
      description: "Access your account",
    },
    {
      id: "partner",
      label: "Partner",
      icon: Building2,
      description: "Partner portal",
    },
    {
      id: "admin",
      label: "Admin",
      icon: Lock,
      description: "Admin dashboard",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border border-purple-100">
        <CardHeader className="space-y-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isSignUp
                ? "Choose your role and register"
                : "Choose your role and sign in"}
            </CardDescription>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 ">
            {userTypes.map((type) => {
              const Icon = type.icon;
              const isActive = userType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setUserType(type.id)}
                  className={`flex flex-col items-center gap-2 p-3 cursor-pointer rounded-lg transition-all ${
                    isActive
                      ? "bg-purple-200 text-purple-900 shadow-md"
                      : "bg-gray-50 text-gray-600 hover:bg-purple-50"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="test@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="border-gray-200 focus:border-purple-300 focus:ring-purple-200"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              {!isSignUp && (
                <a className="text-sm text-purple-600 cursor-pointer hover:text-purple-700 underline-offset-2 hover:underline">
                  Forgot password?
                </a>
              )}
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              placeholder="test@gmail.com"
              onChange={handleInputChange}
              required
              className="border-gray-200 focus:border-purple-300 focus:ring-purple-200"
            />
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="border-gray-200 focus:border-purple-300 focus:ring-purple-200"
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {error && (
            <div className="w-full p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </Button>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setFormData({ email: "", password: "", confirmPassword: "" });
              }}
              className="text-purple-600 font-semibold hover:text-purple-700 underline-offset-2 hover:underline"
            >
              {isSignUp ? "Sign In" : "Register"}
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
