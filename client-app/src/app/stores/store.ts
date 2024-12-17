import { createContext, useContext } from "react";
import UserStore from "./userStore";
import PublicationStore from "./publicationStore";
import AppUserStore from "./appUserStore";

interface Store{
    userStore: UserStore;
    publicationStore: PublicationStore;
    appUserStore: AppUserStore;
}

export const store: Store ={
    userStore: new UserStore(),
    publicationStore: new PublicationStore(),
    appUserStore: new AppUserStore()
}

export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext);
}


