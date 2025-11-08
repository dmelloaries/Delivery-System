import { useNavigate } from "react-router-dom";
import { ComicText } from "../ui/comic-text";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/context/useUserStore";
import { User } from "lucide-react";

const PartnerHeader = () => {
  const navigate = useNavigate();
  const { logout } = useUserStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div>
      <span className="flex justify-between px-4 py-2">
        <ComicText className="text-xs ">D'mello</ComicText>

        <span className="flex gap-4 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-2xl cursor-pointer bg-purple-200 text-purple-600 hover:bg-purple-300 h-10 w-10 p-0 flex items-center justify-center">
              <User className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate("/PartnerOrders")}
              >
                My Orders Status
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

export default PartnerHeader;
