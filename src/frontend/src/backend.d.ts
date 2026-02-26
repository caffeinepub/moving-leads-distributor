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
export interface BillingSummary {
    studioCount: bigint;
    twoBRCount: bigint;
    pricePerLead: bigint;
    totalLeads: bigint;
    totalAmount: bigint;
    threeBRPlusCount: bigint;
    companyName: string;
    oneBRCount: bigint;
    companyId: string;
}
export type Time = bigint;
export interface LogEntry {
    message: string;
    timestamp: Time;
}
export interface UserProfile {
    name: string;
}
export interface Company {
    id: string;
    contactName: string;
    name: string;
    createdAt: Time;
    pricePerLead: bigint;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addActivityLog(leadId: string, message: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignLeadToCompany(leadId: string, companyId: string): Promise<void>;
    createCompany(id: string, name: string, contactName: string, phone: string, email: string, pricePerLead: bigint): Promise<void>;
    createLead(id: string, customerName: string, phone: string, email: string, moveDate: string, originAddress: string, destinationAddress: string, moveSize: MoveSize, notes: string): Promise<void>;
    deleteCompany(id: string): Promise<void>;
    deleteLead(id: string): Promise<void>;
    getActivityLog(leadId: string): Promise<Array<LogEntry>>;
    getAllCompanies(): Promise<Array<Company>>;
    getAllLeads(): Promise<Array<Lead>>;
    getBillingSummary(): Promise<Array<BillingSummary>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCompany(id: string): Promise<Company>;
    getCompanyAssignmentsForLead(leadId: string): Promise<Array<string>>;
    getLead(id: string): Promise<Lead>;
    getLeadsAssignedToCompany(companyId: string): Promise<Array<string>>;
    getLeadsByStatus(status: Status): Promise<Array<Lead>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeCompanyAssignment(leadId: string, companyId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setCompanyPricePerLead(companyId: string, price: bigint): Promise<void>;
    updateCompany(id: string, name: string, contactName: string, phone: string, email: string, pricePerLead: bigint): Promise<void>;
    updateLead(id: string, customerName: string, phone: string, email: string, moveDate: string, originAddress: string, destinationAddress: string, moveSize: MoveSize, notes: string): Promise<void>;
}
