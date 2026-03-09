import Text "mo:core/Text";
import Array "mo:core/Array";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Map "mo:core/Map";

actor {
  type Product = {
    id : Nat;
    name : Text;
    price : Nat;
    category : Text;
    brand : Text;
    description : Text;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.id, product2.id);
    };
  };

  let productStore = Map.empty<Nat, Product>();
  var currentId = 0;

  public shared ({ caller }) func addProduct(name : Text, price : Nat, category : Text, brand : Text, description : Text) : async () {
    let id = currentId;
    currentId += 1;

    let product : Product = {
      id;
      name;
      price;
      category;
      brand;
      description;
    };

    productStore.add(id, product);
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    productStore.values().toArray().sort();
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    let filtered = List.empty<Product>();

    for ((_, product) in productStore.entries()) {
      if (Text.equal(product.category, category)) {
        filtered.add(product);
      };
    };

    filtered.toArray();
  };

  public query ({ caller }) func getProduct(id : Nat) : async Product {
    switch (productStore.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };
};
