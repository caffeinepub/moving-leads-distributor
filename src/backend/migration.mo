import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

module {
  type OldLead = {
    id : Text;
    customerName : Text;
    phone : Text;
    email : Text;
    moveDate : Text;
    originAddress : Text;
    destinationAddress : Text;
    moveSize : OldMoveSize;
    notes : Text;
    status : OldStatus;
    createdAt : Int;
  };

  type OldMoveSize = {
    #studio;
    #oneBR;
    #twoBR;
    #threeBRPlus;
  };

  type OldStatus = {
    #new;
    #distributed;
    #closed;
  };

  type OldCompany = {
    id : Text;
    name : Text;
    contactName : Text;
    phone : Text;
    email : Text;
    createdAt : Int;
  };

  type OldLogEntry = {
    timestamp : Int;
    message : Text;
  };

  type OldUserProfile = {
    name : Text;
  };

  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    leadsMap : Map.Map<Text, OldLead>;
    companiesMap : Map.Map<Text, OldCompany>;
    leadAssignments : Map.Map<Text, List.List<Text>>;
    leadLogs : Map.Map<Text, List.List<OldLogEntry>>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewLead = {
    id : Text;
    customerName : Text;
    phone : Text;
    email : Text;
    moveDate : Text;
    originAddress : Text;
    destinationAddress : Text;
    moveSize : OldMoveSize;
    notes : Text;
    status : OldStatus;
    createdAt : Int;
  };

  type NewCompany = {
    id : Text;
    name : Text;
    contactName : Text;
    phone : Text;
    email : Text;
    pricePerLead : Nat;
    createdAt : Int;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    leadsMap : Map.Map<Text, NewLead>;
    companiesMap : Map.Map<Text, NewCompany>;
    leadAssignments : Map.Map<Text, List.List<Text>>;
    leadLogs : Map.Map<Text, List.List<OldLogEntry>>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newCompanies = old.companiesMap.map<Text, OldCompany, NewCompany>(
      func(_id, oldCompany) {
        { oldCompany with pricePerLead = 0 };
      }
    );
    { old with companiesMap = newCompanies };
  };
};
