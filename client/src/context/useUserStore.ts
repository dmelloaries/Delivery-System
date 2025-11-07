import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserType = "admin" | "partner" | "user" | "loggedout";

interface UserData {
  _id: string;
  email: string;
  firstname: string;
  lastname: string;
}

interface UserState {
  userType: UserType;
  token: string | null;
  userData: UserData | null;
  setUserType: (type: UserType) => void;
  setToken: (token: string | null) => void;
  setUserData: (userData: UserData | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userType: "loggedout",
      token: null,
      userData: null,
      setUserType: (type) => set({ userType: type }),
      setToken: (token) => set({ token }),
      setUserData: (userData) => set({ userData }),
      logout: () => {
        localStorage.removeItem("token");
        set({ userType: "loggedout", token: null, userData: null });
      },
    }),
    {
      name: "user-storage", // name of the item in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
