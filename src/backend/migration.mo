import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  // Original product type.
  type Product = {
    id : Nat;
    name : Text;
    brand : Text;
    category : Text;
    description : Text;
    price : Nat;
    image : ?Storage.ExternalBlob;
  };

  // Original actor type
  type OldActor = {
    storage : Map.Map<Nat, Product>;
  };

  // New actor type
  type NewActor = {
    storage : Map.Map<Nat, Product>;
    brandStorage : Map.Map<Nat, { id : Nat; name : Text }>;
  };

  // Migration function called by the main actor
  public func run(old : OldActor) : NewActor {
    { old with brandStorage = Map.empty<Nat, { id : Nat; name : Text }>() };
  };
};
