import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { SecurityOfficer } from "../models/securityOfficer";
import { toast } from "react-toastify";
import { store } from "./store";
import { AppUser } from "../models/appUser";

export default class SecurityOfficerStore{
    securityOfficerRegistry = new Map<string, SecurityOfficer>()
    securityOfficerLoading = false;

    constructor(){
        makeAutoObservable(this);
    }

    get securityOfficers() {
        return Array.from(this.securityOfficerRegistry .values()).sort((a, b) => {
            const lastNameA = a.lastName.toLowerCase();
            const lastNameB = b.lastName.toLowerCase();
            return lastNameA < lastNameB ? -1 : lastNameA > lastNameB ? 1 : 0;
        });
    }

    loadSecurityOfficers = async () => {
        if (this.securityOfficerLoading) return;
        this.setSecurityOfficerLoading(true);
        try {
            const securityOfficers = await agent.SecurityOfficers.list();
            runInAction(() => {
                securityOfficers.forEach((securityOfficer) => {
                    this.securityOfficerRegistry.set(securityOfficer.id, securityOfficer);
                });
            });
        } catch (error) {
            toast.error("Error loading security officers");
            console.log(error);
        } finally {
            this.setSecurityOfficerLoading(false);
        }
    };

    deleteSecurityOfficer = async (id: string) => {
        try{
          await agent.SecurityOfficers.delete(id);
          this.securityOfficerRegistry.delete(id);
        }
        catch (error) {
          console.error("Error deleting security officer:", error);
          toast.error('Error deleting security officer');
        }
    }

    addUpdateSecurityOfficer = async (id: string, personId : number, title: string, scip: string) =>{
        const user : AppUser | undefined = store.usawcUserStore.usawcUserRegistry.get(personId);
        const securityOfficer: SecurityOfficer = {
            id,
            personId,
            title,
            scip,
            firstName: user!.firstName,
            lastName: user!.lastName,
            middleName: user!.middleName,
            organizationId: user!.organizationId,
            organizationDisplay: user!.organizationDisplay
        }
        try{
          await agent.SecurityOfficers.createUpdate(securityOfficer)
          this.securityOfficerRegistry.set(id, securityOfficer)
        }
        catch (error) {
          console.error("Error adding security officer:", error);
          toast.error('Error adding security officer');
          }
      }

    setSecurityOfficerLoading = (state: boolean) => {
        this.securityOfficerLoading = state;
    };

}