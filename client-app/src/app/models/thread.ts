import { SubjectMatterExpert } from "./subjectMatterExpert";
import { ThreadType } from "./threadType";

export interface Thread{
    id: string,
    isActive: boolean,
    createdByPersonId : number,
    updatedByPersonId : number | null,
    dateCreated: Date,
    dateUpdated: Date | null,
    comments: string,
    commentsAsHTML: string,
    type: ThreadType,
    publicationId: string,
    subjectMatterExperts: SubjectMatterExpert[] | null
    securityOfficerId: string
}