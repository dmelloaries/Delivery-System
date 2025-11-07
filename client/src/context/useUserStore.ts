import { create } from "zustand";

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

export const useUserStore = create<UserState>((set) => ({
  userType: "loggedout",
  token: null,
  userData: null,
  setUserType: (type) => set({ userType: type }),
  setToken: (token) => set({ token }),
  setUserData: (userData) => set({ userData }),
  logout: () => set({ userType: "loggedout", token: null, userData: null }),
}));
