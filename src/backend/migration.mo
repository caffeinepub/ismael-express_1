import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  type Product = {
    id : Nat;
    name : Text;
    brand : Text;
    category : Text;
    description : Text;
    price : Nat;
    image : ?Storage.ExternalBlob;
  };

  type OldProduct = {
    id : Nat;
    name : Text;
    brand : Text;
    category : Text;
    description : Text;
    price : Nat;
  };

  type OldActor = {
    productStore : Map.Map<Nat, OldProduct>;
    currentId : Nat;
  };

  type NewActor = {
    storage : Map.Map<Nat, Product>;
  };

  public func run(old : OldActor) : NewActor {
    let newProducts = old.productStore.map<Nat, OldProduct, Product>(
      func(_id, oldProduct) {
        { oldProduct with image = null };
      }
    );
    { storage = newProducts };
  };
};
