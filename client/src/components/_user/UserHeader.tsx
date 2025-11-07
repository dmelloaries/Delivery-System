import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react";
import { ComicText } from "../ui/comic-text";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/context/useUserStore";

const UserHeader = () => {
  const navigate = useNavigate();
  const { logout } = useUserStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCartClick = () => {
    navigate("/UserCart");
  };

  return (
    <div>
      <span className="flex justify-between px-4 py-2">
        <ComicText className="text-xs ">D'mello</ComicText>

        <span className="flex gap-4 items-center">
          <Button
            onClick={handleCartClick}
            className="cursor-pointer bg-purple-200 text-purple-600 hover:bg-purple-300 h-10 w-10 p-0 flex items-center justify-center"
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-2xl cursor-pointer bg-purple-200 text-purple-600 hover:bg-purple-300 h-10 w-10 p-0 flex items-center justify-center">
              <User className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate("/UserOrders")}
              >
                My Orders
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-600  "
                onClick={handleLogout}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      </span>
      <hr></hr>
    </div>
  );
};

export default UserHeader;
