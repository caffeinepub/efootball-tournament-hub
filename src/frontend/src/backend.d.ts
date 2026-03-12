import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SlotRequest {
    id: bigint;
    status: string;
    submittedAt: bigint;
    playerName: string;
    slotNumber: bigint;
}
export interface MatchResult {
    id: bigint;
    team1: string;
    team2: string;
    score1: bigint;
    score2: bigint;
}
export interface TournamentSettings {
    status: string;
    maxSlots: bigint;
    entryFee: string;
    dateTime: string;
}
export interface Slot {
    id: bigint;
    player: string;
}
export interface LeaderboardRow {
    d: bigint;
    l: bigint;
    w: bigint;
    ga: bigint;
    gf: bigint;
    id: bigint;
    played: bigint;
    player: string;
    points: bigint;
}
export interface Bracket {
    qf: Array<BracketSlot>;
    sf: Array<BracketSlot>;
    final: BracketSlot;
}
export interface Announcement {
    id: bigint;
    title: string;
    date: string;
    message: string;
}
export interface Poll {
    id: bigint;
    matchup: string;
}
export interface UserProfile {
    name: string;
}
export interface BracketSlot {
    id: bigint;
    team1: string;
    team2: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveSlotRequest(requestId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAnnouncements(): Promise<Array<Announcement>>;
    getBracket(): Promise<Bracket>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(): Promise<Array<LeaderboardRow>>;
    getMatchResults(): Promise<Array<MatchResult>>;
    getPolls(): Promise<Array<Poll>>;
    getRules(): Promise<string>;
    getSettings(): Promise<TournamentSettings>;
    getSlotRequests(): Promise<Array<SlotRequest>>;
    getSlots(): Promise<Array<Slot>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    rejectSlotRequest(requestId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAnnouncements(items: Array<Announcement>): Promise<void>;
    setBracket(b: Bracket): Promise<void>;
    setLeaderboard(rows: Array<LeaderboardRow>): Promise<void>;
    setMatchResults(results: Array<MatchResult>): Promise<void>;
    setPolls(newPolls: Array<Poll>): Promise<void>;
    setRules(r: string): Promise<void>;
    setSlots(newSlots: Array<Slot>): Promise<void>;
    submitSlotRequest(playerName: string, slotNumber: bigint): Promise<bigint>;
    updateSettings(s: TournamentSettings): Promise<void>;
}
