import { Thread } from "./thread";

export interface Publication{
    id: string,
    createdByPersonId : number, 
    updatedByPersonId: number | null,
    authorPersonId : number,  
    authorFirstName: string,
    authorMiddleName: string,
    authorLastName: string,
    title: string,
    dateCreated: Date,
    dateUpdated: Date | null,
    publicationLink: string,
    publicationLinkName: string,
    threads: Thread[] | null
 }
 