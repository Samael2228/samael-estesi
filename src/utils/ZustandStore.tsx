import { create } from "zustand";
import supabase from "./supabase";
import { persist, createJSONStorage } from "zustand/middleware";
import { ActiveUser, UserTrees } from "./interfaces";

interface UserStoreState {
  activeUser: ActiveUser | null;
  trees: UserTrees[];
  setActiveUser: (userId: string) => Promise<void>;
  fetchUserTrees: (userId: string) => Promise<void>;
  subscribeToChanges: () => void;
  decrementSpotAndUpdateTrees: () => void;
}

const userStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      activeUser: null,
      trees: [],
      setActiveUser: async (userId: string) => {
        const { data: userData, error: userError } = await supabase
          .from('Users')
          .select("*")
          .eq('id', userId)
          .single();
        if (userError) {
          console.error("Error fetching user:", userError);
          return;
        }
        if (!userData) {
          console.error("User not found");
          return;
        }

        const { data: userTreeData, error: userTreeError } = await supabase
          .from('UserTree')
          .select("*")
          .eq('user_id', userId)
          .is('tree_id', null);
        if (userTreeError) {
          console.error("Error fetching user trees:", userTreeError);
          return;
        }

        const spots = userTreeData.length;
        set({ activeUser: { ...userData, spots } });
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
      subscribeToChanges: () => {
        const userTreeChannel = supabase
          .channel('UserTree')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'UserTree' }, payload => {
            set(state => {
              const updatedTrees = [...state.trees];
              switch (payload.eventType) {
                case 'INSERT':
                  updatedTrees.push(payload.new as UserTrees);
                  break;
                case 'UPDATE':
                  const index = updatedTrees.findIndex(o => o.id === payload.new.id);
                  if (index !== -1) {
                    updatedTrees[index] = payload.new as UserTrees;
                  }
                  break;
                case 'DELETE':
                  return {
                    ...state,
                    trees: updatedTrees.filter(o => o.id !== payload.old.id),
                  };
              }
              return { ...state, trees: updatedTrees };
            });
          })
          .subscribe();
          const userChannel = supabase
          .channel('Users')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'Users' }, payload => {
            set(state => {
              const updatedUser = state.activeUser ? { ...state.activeUser } : null;
              switch (payload.eventType) {
                case 'INSERT':
                  if (updatedUser) {
                    Object.assign(updatedUser, payload.new as ActiveUser);
                  }
                  break;
                case 'UPDATE':
                  if (updatedUser && updatedUser.id === payload.new.id) {
                    Object.assign(updatedUser, payload.new as ActiveUser);
                  }
                  break;
                case 'DELETE':
                  return {
                    ...state,
                    activeUser: null,
                  };
              }
              return { ...state, activeUser: updatedUser };
            });
          })
          .subscribe();

          return () => {
            supabase.removeChannel(userTreeChannel);
            supabase.removeChannel(userChannel);
          }
      },
      decrementSpotAndUpdateTrees: () => {
        set((state) => {
          if (state.activeUser && state.activeUser.spots > 0) {
            const updatedUser = { ...state.activeUser, spots: state.activeUser.spots - 1 };
            return { activeUser: updatedUser };
          }
          return state;
        });

        const fetchUpdatedTrees = async () => {
          const { activeUser } = get();
          if (activeUser) {
            const { data, error } = await supabase
              .from('UserTree')
              .select("*")
              .eq('user_id', activeUser.id);
            if (error) {
              console.error("Error fetching updated trees:", error);
              return;
            }
            set({ trees: data });
          }
        };

        fetchUpdatedTrees();
      },
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default userStore;