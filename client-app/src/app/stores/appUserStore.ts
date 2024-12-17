import { makeAutoObservable } from "mobx";
import { AppUser } from "../models/appUser";
import agent from "../api/agent";
import { toast } from "react-toastify";

export default class AppUserStore{
     appUserRegistry = new Map<number, AppUser>();
     appUserloading = false;

         constructor(){
             makeAutoObservable(this);
         }
     
         get appUsers() {
            return Array.from(this.appUserRegistry.values()).sort((a, b) => {
                // First compare by last name
                const lastNameComparison = a.lastName.localeCompare(b.lastName);
                if (lastNameComparison !== 0) return lastNameComparison;
        
                // If last names are equal, compare by first name
                return a.firstName.localeCompare(b.firstName);
            });
         }

         loadAppUsers = async () => {
            this.setAppUserLoading(true);
            try{
                const appUsers = await agent.AppUsers.list();
                appUsers.forEach((appUser) => {
                    this.appUserRegistry.set(appUser.personId, appUser);
                });
        
            }catch(error){
                  console.error("Error loading app users:", error);
                  toast.error('Error loading app users');
            }
            finally{
                this.setAppUserLoading(false);
            }
         }

         setAppUserLoading = (state: boolean) => this.appUserloading = state; 


}