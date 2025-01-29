import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Publication } from "../models/publication";
import { PublicationDTO } from "../models/publicationDTO";
import { toast } from "react-toastify";
import { store } from "./store";
import { AppUser } from "../models/appUser";
import { StatusType } from "../models/statusType";
import { InitialThreadDTO } from "../models/initialThreadDTO";


export default class PublicationStore{
    publicationRegistry = new Map<string, Publication>()
    myPublicationRegistry = new Map<string, Publication>()
    publicationloading = false;
    mypublicationloading = false;
    uploading = false;
    limit = 25; // Number of items to fetch per page
    hasMore = true;

    constructor(){
        makeAutoObservable(this);
    }

    get publications() {
        return Array.from(this.publicationRegistry.values())
    }

    get myPublications() {
        return Array.from(this.myPublicationRegistry.values())
    }

    loadMyPublications = async () => {
        this.setMyPublicationLoading(true); // Setting loading state (outside runInAction is fine here)
        try {
          const publications = await agent.Publications.listMine();
          runInAction(() => {
            publications.forEach((publication) => {
              this.myPublicationRegistry.set(publication.id, publication); // Observable state change
            });
          });
        } catch (error) {
          console.error("Error loading publications:", error);
          toast.error('An error occurred while loading publications');
        } finally {
          runInAction(() => {
            this.setMyPublicationLoading(false); // Ensure loading state is updated in an observable way
          });
        }
      };


      loadPublications = async (
        fromDate?: Date | null,
        toDate?: Date | null,
        title?: string,
        author?: string,
        status?: number | null,
        offset?: number // Optional parameter
      ) => {
        // Use the passed offset if available; otherwise, use the internal offset
    
      
        if (!this.hasMore || this.publicationloading) return;
      
        this.setPublicationLoading(true);
      
        try {
          const publications = await agent.Publications.list(offset || 0, this.limit, {
            fromDate: fromDate ? fromDate.toISOString() : null,
            toDate: toDate ? toDate.toISOString() : null,
            title: title || null,
            author: author || null,
            status: status !== null && status !== undefined ? status : null,
          });
      
          if (publications.length < this.limit) {
            this.hasMore = false;
          }
      
          runInAction(() => {
            publications.forEach((publication) => {
              this.publicationRegistry.set(publication.id, publication);
            });
          });
        } catch (error) {
          console.error("Error loading publications:", error);
          toast.error("An error occurred while loading publications");
        } finally {
          this.setPublicationLoading(false);
        }
      };

      
    getPublicationById = async (id: string) => {
            try{
                this.setPublicationLoading(true);
                 const publication = await agent.Publications.details(id);
                 runInAction(() => {
                    this.publicationRegistry.set(publication!.id, publication!);
                 });
                 return publication;
            }
            catch (error) {
                console.error("Error loading publication:", error);
                toast.error('an error occured loading publication');
            } finally {
                this.setPublicationLoading(false); // Always set loading to false after execution
            }
        
    }

    addPublication = async (publicationDTO: PublicationDTO) => {
        this.setPublicationLoading(true);
        try{
            await agent.Publications.createUpdate(publicationDTO);
            const author: AppUser | undefined = store.usawcUserStore.usawcUserRegistry.get(publicationDTO.authorPersonId);
        
            const createdPublication : Publication = {
                id: publicationDTO.id, 
                title: publicationDTO.title,
                publicationLink: publicationDTO.publicationLink,
                publicationLinkName: publicationDTO.publicationLinkName,
                dateCreated: new Date(),
                dateUpdated: null,
                createdByPersonId: publicationDTO.createdByPersonId,
                updatedByPersonId: publicationDTO.updatedByPersonId,
                authorPersonId: publicationDTO.authorPersonId,
                authorFirstName: author!.firstName,
                authorLastName: author!.lastName,
                authorMiddleName: author!.middleName,
                threads: null,
                status: StatusType.Pending
            }
            this.publicationRegistry.set(createdPublication.id, createdPublication);
        }
     catch (error) {
        console.error("Error adding publication:", error);
        toast.error('Error adding publication');
    } finally {
        this.setPublicationLoading(false); // Reset loading state
    }
    }

