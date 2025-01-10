import { createContext, useContext } from "react";
import UserStore from "./userStore";
import PublicationStore from "./publicationStore";
import USAWCUserStore from "./usawcUserStore";
import ModalStore from "./modalStore";
import SMEStore from "./smeStore";
import AdministratorStore from "./administratorStore";
import SecurityOfficerStore from "./securityOfficerStore";

interface Store{
    userStore: UserStore;
    publicationStore: PublicationStore;
    usawcUserStore: USAWCUserStore;
    modalStore: ModalStore;
    smeStore: SMEStore;
    administratorStore: AdministratorStore;
    securityOfficerStore: SecurityOfficerStore;
}

export const store: Store ={
    userStore: new UserStore(),
    publicationStore: new PublicationStore(),
    usawcUserStore: new USAWCUserStore(),
    modalStore: new ModalStore(),
    smeStore: new SMEStore(),
    administratorStore: new AdministratorStore(),
    securityOfficerStore: new SecurityOfficerStore()
}

export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext);
}


