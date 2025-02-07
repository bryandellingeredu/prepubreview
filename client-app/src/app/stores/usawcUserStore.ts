import { makeAutoObservable, runInAction } from "mobx";
import { AppUser } from "../models/appUser";
import agent from "../api/agent";
import { toast } from "react-toastify";

export default class USAWCUserStore{
     usawcUserRegistry = new Map<number, AppUser>();
     usawcUserloading = false;

         constructor(){
             makeAutoObservable(this);
         }
     
         get usawcUsers() {
            return Array.from(this.usawcUserRegistry.values()).sort((a, b) => {
                // First compare by last name
                const lastNameComparison = a.lastName.localeCompare(b.lastName);
                if (lastNameComparison !== 0) return lastNameComparison;
        
                // If last names are equal, compare by first name
                return a.firstName.localeCompare(b.firstName);
            });
         }

         getUserByPersonId = (personId: number) : AppUser | undefined => {
            if(personId){
            const result = this.usawcUserRegistry.get(personId)
            if (result) return result;
            toast.error('person not found');
            }else{
                toast.error('personid not provided')
                return undefined;
            }
         } 

         loadUSAWCUsers = async () => {
            this.setUSAWCUserLoading(true);
            try{
                const users = await agent.AppUsers.list();
                users.forEach((user) => {
                      runInAction(() => {
                            this.usawcUserRegistry.set(user.personId, user);
                      })
                });
        
            }catch(error){
                  console.error("Error loading app users:", error);
                  toast.error('Error loading app users');
            }
            finally{
                this.setUSAWCUserLoading(false);
            }
         }

         setUSAWCUserLoading = (state: boolean) => this.usawcUserloading = state; 


}