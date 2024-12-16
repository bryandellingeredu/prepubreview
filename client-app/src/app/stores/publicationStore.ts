import { makeAutoObservable } from "mobx";
import agent from "../api/agent";
import { Publication } from "../models/publication";

export default class PublicationStore{
    publicationRegistry = new Map<string, Publication>()
    loading = false;
    offset = 0; // Start offset
    limit = 100; // Number of items to fetch per page
    hasMore = true;

    constructor(){
        makeAutoObservable(this);
    }

    get publications() {
        return Array.from(this.publicationRegistry.values())
    }

    loadPublications = async () => {
        if (!this.hasMore || this.loading) return; // Prevent unnecessary requests
    
        this.setLoading(true); // Set loading to true
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
        } finally {
            this.setLoading(false); // Always set loading to false after execution
        }
    };

    resetPublications = () => {
        this.publicationRegistry.clear();
        this.offset = 0;
        this.hasMore = true;
    };

    setLoading = (state : boolean) => {
        this.loading = state;
      };
}