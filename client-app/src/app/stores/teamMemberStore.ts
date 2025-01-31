import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { toast } from "react-toastify";
import { AppUser } from "../models/appUser";
import { store } from "./store";
import { TeamMember } from "../models/teammember";
import { TeammemberDTO } from "../models/teamMemberDTO";

export default class TeamMemberStore{
    teamMemberRegistry = new Map<string, TeamMember>()
    teamMemberLoading = false;
    addingTeamMember = false;
    deletingTeamMember = false;

    constructor(){
        makeAutoObservable(this);
    }

    get teamMembers() {
        return Array.from(this.teamMemberRegistry.values()).sort((a, b) => {
            const lastNameA = a.lastName.toLowerCase();
            const lastNameB = b.lastName.toLowerCase();
            return lastNameA < lastNameB ? -1 : lastNameA > lastNameB ? 1 : 0;
        });
    }

    loadTeamMembers = async () => {
        if (this.teamMemberLoading) return;
        this.setTeamMemberLoading(true);
        try {
            const teamMembers = await agent.TeamMembers.list();
            runInAction(() => {
                teamMembers.forEach((teamMember) => {
                    this.teamMemberRegistry.set(teamMember.id, teamMember);
                });
            });
        } catch (error) {
            toast.error("Error loading teamMembers");
            console.log(error);
        } finally {
            this.setTeamMemberLoading(false);
        }
    };

    addTeamMember = async (teamMemberDTO: TeammemberDTO) =>{
      this.setAddingTeamMember(true);
      const teamMember : AppUser | undefined = store.usawcUserStore.usawcUserRegistry.get(teamMemberDTO.personId);
      try{
        await agent.TeamMembers.create(teamMemberDTO)
        const createdTeamMember : TeamMember ={
            id: teamMemberDTO.id,
            personId: teamMemberDTO.personId,
            lastName: teamMember!.lastName,
            firstName: teamMember!.firstName,
            middleName: teamMember!.middleName
        }
        this.teamMemberRegistry.set(createdTeamMember.id, createdTeamMember)
      }
      catch (error) {
        console.error("Error adding teamMember:", error);
        toast.error('Error adding teamMember');
        } finally {
            this.setAddingTeamMember(false); // Reset loading state
        }
    }

    deleteTeamMember = async (id: string) => {
        this.setDeletingTeamMember(true);
        try{
          await agent.TeamMembers.delete(id);
          this.teamMemberRegistry.delete(id);
        }
        catch (error) {
          console.error("Error deleting teamMember:", error);
          toast.error('Error deleting teamMember');
        } finally {
                this.setDeletingTeamMember(false); // Reset loading state
        }
    }

    setTeamMemberLoading = (state: boolean) => {
        this.teamMemberLoading = state;
    };

    setAddingTeamMember = (state: boolean) => {
        this.addingTeamMember = state;
    };

    setDeletingTeamMember = (state: boolean) => {
        this.deletingTeamMember = state;
    };
}