    addInitialThread = async(initialThreadDTO : InitialThreadDTO) => {
        try{
          await agent.Threads.addInitialThread(initialThreadDTO);
          let publication = this.publicationRegistry.get(initialThreadDTO.publicationId);
          if(publication){
            const updatedPublication = await agent.Publications.details(initialThreadDTO.publicationId)
            runInAction(() => {
                this.publicationRegistry.set(updatedPublication.id, updatedPublication)
              });
          }
        }catch(error){
            console.error("Error adding initial thread:", error);
            toast.error('Error adding initial thread');
        }
    }

    addSMEReviewThread = async( threadId: string, comments: string, commentsAsHTML: string, reviewStatus: string, publicationId: string) =>{
     try{
        await agent.Threads.addSMEReviewThread(threadId, comments, commentsAsHTML, reviewStatus);
        let publication = this.publicationRegistry.get(publicationId);
        if(publication){
            const updatedPublication = await agent.Publications.details(publicationId)
            runInAction(() => {
                this.publicationRegistry.set(updatedPublication.id, updatedPublication)
              });
          }
        }catch(error){
            console.error("Error adding sme review thread:", error);
            toast.error('Error adding sme review thread');
        }
    }

    addOPSECReviewThread = async( threadId: string, comments: string, commentsAsHTML: string, reviewStatus: string, publicationId: string) =>{
        try{
           await agent.Threads.addOPSECReviewThread(threadId, comments, commentsAsHTML, reviewStatus);
           let publication = this.publicationRegistry.get(publicationId);
           if(publication){
               const updatedPublication = await agent.Publications.details(publicationId)
               runInAction(() => {
                   this.publicationRegistry.set(updatedPublication.id, updatedPublication)
                 });
             }
           }catch(error){
               console.error("Error adding opsec review thread:", error);
               toast.error('Error adding opsec review thread');
           }
       }

    resubmitToSMEAfterRevision = async (threadId: string, comments: string, commentsAsHTML: string, publicationId: string) => {
        try{
          await agent.Threads.resubmitToSMEAfterRevision(threadId, comments, commentsAsHTML);
          let publication = this.publicationRegistry.get(publicationId);
          if(publication){
            const updatedPublication = await agent.Publications.details(publicationId)
            runInAction(() => {
                this.publicationRegistry.set(updatedPublication.id, updatedPublication)
              });
          }

        }catch(error){
            console.error("Error adding sme review thread:", error);
            toast.error('Error adding sme review thread');
        }
    }

    resubmitToOPSECAfterRevision = async (threadId: string, comments: string, commentsAsHTML: string, publicationId: string) => {
        try{
          await agent.Threads.resubmitToOPSECAfterRevision(threadId, comments, commentsAsHTML);
          let publication = this.publicationRegistry.get(publicationId);
          if(publication){
            const updatedPublication = await agent.Publications.details(publicationId)
            runInAction(() => {
                this.publicationRegistry.set(updatedPublication.id, updatedPublication)
              });
          }

        }catch(error){
            console.error("Error adding opsec review thread:", error);
            toast.error('Error adding opsec review thread');
        }
    }

    resetPublications = () => {
        this.publicationRegistry.clear();
        this.hasMore = true;
    };

    setPublicationLoading = (state : boolean) => {
        this. publicationloading  = state;
      };

      setMyPublicationLoading = (state : boolean) => {
        this.mypublicationloading  = state;
      };

      uploadPublication = async (file: Blob, lookupId: string) => {
        this.uploading = true;
        try{
          const response = await agent.Uploads.uploadPublication(file, lookupId);
          const attachment = response.data;
          runInAction(() => {
            this.uploading = false;
          })
          return attachment;
        } catch(error){
          toast.error('Error uploading publication');
          console.log(error);
          runInAction(() => {
            this.uploading = false;
          })
        }
      }
}