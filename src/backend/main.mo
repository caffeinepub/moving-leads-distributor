import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type Lead = {
    id : Text;
    customerName : Text;
    phone : Text;
    email : Text;
    moveDate : Text;
    originAddress : Text;
    destinationAddress : Text;
    moveSize : MoveSize;
    notes : Text;
    status : Status;
    createdAt : Time.Time;
  };

  type Company = {
    id : Text;
    name : Text;
    contactName : Text;
    phone : Text;
    email : Text;
    pricePerLead : Nat;
    createdAt : Time.Time;
  };

  type LogEntry = {
    timestamp : Time.Time;
    message : Text;
  };

  type UserProfile = {
    name : Text;
  };

  type MoveSize = {
    #studio;
    #oneBR;
    #twoBR;
    #threeBRPlus;
  };

  module MoveSize {
    public func toString(moveSize : MoveSize) : Text {
      switch (moveSize) {
        case (#studio) { "Studio" };
        case (#oneBR) { "1BR" };
        case (#twoBR) { "2BR" };
        case (#threeBRPlus) { "3BR+" };
      };
    };
  };

  type Status = {
    #new;
    #distributed;
    #closed;
  };

  module Status {
    public func toString(status : Status) : Text {
      switch (status) {
        case (#new) { "new" };
        case (#distributed) { "distributed" };
        case (#closed) { "closed" };
      };
    };
  };

  type BillingSummary = {
    companyId : Text;
    companyName : Text;
    totalLeads : Nat;
    studioCount : Nat;
    oneBRCount : Nat;
    twoBRCount : Nat;
    threeBRPlusCount : Nat;
    pricePerLead : Nat;
    totalAmount : Nat;
  };

  // State
  let leadsMap : Map.Map<Text, Lead> = Map.empty<Text, Lead>();
  let companiesMap : Map.Map<Text, Company> = Map.empty<Text, Company>();
  let leadAssignments : Map.Map<Text, List.List<Text>> = Map.empty<Text, List.List<Text>>();
  let leadLogs : Map.Map<Text, List.List<LogEntry>> = Map.empty<Text, List.List<LogEntry>>();
  let userProfiles : Map.Map<Principal, UserProfile> = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Lead Management (Admin Only)
  public shared ({ caller }) func createLead(
    id : Text,
    customerName : Text,
    phone : Text,
    email : Text,
    moveDate : Text,
    originAddress : Text,
    destinationAddress : Text,
    moveSize : MoveSize,
    notes : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (leadsMap.containsKey(id)) {
      Runtime.trap("Lead already exists");
    };

    let lead : Lead = {
      id;
      customerName;
      phone;
      email;
      moveDate;
      originAddress;
      destinationAddress;
      moveSize;
      notes;
      status = #new;
      createdAt = Time.now();
    };

    leadsMap.add(id, lead);
  };

  public shared ({ caller }) func updateLead(
    id : Text,
    customerName : Text,
    phone : Text,
    email : Text,
    moveDate : Text,
    originAddress : Text,
    destinationAddress : Text,
    moveSize : MoveSize,
    notes : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let lead = getLeadHelper(id);
    let updatedLead : Lead = {
      id = lead.id;
      customerName;
      phone;
      email;
      moveDate;
      originAddress;
      destinationAddress;
      moveSize;
      notes;
      status = lead.status;
      createdAt = lead.createdAt;
    };
    leadsMap.add(id, updatedLead);
  };

  public shared ({ caller }) func deleteLead(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (not leadsMap.containsKey(id)) {
      Runtime.trap("Lead does not exist");
    };
    leadsMap.remove(id);
    leadAssignments.remove(id);
    leadLogs.remove(id);
  };

  // Company Management (Admin Only)
  public shared ({ caller }) func createCompany(
    id : Text,
    name : Text,
    contactName : Text,
    phone : Text,
    email : Text,
    pricePerLead : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (companiesMap.containsKey(id)) {
      Runtime.trap("Company already exists");
    };

    let company : Company = {
      id;
      name;
      contactName;
      phone;
      email;
      pricePerLead;
      createdAt = Time.now();
    };

    companiesMap.add(id, company);
  };

  public shared ({ caller }) func updateCompany(
    id : Text,
    name : Text,
    contactName : Text,
    phone : Text,
    email : Text,
    pricePerLead : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let company = getCompanyHelper(id);
    let updatedCompany : Company = {
      id = company.id;
      name;
      contactName;
      phone;
      email;
      pricePerLead;
      createdAt = company.createdAt;
    };
    companiesMap.add(id, updatedCompany);
  };

  public shared ({ caller }) func setCompanyPricePerLead(companyId : Text, price : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let company = getCompanyHelper(companyId);
    let updatedCompany : Company = {
      id = company.id;
      name = company.name;
      contactName = company.contactName;
      phone = company.phone;
      email = company.email;
      pricePerLead = price;
      createdAt = company.createdAt;
    };
    companiesMap.add(companyId, updatedCompany);
  };

  public shared ({ caller }) func deleteCompany(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (not companiesMap.containsKey(id)) {
      Runtime.trap("Company does not exist");
    };
    companiesMap.remove(id);
  };

  // Lead Assignment (Admin Only)
  public shared ({ caller }) func assignLeadToCompany(leadId : Text, companyId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    ignore getLeadHelper(leadId);
    ignore getCompanyHelper(companyId);

    let currentAssignments = switch (leadAssignments.get(leadId)) {
      case (null) { List.empty<Text>() };
      case (?assignments) { assignments };
    };

    let containsCompany = currentAssignments.values().any(func(id) { id == companyId });
    if (containsCompany) {
      Runtime.trap("Lead already assigned to company");
    };

    currentAssignments.add(companyId);
    leadAssignments.add(leadId, currentAssignments);

    let lead = getLeadHelper(leadId);
    let updatedLead = {
      id = lead.id;
      customerName = lead.customerName;
      phone = lead.phone;
      email = lead.email;
      moveDate = lead.moveDate;
      originAddress = lead.originAddress;
      destinationAddress = lead.destinationAddress;
      moveSize = lead.moveSize;
      notes = lead.notes;
      status = #distributed;
      createdAt = lead.createdAt;
    };
    leadsMap.add(leadId, updatedLead);
  };

  public shared ({ caller }) func removeCompanyAssignment(leadId : Text, companyId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    ignore getLeadHelper(leadId);
    ignore getCompanyHelper(companyId);

    switch (leadAssignments.get(leadId)) {
      case (null) { Runtime.trap("No assignments found for lead") };
      case (?assignments) {
        let filtered = assignments.filter(func(id) { id != companyId });
        if (filtered.isEmpty()) {
          let lead = getLeadHelper(leadId);
          let updatedLead = {
            id = lead.id;
            customerName = lead.customerName;
            phone = lead.phone;
            email = lead.email;
            moveDate = lead.moveDate;
            originAddress = lead.originAddress;
            destinationAddress = lead.destinationAddress;
            moveSize = lead.moveSize;
            notes = lead.notes;
            status = #new;
            createdAt = lead.createdAt;
          };
          leadsMap.add(leadId, updatedLead);
          leadAssignments.remove(leadId);
        } else {
          leadAssignments.add(leadId, filtered);
        };
      };
    };
  };

  // Activity Log (Admin Only)
  public shared ({ caller }) func addActivityLog(leadId : Text, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    ignore getLeadHelper(leadId);

    let logEntry : LogEntry = {
      timestamp = Time.now();
      message;
    };

    let currentLogs = switch (leadLogs.get(leadId)) {
      case (null) { List.empty<LogEntry>() };
      case (?logs) { logs };
    };

    currentLogs.add(logEntry);
    leadLogs.add(leadId, currentLogs);
  };

  // Billing Summary Query (Admin Only)
  public query ({ caller }) func getBillingSummary() : async [BillingSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let summaries = companiesMap.values().toArray().map(
      func(company) {
        let assignedLeads = leadsMap.values().toArray().filter(
          func(lead) {
            switch (leadAssignments.get(lead.id)) {
              case (null) { false };
              case (?companies) {
                companies.values().any(func(id) { id == company.id });
              };
            };
          }
        );

        let studioCount = assignedLeads.filter(func(lead) { lead.moveSize == #studio }).size();
        let oneBRCount = assignedLeads.filter(func(lead) { lead.moveSize == #oneBR }).size();
        let twoBRCount = assignedLeads.filter(func(lead) { lead.moveSize == #twoBR }).size();
        let threeBRPlusCount = assignedLeads.filter(func(lead) { lead.moveSize == #threeBRPlus }).size();

        {
          companyId = company.id;
          companyName = company.name;
          totalLeads = assignedLeads.size();
          studioCount;
          oneBRCount;
          twoBRCount;
          threeBRPlusCount;
          pricePerLead = company.pricePerLead;
          totalAmount = assignedLeads.size() * company.pricePerLead;
        };
      }
    );
    summaries;
  };

  // Queries (Admin Only)
  public query ({ caller }) func getAllLeads() : async [Lead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    leadsMap.values().toArray();
  };

  public query ({ caller }) func getLead(id : Text) : async Lead {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    getLeadHelper(id);
  };

  public query ({ caller }) func getLeadsByStatus(status : Status) : async [Lead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    leadsMap.values().toArray().filter(
      func(lead) { lead.status == status }
    );
  };

  public query ({ caller }) func getAllCompanies() : async [Company] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    companiesMap.values().toArray();
  };

  public query ({ caller }) func getCompany(id : Text) : async Company {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    getCompanyHelper(id);
  };

  public query ({ caller }) func getCompanyAssignmentsForLead(leadId : Text) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (leadAssignments.get(leadId)) {
      case (null) { [] };
      case (?assignments) { assignments.toArray() };
    };
  };

  public query ({ caller }) func getLeadsAssignedToCompany(companyId : Text) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    var leads = List.empty<Text>();
    let iter = leadAssignments.entries();
    iter.forEach(func((leadId, companies)) {
      let containsCompany = companies.values().any(func(id) { id == companyId });
      if (containsCompany) {
        leads.add(leadId);
      };
    });
    leads.toArray();
  };

  public query ({ caller }) func getActivityLog(leadId : Text) : async [LogEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (leadLogs.get(leadId)) {
      case (null) { [] };
      case (?logs) { logs.toArray() };
    };
  };

  // Helper functions
  func getLeadHelper(id : Text) : Lead {
    switch (leadsMap.get(id)) {
      case (null) { Runtime.trap("Lead does not exist") };
      case (?lead) { lead };
    };
  };

  func getCompanyHelper(id : Text) : Company {
    switch (companiesMap.get(id)) {
      case (null) { Runtime.trap("Company does not exist") };
      case (?company) { company };
    };
  };
};
