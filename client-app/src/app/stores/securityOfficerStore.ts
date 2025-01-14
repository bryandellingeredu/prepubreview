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

    getById = (id : string) : SecurityOfficer => this.securityOfficerRegistry.get(id)!

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
         const securityOfficer = this.securityOfficerRegistry.get(id);
         if (!securityOfficer) {
            toast.error('Security officer not found');
            return;
        }
        runInAction(() => {
            securityOfficer.logicalDeleteIndicator = true;
            this.securityOfficerRegistry.set(id, securityOfficer);
        });
        await agent.SecurityOfficers.delete(id);
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
            organizationDisplay: user!.organizationDisplay,
            logicalDeleteIndicator: false
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

    getFilteredSecurityOfficers = (lastName: string, organizationDisplay: string, scip: string) => {
        let results = this.securityOfficers
        if(lastName){
           results = results.filter(x =>
                x.lastName.toLowerCase().startsWith(lastName.toLowerCase())
            );
        }
        if(organizationDisplay){
            results = results.filter(x =>
                x.organizationDisplay.toLowerCase().startsWith(organizationDisplay.toLowerCase())
            );
        }
        if(scip){
            results = results.filter(x =>
                x.scip.toLowerCase().startsWith(scip.toLowerCase())
            ); 
        }
      return results;
    }

}