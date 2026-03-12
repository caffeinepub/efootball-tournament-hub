import Array "mo:core/Array";
import Time "mo:core/Time";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {

  // ─── Access Control ────────────────────────────────────────────────────────
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ─── Stubs for old stable variables (kept to avoid upgrade compatibility errors) ─
  type _OldUserProfile = { name : Text };
  type _OldTournament = {
    name : Text;
    entryFee : Nat;
    dateTime : Time.Time;
    maxSlots : Nat;
    slots : [Text];
  };
  type _OldPoll = { question : Text; options : [Text]; votes : [Nat] };
  type _OldWinner = { playerName : Text; position : Nat };
  type _OldTournamentState = {
    tournament : ?_OldTournament;
    poll : ?_OldPoll;
    winners : List.List<_OldWinner>;
  };

  let TournamentId : Nat = 0;
  let tournamentStates = Map.empty<Nat, _OldTournamentState>();
  let userProfiles = Map.empty<Principal, _OldUserProfile>();

  // ─── User Profile Management ───────────────────────────────────────────────

  public type UserProfile = {
    name : Text;
  };

  let userProfilesNew = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfilesNew.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfilesNew.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfilesNew.add(caller, profile);
  };

  // ─── Types ─────────────────────────────────────────────────────────────────

  public type TournamentSettings = {
    entryFee : Text;
    dateTime : Text;
    status : Text;
    maxSlots : Nat;
  };

  public type Slot = {
    id : Nat;
    player : Text;
  };

  public type SlotRequest = {
    id : Nat;
    playerName : Text;
    slotNumber : Nat;
    status : Text;
    submittedAt : Int;
  };

  public type Poll = {
    id : Nat;
    matchup : Text;
  };

  public type LeaderboardRow = {
    id : Nat;
    player : Text;
    played : Nat;
    w : Nat;
    d : Nat;
    l : Nat;
    gf : Nat;
    ga : Nat;
    points : Nat;
  };

  public type MatchResult = {
    id : Nat;
    team1 : Text;
    score1 : Nat;
    score2 : Nat;
    team2 : Text;
  };

  public type BracketSlot = {
    id : Nat;
    team1 : Text;
    team2 : Text;
  };

  public type Bracket = {
    qf : [BracketSlot];
    sf : [BracketSlot];
    final : BracketSlot;
  };

  public type Announcement = {
    id : Nat;
    title : Text;
    message : Text;
    date : Text;
  };

  // ─── State ─────────────────────────────────────────────────────────────────

  var settings : TournamentSettings = {
    entryFee = "\u{20B9}100";
    dateTime = "";
    status = "UPCOMING";
    maxSlots = 16;
  };

  let slots = List.empty<Slot>();
  let slotRequests = List.empty<SlotRequest>();
  var nextSlotRequestId : Nat = 1;
  let polls = List.empty<Poll>();
  let leaderboard = List.empty<LeaderboardRow>();
  let matchResults = List.empty<MatchResult>();
  var bracketData : Bracket = {
    qf = [];
    sf = [];
    final = { id = 1; team1 = ""; team2 = "" };
  };
  let announcements = List.empty<Announcement>();
  var rules : Text = "";

  // ─── Settings ──────────────────────────────────────────────────────────────

  public query func getSettings() : async TournamentSettings {
    settings;
  };

  public shared func updateSettings(s : TournamentSettings) : async () {
    settings := s;
  };

  // ─── Slots ─────────────────────────────────────────────────────────────────

  public query func getSlots() : async [Slot] {
    slots.toArray();
  };

  public shared func setSlots(newSlots : [Slot]) : async () {
    slots.clear();
    for (s in newSlots.vals()) {
      slots.add(s);
    };
  };

  // ─── Slot Requests ─────────────────────────────────────────────────────────

  public query func getSlotRequests() : async [SlotRequest] {
    slotRequests.toArray();
  };

  public shared func submitSlotRequest(playerName : Text, slotNumber : Nat) : async Nat {
    let id = nextSlotRequestId;
    nextSlotRequestId += 1;
    slotRequests.add({
      id;
      playerName;
      slotNumber;
      status = "pending";
      submittedAt = Time.now();
    });
    id;
  };

  public shared func approveSlotRequest(requestId : Nat) : async () {
    let arr = slotRequests.toArray();
    slotRequests.clear();
    for (req in arr.vals()) {
      if (req.id == requestId) {
        slotRequests.add({ req with status = "approved" });
        let slotsArr = slots.toArray();
        slots.clear();
        var found = false;
        for (sl in slotsArr.vals()) {
          if (sl.id == req.slotNumber and not found) {
            slots.add({ sl with player = req.playerName });
            found := true;
          } else {
            slots.add(sl);
          };
        };
        if (not found) {
          slots.add({ id = req.slotNumber; player = req.playerName });
        };
      } else {
        slotRequests.add(req);
      };
    };
  };

  public shared func rejectSlotRequest(requestId : Nat) : async () {
    let arr = slotRequests.toArray();
    slotRequests.clear();
    for (req in arr.vals()) {
      if (req.id == requestId) {
        slotRequests.add({ req with status = "rejected" });
      } else {
        slotRequests.add(req);
      };
    };
  };

  // ─── Polls ─────────────────────────────────────────────────────────────────

  public query func getPolls() : async [Poll] {
    polls.toArray();
  };

  public shared func setPolls(newPolls : [Poll]) : async () {
    polls.clear();
    for (p in newPolls.vals()) {
      polls.add(p);
    };
  };

  // ─── Leaderboard ───────────────────────────────────────────────────────────

  public query func getLeaderboard() : async [LeaderboardRow] {
    leaderboard.toArray();
  };

  public shared func setLeaderboard(rows : [LeaderboardRow]) : async () {
    leaderboard.clear();
    for (r in rows.vals()) {
      leaderboard.add(r);
    };
  };

  // ─── Match Results ─────────────────────────────────────────────────────────

  public query func getMatchResults() : async [MatchResult] {
    matchResults.toArray();
  };

  public shared func setMatchResults(results : [MatchResult]) : async () {
    matchResults.clear();
    for (r in results.vals()) {
      matchResults.add(r);
    };
  };

  // ─── Bracket ───────────────────────────────────────────────────────────────

  public query func getBracket() : async Bracket {
    bracketData;
  };

  public shared func setBracket(b : Bracket) : async () {
    bracketData := b;
  };

  // ─── Announcements ─────────────────────────────────────────────────────────

  public query func getAnnouncements() : async [Announcement] {
    announcements.toArray();
  };

  public shared func setAnnouncements(items : [Announcement]) : async () {
    announcements.clear();
    for (a in items.vals()) {
      announcements.add(a);
    };
  };

  // ─── Rules ─────────────────────────────────────────────────────────────────

  public query func getRules() : async Text {
    rules;
  };

  public shared func setRules(r : Text) : async () {
    rules := r;
  };

};
