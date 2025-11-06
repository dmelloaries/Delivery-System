import { create } from "zustand";

export type UserType = "admin" | "partner" | "user" | "loggedout";

interface UserState {
  userType: UserType;
  token: string | null;
  setUserType: (type: UserType) => void;
  setToken: (token: string | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  userType: "loggedout",
  token: null,
  setUserType: (type) => set({ userType: type }),
  setToken: (token) => set({ token }),
}));
