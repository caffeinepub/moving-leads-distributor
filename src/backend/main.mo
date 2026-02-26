import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";

actor {
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

  let leadsMap = Map.empty<Text, Lead>();
  let companiesMap = Map.empty<Text, Company>();
  let leadAssignments = Map.empty<Text, List.List<Text>>();

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

  public shared ({ caller }) func updateLead(id : Text, customerName : Text, phone : Text, email : Text, moveDate : Text, originAddress : Text, destinationAddress : Text, moveSize : MoveSize, notes : Text) : async () {
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
    if (not leadsMap.containsKey(id)) {
      Runtime.trap("Lead does not exist");
    };
    leadsMap.remove(id);
    leadAssignments.remove(id);
  };

  public query ({ caller }) func getAllLeads() : async [Lead] {
    leadsMap.values().toArray().sort(Lead.compareByCreatedAt);
  };

  public query ({ caller }) func getLead(id : Text) : async Lead {
    getLeadHelper(id);
  };

  func getLeadHelper(id : Text) : Lead {
    switch (leadsMap.get(id)) {
      case (null) { Runtime.trap("Lead does not exist") };
      case (?lead) { lead };
    };
  };

  public query ({ caller }) func getLeadsByStatus(status : Status) : async [Lead] {
    leadsMap.values().toArray().filter(
      func(lead) { lead.status == status }
    );
  };

  public shared ({ caller }) func createCompany(id : Text, name : Text, contactName : Text, phone : Text, email : Text) : async () {
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
    if (not companiesMap.containsKey(id)) {
      Runtime.trap("Company does not exist");
    };
    companiesMap.remove(id);
  };

  public query ({ caller }) func getAllCompanies() : async [Company] {
    companiesMap.values().toArray();
  };

  public query ({ caller }) func getCompany(id : Text) : async Company {
    getCompanyHelper(id);
  };

  func getCompanyHelper(id : Text) : Company {
    switch (companiesMap.get(id)) {
      case (null) { Runtime.trap("Company does not exist") };
      case (?company) { company };
    };
  };

  public shared ({ caller }) func assignLeadToCompany(leadId : Text, companyId : Text) : async () {
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
    ();
  };

  public shared ({ caller }) func removeCompanyAssignment(leadId : Text, companyId : Text) : async () {
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
          ();
        } else {
          leadAssignments.add(leadId, filtered);
          ();
        };
      };
    };
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
};
