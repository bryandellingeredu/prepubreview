export interface Publication{
    id: string,
    createdByPersonId : number, 
    updatedByPersonId: number | null,
    authorPersonId : number,  
    title: string,
    dateCreated: Date,
    dateUpdated: Date | null
 }
 