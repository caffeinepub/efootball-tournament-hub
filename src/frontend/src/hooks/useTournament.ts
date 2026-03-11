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

const STORAGE_KEY = "efootball_tournament_v1";

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

export function useTournament() {
  const [data, setData] = useState<TournamentData>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TournamentData;
        // Ensure slots length matches maxSlots
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore storage errors
    }
  }, [data]);

  const updateData = useCallback(
    (updater: (prev: TournamentData) => TournamentData) => {
      setData((prev) => updater(prev));
    },
    [],
  );

  // Player actions
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

  // Admin actions
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

  return {
    data,
    joinSlot,
    voteOnPoll,
    updateTournamentSettings,
    updateSlot,
    clearSlot,
    updatePoll,
    resetVotes,
    updateWinners,
    updateTheme,
  };
}
