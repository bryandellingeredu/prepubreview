import { createContext, useContext } from "react";
import UserStore from "./userStore";
import PublicationStore from "./publicationStore";
import USAWCUserStore from "./usawcUserStore";

interface Store{
    userStore: UserStore;
    publicationStore: PublicationStore;
    usawcUserStore: USAWCUserStore;
}

export const store: Store ={
    userStore: new UserStore(),
    publicationStore: new PublicationStore(),
    usawcUserStore: new USAWCUserStore()
}

export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext);
}


