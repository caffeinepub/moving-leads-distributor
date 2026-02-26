import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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
    createdAt : Time.Time;
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

  type LogEntry = {
    timestamp : Time.Time;
    message : Text;
  };

  type UserProfile = {
    name : Text;
  };

  // Maps for storing data
  let leadsMap = Map.empty<Text, Lead>();
  let companiesMap = Map.empty<Text, Company>();
  let leadAssignments = Map.empty<Text, List.List<Text>>();
  let leadLogs = Map.empty<Text, List.List<LogEntry>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  module Lead {
    public func compareByCreatedAt(lead1 : Lead, lead2 : Lead) : {
      #less;
      #equal;
      #greater;
    } {
      if (lead1.createdAt < lead2.createdAt) { #less } else if (lead1.createdAt > lead2.createdAt) {
        #greater;
      } else { #equal };
    };

    public func compareByCustomerName(lead1 : Lead, lead2 : Lead) : {
      #less;
      #equal;
      #greater;
    } {
      Text.compare(lead1.customerName, lead2.customerName);
    };
  };

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
  public shared ({ caller }) func createCompany(id : Text, name : Text, contactName : Text, phone : Text, email : Text) : async () {
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
      createdAt = Time.now();
    };

    companiesMap.add(id, company);
  };

  public shared ({ caller }) func updateCompany(id : Text, name : Text, contactName : Text, phone : Text, email : Text) : async () {
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
      createdAt = company.createdAt;
    };
    companiesMap.add(id, updatedCompany);
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

  // Queries (Public)
  public query ({ caller }) func getAllLeads() : async [Lead] {
    leadsMap.values().toArray().sort(Lead.compareByCreatedAt);
  };

  public query ({ caller }) func getLead(id : Text) : async Lead {
    getLeadHelper(id);
  };

  public query ({ caller }) func getLeadsByStatus(status : Status) : async [Lead] {
    leadsMap.values().toArray().filter(
      func(lead) { lead.status == status }
    );
  };

  public query ({ caller }) func getAllCompanies() : async [Company] {
    companiesMap.values().toArray();
  };

  public query ({ caller }) func getCompany(id : Text) : async Company {
    getCompanyHelper(id);
  };

  public query ({ caller }) func getCompanyAssignmentsForLead(leadId : Text) : async [Text] {
    switch (leadAssignments.get(leadId)) {
      case (null) { [] };
      case (?assignments) { assignments.toArray() };
    };
  };

  public query ({ caller }) func getLeadsAssignedToCompany(companyId : Text) : async [Text] {
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
