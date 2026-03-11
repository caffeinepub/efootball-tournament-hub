import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Tournament {
    maxSlots: bigint;
    name: string;
    slots: Array<string>;
    entryFee: bigint;
    dateTime: Time;
}
export type Time = bigint;
export interface Winner {
    playerName: string;
    position: bigint;
}
export interface UserProfile {
    name: string;
}
export interface Poll {
    question: string;
    votes: Array<bigint>;
    options: Array<string>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addWinner(playerName: string, position: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrUpdatePoll(question: string, options: Array<string>): Promise<void>;
    createOrUpdateTournament(name: string, entryFee: bigint, dateTime: Time, maxSlots: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPoll(): Promise<Poll | null>;
    getTournament(): Promise<Tournament | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWinners(): Promise<Array<Winner>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateSlots(slots: Array<string>): Promise<void>;
    voteInPoll(optionIndex: bigint): Promise<void>;
}
