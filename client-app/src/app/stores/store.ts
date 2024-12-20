import { createContext, useContext } from "react";
import UserStore from "./userStore";
import PublicationStore from "./publicationStore";
import USAWCUserStore from "./usawcUserStore";
import ModalStore from "./modalStore";

interface Store{
    userStore: UserStore;
    publicationStore: PublicationStore;
    usawcUserStore: USAWCUserStore;
    modalStore: ModalStore;
}

export const store: Store ={
    userStore: new UserStore(),
    publicationStore: new PublicationStore(),
    usawcUserStore: new USAWCUserStore(),
    modalStore: new ModalStore()
}

export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext);
}


