export interface PublicationDTO{
    id: string,
    title: string
    createdByPersonId : number
    updatedByPersonId : number | null
    authorPersonId: number 
    publicationLink: string
    publicationLinkName: string
    promotedToWeb : boolean
    promotedToSocial : boolean
    promotedToPress : boolean
 }
