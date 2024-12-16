import { makeAutoObservable } from "mobx";
import { Publication } from "../models/publication";
import agent from "../api/agent";

export default class PublicationStore{
    publicationRegistry = new Map<string, Publication>()
    publicationLoading = false;

    constructor(){
        makeAutoObservable(this);
    }

    get publications() {
        return Array.from(this.publicationRegistry.values())
    }

    loadPublications = async () =>{
        this.setLoadingInitial(true);
     try{
        const publications = await agent.Publications.list();
        publications.forEach(publication => {
            this.publicationRegistry.set(publication.id, publication);
        })
        this.setLoadingInitial(false);
     } catch(error) {
      console.log(error);
      this.setLoadingInitial(false);
     }
    }

    setLoadingInitial = (state : boolean) => {
        this.publicationLoading = state;
      };
}