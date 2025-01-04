import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { UserSubject } from "../models/userSubject";
import { toast } from "react-toastify";

export default class SMEStore {
  userSubjectRegistry = new Map<number, UserSubject>();
  userSubjectLoading = false;
  currentPage = 0; // Keep track of the current page
  totalSubjects = 0; // Optional, tracks total number of subjects available

  constructor() {
      makeAutoObservable(this);
  }

  // Sorted user subjects
  get userSubjects() {
      return Array.from(this.userSubjectRegistry.values()).sort((a, b) => {
          const lastNameA = a.usawcUser.lastName.toLowerCase();
          const lastNameB = b.usawcUser.lastName.toLowerCase();
          return lastNameA < lastNameB ? -1 : lastNameA > lastNameB ? 1 : 0;
      });
  }

  getPaginatedUserSubjects = (pageSize: number): UserSubject[] => {
    const startIndex = this.currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return this.userSubjects.slice(startIndex, endIndex);
};

getFilteredUserSubjects = (lastName: string, subject: string): UserSubject[] => {
    if (!subject && lastName) {
        // Filter by last name only
        return this.userSubjects.filter(userSubject =>
            userSubject.usawcUser.lastName.toLowerCase().startsWith(lastName.toLowerCase())
        );
    }

    if (subject && !lastName) {
        // Filter by subject only
        return this.userSubjects.filter(userSubject =>
            userSubject.subjects.some(sub => sub.toLowerCase().startsWith(subject.toLowerCase()))
        );
    }

    if (lastName && subject) {
        // Filter by both last name and subject
        return this.userSubjects.filter(userSubject =>
            userSubject.usawcUser.lastName.toLowerCase().startsWith(lastName.toLowerCase()) &&
            userSubject.subjects.some(sub => sub.toLowerCase().startsWith(subject.toLowerCase()))
        );
    }

    // Return an empty array if no filters are provided
    return [];
};

  // Load more user subjects (pagination)
  loadMoreSubjects = async (pageSize: number = 24): Promise<UserSubject[]> => {
      // Check if registry is empty and load users if necessary
      if (this.userSubjectRegistry.size === 0) {
          await this.loadUserSubjects();
      }

      const startIndex = this.currentPage * pageSize;
      const endIndex = startIndex + pageSize;

      const paginatedSubjects = this.userSubjects.slice(startIndex, endIndex);

      if (paginatedSubjects.length > 0) {
          runInAction(() => {
              this.currentPage++;
          });
      }

      return paginatedSubjects;
  };

  loadUserSubjects = async () => {
      if (this.userSubjectLoading) return;
      this.setuserSubjectLoading(true);
      try {
          const userSubjects = await agent.SubjectMatterExperts.list();
          runInAction(() => {
              userSubjects.forEach((userSubject) => {
                  this.userSubjectRegistry.set(userSubject.usawcUser.personId, userSubject);
              });
              this.totalSubjects = userSubjects.length; // Update total subjects if needed
          });
      } catch (error) {
          toast.error("Error loading subject matter experts");
          console.log(error);
      } finally {
          this.setuserSubjectLoading(false);
      }
  };

  getUserSubjectByPersonId = (personId: number) : UserSubject =>  this.userSubjectRegistry.get(personId)!;
  
 

  setuserSubjectLoading = (state: boolean) => {
      this.userSubjectLoading = state;
  };
}
