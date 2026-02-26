import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Lead {
    id: string;
    customerName: string;
    status: Status;
    originAddress: string;
    destinationAddress: string;
    createdAt: Time;
    email: string;
    notes: string;
    phone: string;
    moveDate: string;
    moveSize: MoveSize;
}
export type Time = bigint;
export interface Company {
    id: string;
    contactName: string;
    name: string;
    createdAt: Time;
    email: string;
    phone: string;
}
export enum MoveSize {
    studio = "studio",
    twoBR = "twoBR",
    oneBR = "oneBR",
    threeBRPlus = "threeBRPlus"
}
export enum Status {
    new_ = "new",
    closed = "closed",
    distributed = "distributed"
}
export interface backendInterface {
    assignLeadToCompany(leadId: string, companyId: string): Promise<void>;
    createCompany(id: string, name: string, contactName: string, phone: string, email: string): Promise<void>;
    createLead(id: string, customerName: string, phone: string, email: string, moveDate: string, originAddress: string, destinationAddress: string, moveSize: MoveSize, notes: string): Promise<void>;
    deleteCompany(id: string): Promise<void>;
    deleteLead(id: string): Promise<void>;
    getAllCompanies(): Promise<Array<Company>>;
    getAllLeads(): Promise<Array<Lead>>;
    getCompany(id: string): Promise<Company>;
    getCompanyAssignmentsForLead(leadId: string): Promise<Array<string>>;
    getLead(id: string): Promise<Lead>;
    getLeadsAssignedToCompany(companyId: string): Promise<Array<string>>;
    getLeadsByStatus(status: Status): Promise<Array<Lead>>;
    removeCompanyAssignment(leadId: string, companyId: string): Promise<void>;
    updateCompany(id: string, name: string, contactName: string, phone: string, email: string): Promise<void>;
    updateLead(id: string, customerName: string, phone: string, email: string, moveDate: string, originAddress: string, destinationAddress: string, moveSize: MoveSize, notes: string): Promise<void>;
}
