import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";


import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

// Specify the migration function in the with clause

actor {
  // Define Product type
  public type Product = {
    id : Nat;
    name : Text;
    brand : Text;
    category : Text;
    description : Text;
    price : Nat;
    image : ?Storage.ExternalBlob;
  };

  // Define Brand type
  public type Brand = {
    id : Nat;
    name : Text;
  };

  // Define UserProfile type
  public type UserProfile = {
    name : Text;
  };

  // Authorization component
  let accessControlState = AccessControl.initState();
  let storage = Map.empty<Nat, Product>();
  let brandStorage = Map.empty<Nat, Brand>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  include MixinAuthorization(accessControlState);
  // Mixin for blob storage
  include MixinStorage();

  // Stripe integration
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // Bootstrap: first caller becomes admin when no admin exists yet
  public shared ({ caller }) func claimInitialAdmin() : async Bool {
    if (caller.isAnonymous()) {
      return false;
    };
    if (accessControlState.adminAssigned) {
      return false;
    };
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
    true;
  };

  // Returns the number of admins (0 means no admin claimed yet)
  public query func getAdminCount() : async Nat {
    var count = 0;
    for ((_, role) in accessControlState.userRoles.entries()) {
      if (role == #admin) { count += 1 };
    };
    count;
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  // Product Management Functions
  public shared ({ caller }) func addProduct(
    name : Text,
    brand : Text,
    category : Text,
    description : Text,
    price : Nat,
    image : ?Storage.ExternalBlob,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let id = storage.size();
    let product : Product = {
      id;
      name;
      brand;
      category;
      description;
      price;
      image;
    };

    storage.add(id, product);
  };

  public shared ({ caller }) func updateProduct(
    id : Nat,
    name : Text,
    brand : Text,
    category : Text,
    description : Text,
    price : Nat,
    image : ?Storage.ExternalBlob,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    switch (storage.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let updatedProduct : Product = {
          id;
          name;
          brand;
          category;
          description;
          price;
          image;
        };
        storage.add(id, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    switch (storage.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        storage.remove(id);
      };
    };
  };

  // Public Query Functions (no authentication required)
  public query func getAllProducts() : async [Product] {
    storage.values().toArray();
  };

  public query func getProduct(id : Nat) : async Product {
    switch (storage.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query func getProductsByCategory(category : Text) : async [Product] {
    let filtered = List.empty<Product>();

    for ((_, product) in storage.entries()) {
      if (Text.equal(product.category, category)) {
        filtered.add(product);
      };
    };

    filtered.toArray();
  };

  // Brand Management Functions (Admin-only)
  public query func getAllBrands() : async [Brand] {
    brandStorage.values().toArray();
  };

  public shared ({ caller }) func addBrand(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add brands");
    };

    let id = brandStorage.size();
    let brand : Brand = {
      id;
      name;
    };

    brandStorage.add(id, brand);
  };

  public shared ({ caller }) func updateBrand(id : Nat, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update brands");
    };

    switch (brandStorage.get(id)) {
      case (null) { Runtime.trap("Brand not found") };
      case (?_) {
        let updatedBrand : Brand = {
          id;
          name;
        };
        brandStorage.add(id, updatedBrand);
      };
    };
  };

  public shared ({ caller }) func deleteBrand(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete brands");
    };

    switch (brandStorage.get(id)) {
      case (null) { Runtime.trap("Brand not found") };
      case (?_) {
        brandStorage.remove(id);
      };
    };
  };

  // Stripe Configuration Functions (Admin-only)
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  public query ({ caller }) func getStripeConfiguration() : async ?Stripe.StripeConfiguration {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view payment configuration");
    };
    stripeConfiguration;
  };

  // Required Stripe Functions
  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  func getStripeConfigurationInternal() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfigurationInternal(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfigurationInternal(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
