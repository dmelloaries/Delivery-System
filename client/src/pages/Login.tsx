import { useState } from "react";
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

export default function Login() {
  const [userType, setUserType] = useState("customer");
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log({
      userType,
      isSignUp,
      ...formData,
    });
  };

  const userTypes = [
    {
      id: "customer",
      label: "Customer",
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
          <Button
            onClick={handleSubmit}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
          >
            {isSignUp ? "Create Account" : "Sign In"}
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
