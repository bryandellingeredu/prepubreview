export interface InitialThreadDTO{
    id: string
    comments: string
    commentsAsHTML: string
    publicationId: string  
    securityOfficerId: string
    subjectMatterExpertIds: number[]
    nextThreadId: string
}