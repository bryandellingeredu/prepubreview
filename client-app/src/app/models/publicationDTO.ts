export interface PublicationDTO{
    id: string,
    title: string
    createdByPersonId : number
    updatedByPersonId : number | null
    authorPersonId: number 
 }
