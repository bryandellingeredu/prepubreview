export interface SecurityOfficer{
    id : string
    personId: number
    firstName: string
    middleName: string
    lastName: string
    scip: string
    title: string
    organizationId : number | null
    organizationDisplay: string
    logicalDeleteIndicator: boolean
}