export enum StatusType{
    Pending = 0,
    SentToSMEForReview = 1,
    RejectedBySME = 2,
    SentToSecurityForReview = 3,
    RejectedBySecurity = 4,
    Complete = 5,
    SentToSupervisor = 6,
    RejectedBySupervisor = 7
}