import { createContext, useContext } from "react";
import UserStore from "./userStore";
import PublicationStore from "./publicationStore";
import USAWCUserStore from "./usawcUserStore";
import ModalStore from "./modalStore";
import SMEStore from "./smeStore";

interface Store{
    userStore: UserStore;
    publicationStore: PublicationStore;
    usawcUserStore: USAWCUserStore;
    modalStore: ModalStore;
    smeStore: SMEStore;
}

export const store: Store ={
    userStore: new UserStore(),
    publicationStore: new PublicationStore(),
    usawcUserStore: new USAWCUserStore(),
    modalStore: new ModalStore(),
    smeStore: new SMEStore()
}

export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext);
}


