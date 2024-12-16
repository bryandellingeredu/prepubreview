import { createContext, useContext } from "react";
import UserStore from "./userStore";
import PublicationStore from "./publication";

interface Store{
    userStore: UserStore;
    publicationStore: PublicationStore;
}

export const store: Store ={
    userStore: new UserStore(),
    publicationStore: new PublicationStore()
}

export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext);
}


