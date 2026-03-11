import { useCallback, useEffect, useState } from "react";

export interface SlotEntry {
  id: number;
  playerName: string;
}

export interface PollOption {
  id: number;
  text: string;
  votes: number;
}

export interface Poll {
  question: string;
  options: PollOption[];
}

export interface Winner {
  place: number;
  playerName: string;
  prize: string;
}

export interface Themes {
  home: string;
  slots: string;
  poll: string;
}

export interface TournamentData {
  name: string;
  entryFee: string;
  dateTime: string;
  maxSlots: number;
  slots: SlotEntry[];
  poll: Poll;
  winners: Winner[];
  themes: Themes;
  votedPollOptionId: number | null;
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: number;
  playerName: string;
  points: number;
  wins: number;
  losses: number;
}

export interface MatchResult {
  id: number;
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  date: string;
}

export interface BracketMatch {
  id: number;
  round: number;
  position: number;
  player1: string;
  player2: string;
  winner: string;
}

const STORAGE_KEY = "efootball_tournament_v1";
const ANNOUNCEMENTS_KEY = "announcements";
const RULES_KEY = "tournamentRules";
const LEADERBOARD_KEY = "leaderboard";
const RESULTS_KEY = "matchResults";
const BRACKET_KEY = "knockoutBracket";

function getDefaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  d.setHours(18, 0, 0, 0);
  return d.toISOString();
}

