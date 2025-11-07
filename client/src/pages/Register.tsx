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
import { User, Building2 } from "lucide-react";
import { useUserStore, type UserType } from "@/context/useUserStore";
import { z } from "zod";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Zod validation schema
const registerSchema = z
  .object({
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { setUserType: setStoreUserType, setToken: setStoreToken, setUserData: setStoreUserData } =
    useUserStore();
  const [userType, setUserType] = useState<"user" | "partner">("user");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (validationErrors[name as keyof RegisterFormData]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});

    // Validate form data with Zod
    const validation = registerSchema.safeParse(formData);

    if (!validation.success) {
      const errors: Partial<Record<keyof RegisterFormData, string>> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as keyof RegisterFormData] = err.message;
        }
      });
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      // Determine the correct API endpoint based on userType
      const endpoint =
        userType === "user"
          ? `${backendUrl}/api/users/register`
          : `${backendUrl}/api/partners/register`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: {
            firstname: formData.firstname,
            lastname: formData.lastname,
          },
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);

      // Determine user role from response
      let role: UserType = "user";
      let userData = null;

      if (data.partner) {
        role = "partner";
        userData = {
          _id: data.partner._id,
          email: data.partner.email,
          firstname: data.partner.fullname?.firstname || "",
          lastname: data.partner.fullname?.lastname || "",
        };
      } else if (data.user) {
        role = "user";
        userData = {
          _id: data.user._id,
          email: data.user.email,
          firstname: data.user.fullname?.firstname || "",
          lastname: data.user.fullname?.lastname || "",
        };
      }

      // Update Zustand store
      setStoreToken(data.token);
      setStoreUserType(role);
      setStoreUserData(userData);

      // Navigate to appropriate dashboard
      if (role === "partner") {
        navigate("/partner");
      } else {
        navigate("/user");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const userTypes = [
    {
      id: "user" as const,
      label: "User",
      icon: User,
      description: "Create user account",
    },
    {
      id: "partner" as const,
      label: "Partner",
      icon: Building2,
      description: "Partner registration",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border border-purple-100">
        <CardHeader className="space-y-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Choose your role and register
            </CardDescription>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
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

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstname" className="text-gray-700">
                First Name
              </Label>
              <Input
                id="firstname"
                name="firstname"
                type="text"
                placeholder="Aries"
                value={formData.firstname}
                onChange={handleInputChange}
                required
                className="border-gray-200 focus:border-purple-300 focus:ring-purple-200"
              />
              {validationErrors.firstname && (
                <p className="text-xs text-red-600">
                  {validationErrors.firstname}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastname" className="text-gray-700">
                Last Name
              </Label>
              <Input
                id="lastname"
                name="lastname"
                type="text"
                placeholder="Dmello"
                value={formData.lastname}
                onChange={handleInputChange}
                required
                className="border-gray-200 focus:border-purple-300 focus:ring-purple-200"
              />
              {validationErrors.lastname && (
                <p className="text-xs text-red-600">
                  {validationErrors.lastname}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="dmelloaries@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="border-gray-200 focus:border-purple-300 focus:ring-purple-200"
            />
            {validationErrors.email && (
              <p className="text-xs text-red-600">{validationErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="border-gray-200 focus:border-purple-300 focus:ring-purple-200"
            />
            {validationErrors.password && (
              <p className="text-xs text-red-600">
                {validationErrors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-700">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="border-gray-200 focus:border-purple-300 focus:ring-purple-200"
            />
            {validationErrors.confirmPassword && (
              <p className="text-xs text-red-600">
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>
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
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            Already have an account?
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-purple-600 cursor-pointer font-semibold hover:text-purple-700 underline-offset-2 hover:underline"
            >
              Sign In
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
