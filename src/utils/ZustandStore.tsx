import { create } from "zustand";
import supabase from "./supabase";
import { persist, createJSONStorage } from "zustand/middleware";
import { ActiveUser, Trees } from "./interfaces";

interface UserStoreState {
  activeUser: ActiveUser | null;
  trees: Trees[];
  setActiveUser: (userId: string) => Promise<void>;
  fetchUserTrees: (userId: string) => Promise<void>;
}

const userStore = create<UserStoreState>()(
  persist(
    (set) => ({
      activeUser: null,
      trees: [],
      setActiveUser: async (userId: string) => {
        const { data, error } = await supabase
          .from('Users')
          .select("*")
          .eq('id', userId)
          .single();
        if (error) {
          console.error("Error fetching user:", error);
          return;
        }
        if (!data) {
          console.error("User not found");
          return;
        }
        set({ activeUser: data });
      },
      fetchUserTrees: async (userId: string) => {
        const { data, error } = await supabase
          .from('UserTree')
          .select("*")
          .eq('user_id', userId);
        if (error) {
          console.error("Error fetching user trees:", error);
          return;
        }
        set({ trees: data });
      },
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default userStore;