function makeDefaultData(): TournamentData {
  return {
    name: "eFootball World Cup",
    entryFee: "$5.00",
    dateTime: getDefaultDate(),
    maxSlots: 16,
    slots: Array.from({ length: 16 }, (_, i) => ({
      id: i + 1,
      playerName: "",
    })),
    poll: {
      question: "Match Format?",
      options: [
        { id: 1, text: "1 Match", votes: 0 },
        { id: 2, text: "Best of 3", votes: 0 },
        { id: 3, text: "Best of 5", votes: 0 },
      ],
    },
    winners: [],
    themes: { home: "", slots: "", poll: "" },
    votedPollOptionId: null,
  };
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // ignore
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function useTournament() {
  const [data, setData] = useState<TournamentData>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TournamentData;
        if (parsed.slots.length !== parsed.maxSlots) {
          const newSlots = Array.from({ length: parsed.maxSlots }, (_, i) => {
            return parsed.slots[i] || { id: i + 1, playerName: "" };
          });
          parsed.slots = newSlots;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return makeDefaultData();
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    loadFromStorage<Announcement[]>(ANNOUNCEMENTS_KEY, []),
  );

  const [rules, setRules] = useState<string>(() =>
    loadFromStorage<string>(
      RULES_KEY,
      "1. All matches are played on eFootball.\n2. Players must be on time.\n3. Score results must be confirmed by both players.\n4. Fair play is mandatory — no disconnections intentionally.\n5. Admin decisions are final.",
    ),
  );

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() =>
    loadFromStorage<LeaderboardEntry[]>(LEADERBOARD_KEY, []),
  );

  const [matchResults, setMatchResults] = useState<MatchResult[]>(() =>
    loadFromStorage<MatchResult[]>(RESULTS_KEY, []),
  );

  const [bracketMatches, setBracketMatches] = useState<BracketMatch[]>(() =>
    loadFromStorage<BracketMatch[]>(BRACKET_KEY, []),
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEY, data);
  }, [data]);

  useEffect(() => {
    saveToStorage(ANNOUNCEMENTS_KEY, announcements);
  }, [announcements]);

  useEffect(() => {
    saveToStorage(RULES_KEY, rules);
  }, [rules]);

  useEffect(() => {
    saveToStorage(LEADERBOARD_KEY, leaderboard);
  }, [leaderboard]);

  useEffect(() => {
    saveToStorage(RESULTS_KEY, matchResults);
  }, [matchResults]);

  useEffect(() => {
    saveToStorage(BRACKET_KEY, bracketMatches);
  }, [bracketMatches]);

  const updateData = useCallback(
    (updater: (prev: TournamentData) => TournamentData) => {
      setData((prev) => updater(prev));
    },
    [],
  );

  const joinSlot = useCallback(
    (slotId: number, playerName: string) => {
      updateData((prev) => ({
        ...prev,
        slots: prev.slots.map((s) =>
          s.id === slotId ? { ...s, playerName: playerName.trim() } : s,
        ),
      }));
    },
    [updateData],
  );

  const voteOnPoll = useCallback(
    (optionId: number) => {
      updateData((prev) => ({
        ...prev,
        votedPollOptionId: optionId,
        poll: {
          ...prev.poll,
          options: prev.poll.options.map((o) =>
            o.id === optionId ? { ...o, votes: o.votes + 1 } : o,
          ),
        },
      }));
    },
    [updateData],
  );

  const updateTournamentSettings = useCallback(
    (
      settings: Partial<
        Pick<TournamentData, "name" | "entryFee" | "dateTime" | "maxSlots">
      >,
    ) => {
      updateData((prev) => {
        const newMaxSlots = settings.maxSlots ?? prev.maxSlots;
        let newSlots = prev.slots;
        if (newMaxSlots !== prev.maxSlots) {
          newSlots = Array.from({ length: newMaxSlots }, (_, i) => {
            return prev.slots[i] || { id: i + 1, playerName: "" };
          });
        }
        return { ...prev, ...settings, maxSlots: newMaxSlots, slots: newSlots };
      });
    },
    [updateData],
  );

  const updateSlot = useCallback(
    (slotId: number, playerName: string) => {
      updateData((prev) => ({
        ...prev,
        slots: prev.slots.map((s) =>
          s.id === slotId ? { ...s, playerName } : s,
        ),
      }));
    },
    [updateData],
  );

  const clearSlot = useCallback(
    (slotId: number) => {
      updateData((prev) => ({
        ...prev,
        slots: prev.slots.map((s) =>
          s.id === slotId ? { ...s, playerName: "" } : s,
        ),
      }));
    },
    [updateData],
  );

  const updatePoll = useCallback(
    (poll: Poll) => {
      updateData((prev) => ({ ...prev, poll }));
    },
    [updateData],
  );

  const resetVotes = useCallback(() => {
    updateData((prev) => ({
      ...prev,
      votedPollOptionId: null,
      poll: {
        ...prev.poll,
        options: prev.poll.options.map((o) => ({ ...o, votes: 0 })),
      },
    }));
  }, [updateData]);

  const updateWinners = useCallback(
    (winners: Winner[]) => {
      updateData((prev) => ({ ...prev, winners }));
    },
    [updateData],
  );

  const updateTheme = useCallback(
    (section: keyof Themes, base64: string) => {
      updateData((prev) => ({
        ...prev,
        themes: { ...prev.themes, [section]: base64 },
      }));
    },
    [updateData],
  );

  // Announcements
  const addAnnouncement = useCallback((title: string, message: string) => {
    setAnnouncements((prev) => [
      { id: Date.now(), title, message, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const deleteAnnouncement = useCallback((id: number) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Rules
  const updateRules = useCallback((newRules: string) => {
    setRules(newRules);
  }, []);

  // Leaderboard
  const updateLeaderboard = useCallback((entries: LeaderboardEntry[]) => {
    setLeaderboard(entries);
  }, []);

  // Match Results
  const addMatchResult = useCallback(
    (player1: string, player2: string, score1: number, score2: number) => {
      setMatchResults((prev) => [
        ...prev,
        {
          id: Date.now(),
          player1,
          player2,
          score1,
          score2,
          date: new Date().toISOString(),
        },
      ]);
    },
    [],
  );

  const deleteMatchResult = useCallback((id: number) => {
    setMatchResults((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Bracket
  const updateBracket = useCallback((matches: BracketMatch[]) => {
    setBracketMatches(matches);
  }, []);

  const [tournamentStarted, setTournamentStarted] = useState(false);

  const startTournament = useCallback(() => {
    setTournamentStarted(true);
  }, []);

  const stopTournament = useCallback(() => {
    setTournamentStarted(false);
  }, []);

  return {
    data,
    tournamentStarted,
    announcements,
    rules,
    leaderboard,
    matchResults,
    bracketMatches,
    joinSlot,
    voteOnPoll,
    updateTournamentSettings,
    updateSlot,
    clearSlot,
    updatePoll,
    resetVotes,
    updateWinners,
    updateTheme,
    addAnnouncement,
    deleteAnnouncement,
    updateRules,
    updateLeaderboard,
    addMatchResult,
    deleteMatchResult,
    updateBracket,
    startTournament,
    stopTournament,
  };
}
