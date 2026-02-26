import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
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

  type Status = {
    #new;
    #distributed;
    #closed;
  };

  type ActorState = {
    leadsMap : Map.Map<Text, Lead>;
    companiesMap : Map.Map<Text, Company>;
    leadAssignments : Map.Map<Text, List.List<Text>>;
  };

  public func run(state : ActorState) : ActorState {
    state;
  };
};
