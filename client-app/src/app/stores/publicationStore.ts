import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Publication } from "../models/publication";
import { PublicationDTO } from "../models/publicationDTO";
import { toast } from "react-toastify";
import { store } from "./store";
import { AppUser } from "../models/appUser";

export default class PublicationStore{
    publicationRegistry = new Map<string, Publication>()
    publicationloading = false;
    uploading = false;
    offset = 0; // Start offset
    limit = 25; // Number of items to fetch per page
    hasMore = true;

    constructor(){
        makeAutoObservable(this);
    }

    get publications() {
        return Array.from(this.publicationRegistry.values())
    }

    loadPublications = async () => {
        if (!this.hasMore || this.publicationloading ) return; // Prevent unnecessary requests
        this.setPublicationLoading(true); // Set loading to true
        try {
            const publications = await agent.Publications.list(this.offset, this.limit);
    
            // If fewer than `limit` items are returned, we assume there are no more items
            if (publications.length < this.limit) {
                this.hasMore = false;
            }
    
            // Add publications to the registry
            publications.forEach((publication) => {
                this.publicationRegistry.set(publication.id, publication);
            });
    
            // Increment the offset for the next batch
            this.offset += this.limit;
        } catch (error) {
            console.error("Error loading publications:", error);
            toast.error('an error occured loading publications');
        } finally {
            this.setPublicationLoading(false); // Always set loading to false after execution
        }
    };

    getPublicationById = async (id: string) => {
        let publication = this.publicationRegistry.get(id);
        if(publication){
            return publication;
        }else{
            try{
                this.setPublicationLoading(true);
                 publication = await agent.Publications.details(id);
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
                authorMiddleName: author!.middleName
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

    resetPublications = () => {
        this.publicationRegistry.clear();
        this.offset = 0;
        this.hasMore = true;
    };

    setPublicationLoading = (state : boolean) => {
        this. publicationloading  = state;
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