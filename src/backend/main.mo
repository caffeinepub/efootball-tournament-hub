import Array "mo:core/Array";
import Time "mo:core/Time";
import List "mo:core/List";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data models
  type Tournament = {
    name : Text;
    entryFee : Nat;
    dateTime : Time.Time;
    maxSlots : Nat;
    slots : [Text];
  };

  type Poll = {
    question : Text;
    options : [Text];
    votes : [Nat];
  };

  type Winner = {
    playerName : Text;
    position : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  type TournamentId = Nat;

  // TournamentId is always #0 since only one tournament is supported in the current implementation.
  let TournamentId = 0;

  type TournamentState = {
    tournament : ?Tournament;
    poll : ?Poll;
    winners : List.List<Winner>;
  };

  module Winner {
    public func compare(winner1 : Winner, winner2 : Winner) : Order.Order {
      Nat.compare(winner1.position, winner2.position);
    };
  };

  let tournamentStates = Map.empty<TournamentId, TournamentState>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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

  // Tournament management
  public shared ({ caller }) func createOrUpdateTournament(name : Text, entryFee : Nat, dateTime : Time.Time, maxSlots : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create or update tournaments");
    };

    let newTournament = {
      name;
      entryFee;
      dateTime;
      maxSlots;
      slots = Array.empty<Text>();
    };

    let state = {
      tournament = ?newTournament;
      poll = null;
      winners = List.empty<Winner>();
    };

    tournamentStates.add(TournamentId, state);
  };

  // Update player slots
  public shared ({ caller }) func updateSlots(slots : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update slots");
    };

    let state = switch (tournamentStates.get(TournamentId)) {
      case (null) { Runtime.trap("Tournament does not exist") };
      case (?state) { state };
    };

    switch (state.tournament) {
      case (null) { Runtime.trap("Tournament data not found") };
      case (?tournament) {
        let updatedTournament = {
          tournament with
          slots;
        };

        let updatedState = {
          state with
          tournament = ?updatedTournament;
        };

        tournamentStates.add(TournamentId, updatedState);
      };
    };
  };

  // Poll management
  public shared ({ caller }) func createOrUpdatePoll(question : Text, options : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create or update polls");
    };

    let newPoll = {
      question;
      options;
      votes = Array.tabulate(options.size(), func(_) { 0 });
    };

    let state = switch (tournamentStates.get(TournamentId)) {
      case (null) {
        {
          tournament = null;
          poll = ?newPoll;
          winners = List.empty<Winner>();
        };
      };
      case (?state) {
        {
          state with
          poll = ?newPoll;
        };
      };
    };

    tournamentStates.add(TournamentId, state);
  };

  // Vote in poll
  public shared ({ caller }) func voteInPoll(optionIndex : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can vote in polls");
    };

    let state = switch (tournamentStates.get(TournamentId)) {
      case (null) { Runtime.trap("Tournament does not exist") };
      case (?state) { state };
    };

    switch (state.poll) {
      case (null) { Runtime.trap("Poll does not exist") };
      case (?poll) {
        if (optionIndex >= poll.options.size()) {
          Runtime.trap("Invalid option index");
        };

        let updatedVotes = Array.tabulate(
          poll.votes.size(),
          func(i) {
            if (i == optionIndex) {
              poll.votes[i] + 1;
            } else {
              poll.votes[i];
            };
          },
        );

        let updatedPoll = {
          poll with
          votes = updatedVotes;
        };

        let updatedState = {
          state with
          poll = ?updatedPoll;
        };

        tournamentStates.add(TournamentId, updatedState);
      };
    };
  };

  // Winner management
  public shared ({ caller }) func addWinner(playerName : Text, position : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add winners");
    };

    let state = switch (tournamentStates.get(TournamentId)) {
      case (null) {
        {
          tournament = null;
          poll = null;
          winners = List.empty<Winner>();
        };
      };
      case (?state) { state };
    };

    let winner = {
      playerName;
      position;
    };

    state.winners.add(winner);
    tournamentStates.add(TournamentId, state);
  };

  // Getters - accessible to all users including guests
  public query ({ caller }) func getTournament() : async ?Tournament {
    switch (tournamentStates.get(TournamentId)) {
      case (null) { null };
      case (?state) { state.tournament };
    };
  };

  public query ({ caller }) func getPoll() : async ?Poll {
    switch (tournamentStates.get(TournamentId)) {
      case (null) { null };
      case (?state) { state.poll };
    };
  };

  public query ({ caller }) func getWinners() : async [Winner] {
    switch (tournamentStates.get(TournamentId)) {
      case (null) { [] };
      case (?state) { state.winners.toArray().sort() };
    };
  };
};
