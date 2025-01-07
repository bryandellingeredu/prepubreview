import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Administrator } from "../models/administrator";
import { toast } from "react-toastify";
import { AdministratorDTO } from "../models/administratorDTO";
import { AppUser } from "../models/appUser";
import { store } from "./store";

export default class AdministratorStore{
    administratorRegistry = new Map<string, Administrator>()
    administratorLoading = false;
    addingAdministrator = false;
    deletingAdministrator = false;

    constructor(){
        makeAutoObservable(this);
    }

    get administrators() {
        return Array.from(this.administratorRegistry.values()).sort((a, b) => {
            const lastNameA = a.lastName.toLowerCase();
            const lastNameB = b.lastName.toLowerCase();
            return lastNameA < lastNameB ? -1 : lastNameA > lastNameB ? 1 : 0;
        });
    }

    loadAdministrators = async () => {
        if (this.administratorLoading) return;
        this.setAdministratorLoading(true);
        try {
            const administrators = await agent.Administrators.list();
            runInAction(() => {
                administrators.forEach((administrator) => {
                    this.administratorRegistry.set(administrator.id, administrator);
                });
            });
        } catch (error) {
            toast.error("Error loading administrators");
            console.log(error);
        } finally {
            this.setAdministratorLoading(false);
        }
    };

    addAdministrator = async (administratorDTO: AdministratorDTO) =>{
      this.setAddingAdministrator(true);
      const admin : AppUser | undefined = store.usawcUserStore.usawcUserRegistry.get(administratorDTO.personId);
      try{
        await agent.Administrators.create(administratorDTO)
        const createdAdministrator : Administrator ={
            id: administratorDTO.id,
            personId: administratorDTO.personId,
            lastName: admin!.lastName,
            firstName: admin!.firstName,
            middleName: admin!.middleName
        }
        this.administratorRegistry.set(createdAdministrator.id, createdAdministrator)
      }
      catch (error) {
        console.error("Error adding administrator:", error);
        toast.error('Error adding administrator');
        } finally {
            this.setAddingAdministrator(false); // Reset loading state
        }
    }

    deleteAdministrator = async (id: string) => {
        this.setDeletingAdministrator(true);
        try{
          await agent.Administrators.delete(id);
          this.administratorRegistry.delete(id);
        }
        catch (error) {
          console.error("Error deleting administrator:", error);
          toast.error('Error deleting administrator');
        } finally {
                this.setDeletingAdministrator(false); // Reset loading state
        }
    }

    setAdministratorLoading = (state: boolean) => {
        this.administratorLoading = state;
    };

    setAddingAdministrator = (state: boolean) => {
        this.addingAdministrator = state;
    };

    setDeletingAdministrator = (state: boolean) => {
        this.deletingAdministrator = state;
    };
}