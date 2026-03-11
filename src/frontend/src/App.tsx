import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Calendar,
  ChevronRight,
  DollarSign,
  LogOut,
  Pencil,
  Plus,
  Settings,
  Shield,
  Trash2,
  Trophy,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type Poll,
  type PollOption,
  type Winner,
  useTournament,
} from "./hooks/useTournament";

type Page = "home" | "slots" | "poll" | "winner";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function toLocalDateTimeInput(iso: string): string {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

// ─── Section Background Wrapper ───────────────────────────────────────────────
function SectionBg({
  bg,
  children,
}: { bg: string; children: React.ReactNode }) {
  return (
    <div
      className="relative flex-1 overflow-hidden"
      style={{
        backgroundImage: bg ? `url(${bg})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {bg && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      )}
      <div className="relative z-10 h-full overflow-y-auto scrollbar-hide">
        {children}
      </div>
    </div>
  );
}

// ─── Home Page ─────────────────────────────────────────────────────────────────
function HomePage({
  data,
  onJoin,
  onAdmin,
}: {
  data: ReturnType<typeof useTournament>["data"];
  onJoin: () => void;
  onAdmin: () => void;
}) {
  const filledSlots = data.slots.filter((s) => s.playerName).length;

  return (
    <div
      data-ocid="home.page"
      className="relative h-full flex flex-col overflow-hidden"
      style={{
        backgroundImage: data.themes.home
          ? `url(${data.themes.home})`
          : `url('/assets/generated/efootball-hero-bg.dim_1200x800.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/50 to-background/90" />

      {/* Top bar */}
      <div className="relative z-10 flex justify-between items-center p-4 pt-6">
        <div className="flex items-center gap-2">
          <Shield
            className="w-5 h-5"
            style={{ color: "oklch(0.7 0.25 142)" }}
          />
          <span className="font-heading text-sm font-semibold uppercase tracking-widest text-white/70">
            eFootball Hub
          </span>
        </div>
        <button
          type="button"
          data-ocid="home.admin_button"
          onClick={onAdmin}
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:border-glow-green transition-all"
          aria-label="Admin panel"
        >
          <Settings className="w-4 h-4 text-white/50" />
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
        {/* Slot availability */}
        <div className="flex items-center gap-2 text-sm">
          <span
            className="w-2 h-2 rounded-full animate-pulse-neon"
            style={{ background: "oklch(0.7 0.25 142)" }}
          />
          <span className="text-white/60">
            {filledSlots} / {data.maxSlots} players registered
          </span>
        </div>

        {/* Title */}
        <div>
          <h1
            className="font-heading text-4xl font-black uppercase leading-tight text-white"
            style={{ letterSpacing: "-0.02em" }}
          >
            {data.name}
          </h1>
          <p className="mt-2 font-body text-sm text-white/50 uppercase tracking-[0.2em]">
            TOURNAMENT
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-3 justify-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-glow-green glass-card">
            <DollarSign
              className="w-4 h-4"
              style={{ color: "oklch(0.7 0.25 142)" }}
            />
            <span
              className="font-heading font-bold text-sm"
              style={{ color: "oklch(0.7 0.25 142)" }}
            >
              Entry: {data.entryFee}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-glow-gold glass-card">
            <Calendar
              className="w-4 h-4"
              style={{ color: "oklch(0.75 0.2 85)" }}
            />
            <span
              className="font-body text-sm"
              style={{ color: "oklch(0.75 0.2 85)" }}
            >
              {formatDate(data.dateTime)}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          data-ocid="home.join_button"
          onClick={onJoin}
          className="group relative mt-2 px-10 py-4 rounded-xl font-heading font-black uppercase text-lg tracking-widest transition-all duration-200 active:scale-95"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.25 142) 0%, oklch(0.4 0.2 142) 100%)",
            color: "oklch(0.95 0.05 142)",
            boxShadow:
              "0 0 30px oklch(0.7 0.25 142 / 0.4), 0 4px 20px oklch(0.1 0.02 142 / 0.6)",
          }}
        >
          <span className="flex items-center gap-2">
            JOIN TOURNAMENT
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>

        <p className="text-xs text-white/30 uppercase tracking-widest">
          Open for players worldwide
        </p>
      </div>
    </div>
  );
}

// ─── Slots Page ────────────────────────────────────────────────────────────────
function SlotsPage({
  data,
  onJoinSlot,
}: {
  data: ReturnType<typeof useTournament>["data"];
  onJoinSlot: (slotId: number, playerName: string) => void;
}) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState("");
  const filledSlots = data.slots.filter((s) => s.playerName).length;

  const handleSubmit = () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (selectedSlot !== null) {
      onJoinSlot(selectedSlot, playerName.trim());
      toast.success(`Slot #${selectedSlot} claimed by ${playerName.trim()}!`);
      setSelectedSlot(null);
      setPlayerName("");
    }
  };

  return (
    <SectionBg bg={data.themes.slots}>
      <div data-ocid="slots.page" className="p-4">
        {/* Header */}
        <div className="mb-4 pt-2">
          <h2
            className="font-heading text-2xl font-black uppercase text-white"
            style={{ letterSpacing: "-0.01em" }}
          >
            Player Slots
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="h-1 flex-1 rounded-full overflow-hidden"
              style={{ background: "oklch(0.15 0.03 220)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(filledSlots / data.maxSlots) * 100}%`,
                  background:
                    "linear-gradient(90deg, oklch(0.5 0.22 142), oklch(0.65 0.25 142))",
                }}
              />
            </div>
            <span
              className="text-sm font-body font-semibold"
              style={{ color: "oklch(0.7 0.25 142)" }}
            >
              {filledSlots}/{data.maxSlots}
            </span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3">
          {data.slots.map((slot, i) => {
            const isFilled = !!slot.playerName;
            const ocidIndex = i + 1;
            return (
              <button
                type="button"
                key={slot.id}
                data-ocid={`slots.item.${ocidIndex}`}
                onClick={() => {
                  if (!isFilled) {
                    setSelectedSlot(slot.id);
                    setPlayerName("");
                  }
                }}
                className={`relative p-3 rounded-xl text-left transition-all duration-200 active:scale-95 ${
                  isFilled
                    ? "slot-filled cursor-default"
                    : "slot-empty hover:border-glow-green cursor-pointer"
                }`}
                disabled={isFilled}
              >
                <div
                  className="text-xs font-body uppercase tracking-widest mb-1"
                  style={{ color: "oklch(0.5 0.05 220)" }}
                >
                  Slot #{slot.id}
                </div>
                {isFilled ? (
                  <div>
                    <div
                      className="font-heading font-bold text-sm truncate text-glow-green"
                      style={{ color: "oklch(0.7 0.25 142)" }}
                    >
                      {slot.playerName}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.55 0.15 142)" }}
                    >
                      ✓ Registered
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      className="font-heading font-semibold text-sm"
                      style={{ color: "oklch(0.35 0.05 220)" }}
                    >
                      Empty
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.3 0.03 220)" }}
                    >
                      Tap to join
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Join Dialog */}
        <Dialog
          open={selectedSlot !== null}
          onOpenChange={(o) => !o && setSelectedSlot(null)}
        >
          <DialogContent
            data-ocid="slots.join_dialog"
            className="glass-card border-0 max-w-sm mx-4"
          >
            <DialogHeader>
              <DialogTitle
                className="font-heading text-xl uppercase"
                style={{ color: "oklch(0.7 0.25 142)" }}
              >
                Join Slot #{selectedSlot}
              </DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <Label className="text-sm text-white/70 mb-2 block">
                Your Name
              </Label>
              <Input
                data-ocid="slots.input"
                placeholder="Enter your name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-neon"
                autoFocus
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                onClick={() => setSelectedSlot(null)}
                className="flex-1 text-white/60"
              >
                Cancel
              </Button>
              <Button
                data-ocid="slots.submit_button"
                onClick={handleSubmit}
                className="flex-1 font-heading font-bold uppercase"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.25 142), oklch(0.4 0.2 142))",
                  color: "oklch(0.95 0.05 142)",
                }}
              >
                CLAIM SLOT
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SectionBg>
  );
}

// ─── Poll Page ─────────────────────────────────────────────────────────────────
function PollPage({
  data,
  onVote,
}: {
  data: ReturnType<typeof useTournament>["data"];
  onVote: (optionId: number) => void;
}) {
  const totalVotes = data.poll.options.reduce((sum, o) => sum + o.votes, 0);
  const hasVoted = data.votedPollOptionId !== null;

  return (
    <SectionBg bg={data.themes.poll}>
      <div data-ocid="poll.page" className="p-4">
        <div className="mb-6 pt-2">
          <h2
            className="font-heading text-2xl font-black uppercase text-white"
            style={{ letterSpacing: "-0.01em" }}
          >
            Community Poll
          </h2>
          <p
            className="mt-1 font-body text-sm"
            style={{ color: "oklch(0.6 0.1 220)" }}
          >
            {hasVoted ? "Your vote has been recorded" : "Cast your vote below"}
          </p>
        </div>

        <div
          className="glass-card rounded-2xl p-5 mb-4"
          style={{ border: "1px solid oklch(0.25 0.05 220 / 0.5)" }}
        >
          <h3 className="font-heading text-xl font-bold text-white mb-5">
            {data.poll.question}
          </h3>

          <div className="flex flex-col gap-3">
            {data.poll.options.map((option, i) => {
              const pct =
                totalVotes > 0
                  ? Math.round((option.votes / totalVotes) * 100)
                  : 0;
              const isVoted = data.votedPollOptionId === option.id;
              const ocidIndex = i + 1;

              return (
                <button
                  type="button"
                  key={option.id}
                  data-ocid={`poll.option.${ocidIndex}`}
                  onClick={() => !hasVoted && onVote(option.id)}
                  disabled={hasVoted}
                  className={`relative overflow-hidden rounded-xl p-4 text-left transition-all duration-200 ${
                    hasVoted
                      ? "cursor-default"
                      : "active:scale-98 hover:scale-100"
                  } ${isVoted ? "border-glow-green" : "border"}`}
                  style={{
                    background: isVoted
                      ? "oklch(0.12 0.04 142 / 0.7)"
                      : "oklch(0.1 0.02 220 / 0.7)",
                    borderColor: isVoted
                      ? "oklch(0.5 0.2 142 / 0.6)"
                      : "oklch(0.25 0.04 220 / 0.5)",
                    transform: !hasVoted ? undefined : undefined,
                  }}
                >
                  {hasVoted && (
                    <div
                      className="absolute inset-y-0 left-0 rounded-xl transition-all duration-700 ease-out vote-bar"
                      style={{ width: `${pct}%`, opacity: 0.25 }}
                    />
                  )}
                  <div className="relative flex justify-between items-center">
                    <span
                      className={`font-heading font-bold text-base ${
                        isVoted ? "text-glow-green" : ""
                      }`}
                      style={{
                        color: isVoted
                          ? "oklch(0.7 0.25 142)"
                          : "oklch(0.85 0.05 220)",
                      }}
                    >
                      {option.text}
                    </span>
                    {hasVoted && (
                      <span
                        className="font-body text-sm font-semibold"
                        style={{
                          color: isVoted
                            ? "oklch(0.7 0.25 142)"
                            : "oklch(0.5 0.05 220)",
                        }}
                      >
                        {pct}%
                      </span>
                    )}
                    {!hasVoted && (
                      <ChevronRight
                        className="w-4 h-4"
                        style={{ color: "oklch(0.4 0.05 220)" }}
                      />
                    )}
                  </div>
                  {hasVoted && (
                    <div className="relative mt-2">
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: "oklch(0.15 0.03 220)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out vote-bar"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "oklch(0.4 0.05 220)" }}
                      >
                        {option.votes} {option.votes === 1 ? "vote" : "votes"}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {totalVotes > 0 && (
            <p
              className="text-center text-xs mt-4"
              style={{ color: "oklch(0.4 0.05 220)" }}
            >
              {totalVotes} total {totalVotes === 1 ? "vote" : "votes"}
            </p>
          )}
        </div>
      </div>
    </SectionBg>
  );
}

// ─── Winner Page ───────────────────────────────────────────────────────────────
function WinnerPage({
  data,
}: { data: ReturnType<typeof useTournament>["data"] }) {
  const sorted = [...data.winners].sort((a, b) => a.place - b.place);

  const placeStyle = (place: number) => {
    if (place === 1) return "winner-gold";
    if (place === 2) return "winner-silver";
    if (place === 3) return "winner-bronze";
    return "glass-card";
  };

  const placeMedal = (place: number) => {
    if (place === 1) return "🥇";
    if (place === 2) return "🥈";
    if (place === 3) return "🥉";
    return `#${place}`;
  };

  const placeColor = (place: number) => {
    if (place === 1) return "oklch(0.75 0.2 85)";
    if (place === 2) return "oklch(0.75 0.05 240)";
    if (place === 3) return "oklch(0.65 0.15 60)";
    return "oklch(0.6 0.05 220)";
  };

  return (
    <div
      data-ocid="winner.page"
      className="h-full overflow-y-auto scrollbar-hide"
    >
      <div className="p-4">
        <div className="mb-6 pt-2">
          <h2
            className="font-heading text-2xl font-black uppercase text-white"
            style={{ letterSpacing: "-0.01em" }}
          >
            Winner Board
          </h2>
          <p
            className="mt-1 font-body text-sm"
            style={{ color: "oklch(0.6 0.1 220)" }}
          >
            Tournament results
          </p>
        </div>

        {sorted.length === 0 ? (
          <div
            data-ocid="winner.empty_state"
            className="glass-card rounded-2xl p-8 text-center"
            style={{ border: "1px solid oklch(0.25 0.05 220 / 0.4)" }}
          >
            <Trophy
              className="w-12 h-12 mx-auto mb-3"
              style={{ color: "oklch(0.35 0.05 220)" }}
            />
            <p className="font-heading text-lg font-bold text-white/40">
              No winners announced yet
            </p>
            <p
              className="font-body text-sm mt-1"
              style={{ color: "oklch(0.35 0.05 220)" }}
            >
              Check back after the tournament
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((winner, i) => {
              const ocidIndex = i + 1;
              return (
                <div
                  key={winner.place}
                  data-ocid={`winner.item.${ocidIndex}`}
                  className={`${placeStyle(winner.place)} rounded-2xl p-4 animate-fade-slide-up`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{placeMedal(winner.place)}</span>
                    <div className="flex-1">
                      <div
                        className="font-heading font-black text-lg"
                        style={{ color: placeColor(winner.place) }}
                      >
                        {winner.playerName}
                      </div>
                      {winner.prize && (
                        <div
                          className="font-body text-sm"
                          style={{ color: "oklch(0.6 0.05 220)" }}
                        >
                          Prize: {winner.prize}
                        </div>
                      )}
                    </div>
                    <div
                      className="font-heading font-black text-2xl"
                      style={{ color: placeColor(winner.place) }}
                    >
                      {winner.place === 1
                        ? "1st"
                        : winner.place === 2
                          ? "2nd"
                          : winner.place === 3
                            ? "3rd"
                            : `${winner.place}th`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin Panel ───────────────────────────────────────────────────────────────
function AdminPanel({
  data,
  onClose,
  onUpdateSettings,
  onUpdateSlot,
  onClearSlot,
  onUpdatePoll,
  onResetVotes,
  onUpdateWinners,
  onUpdateTheme,
}: {
  data: ReturnType<typeof useTournament>["data"];
  onClose: () => void;
  onUpdateSettings: ReturnType<
    typeof useTournament
  >["updateTournamentSettings"];
  onUpdateSlot: ReturnType<typeof useTournament>["updateSlot"];
  onClearSlot: ReturnType<typeof useTournament>["clearSlot"];
  onUpdatePoll: ReturnType<typeof useTournament>["updatePoll"];
  onResetVotes: ReturnType<typeof useTournament>["resetVotes"];
  onUpdateWinners: ReturnType<typeof useTournament>["updateWinners"];
  onUpdateTheme: ReturnType<typeof useTournament>["updateTheme"];
}) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");

  // Settings state
  const [tName, setTName] = useState(data.name);
  const [tFee, setTFee] = useState(data.entryFee);
  const [tDate, setTDate] = useState(toLocalDateTimeInput(data.dateTime));
  const [tSlots, setTSlots] = useState(String(data.maxSlots));

  // Poll state
  const [pollQ, setPollQ] = useState(data.poll.question);
  const [pollOpts, setPollOpts] = useState<PollOption[]>(data.poll.options);

  // Winners state
  const [winners, setWinners] = useState<Winner[]>(data.winners);

  const fileInputRef = useRef<{ [k: string]: HTMLInputElement | null }>({});

  const handleAuth = () => {
    if (pw === "admin123") {
      setAuthed(true);
      setPwError("");
    } else {
      setPwError("Incorrect password");
    }
  };

  const handleImageUpload = useCallback(
    (section: "home" | "slots" | "poll", file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onUpdateTheme(section, base64);
        toast.success(`${section} background updated!`);
      };
      reader.readAsDataURL(file);
    },
    [onUpdateTheme],
  );

  const saveSettings = () => {
    onUpdateSettings({
      name: tName,
      entryFee: tFee,
      dateTime: new Date(tDate).toISOString(),
      maxSlots: Math.max(1, Math.min(64, Number.parseInt(tSlots) || 16)),
    });
    toast.success("Settings saved!");
  };

  const savePoll = () => {
    onUpdatePoll({ question: pollQ, options: pollOpts });
    toast.success("Poll updated!");
  };

  const addPollOption = () => {
    const nextId = Math.max(0, ...pollOpts.map((o) => o.id)) + 1;
    setPollOpts((prev) => [...prev, { id: nextId, text: "", votes: 0 }]);
  };

  const removePollOption = (id: number) => {
    setPollOpts((prev) => prev.filter((o) => o.id !== id));
  };

  const saveWinners = () => {
    onUpdateWinners(winners.filter((w) => w.playerName.trim()));
    toast.success("Winners saved!");
  };

  const addWinner = () => {
    const nextPlace = winners.length + 1;
    setWinners((prev) => [
      ...prev,
      { place: nextPlace, playerName: "", prize: "" },
    ]);
  };

  if (!authed) {
    return (
      <div
        data-ocid="admin.panel"
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
      >
        <div className="glass-card rounded-2xl p-6 w-full max-w-sm mx-4 animate-scale-in">
          <div className="flex justify-between items-center mb-6">
            <h2
              className="font-heading text-xl font-black uppercase"
              style={{ color: "oklch(0.75 0.2 85)" }}
            >
              Admin Access
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-white/40 hover:text-white/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-4">
            <Label className="text-sm text-white/60 mb-2 block">Password</Label>
            <Input
              data-ocid="admin.password_input"
              type="password"
              placeholder="Enter admin password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              className="bg-muted border-border"
              autoFocus
            />
            {pwError && (
              <p
                className="text-xs mt-1"
                style={{ color: "oklch(0.6 0.2 20)" }}
              >
                {pwError}
              </p>
            )}
          </div>
          <Button
            data-ocid="admin.submit_button"
            onClick={handleAuth}
            className="w-full font-heading font-bold uppercase"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.2 85), oklch(0.4 0.18 85))",
              color: "oklch(0.95 0.05 85)",
            }}
          >
            ENTER
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-ocid="admin.panel"
      className="fixed inset-0 z-50 flex flex-col bg-background"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-4 border-b"
        style={{ borderColor: "oklch(0.2 0.04 220)" }}
      >
        <div className="flex items-center gap-2">
          <Settings
            className="w-5 h-5"
            style={{ color: "oklch(0.75 0.2 85)" }}
          />
          <h2
            className="font-heading text-lg font-black uppercase"
            style={{ color: "oklch(0.75 0.2 85)" }}
          >
            Admin Panel
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="settings"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList
          className="flex overflow-x-auto scrollbar-hide px-3 pt-2 pb-0 bg-transparent h-auto gap-1 justify-start"
          style={{ borderBottom: "1px solid oklch(0.18 0.04 220)" }}
        >
          {["settings", "slots", "poll", "winners", "themes"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              data-ocid="admin.tab"
              className="font-heading font-bold text-xs uppercase px-3 py-2 rounded-t-md data-[state=active]:bg-muted data-[state=active]:text-gold flex-shrink-0"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Settings Tab */}
          <TabsContent value="settings" className="p-4 space-y-4 mt-0">
            <div>
              <Label className="text-xs text-white/50 uppercase tracking-widest mb-1 block">
                Tournament Name
              </Label>
              <Input
                value={tName}
                onChange={(e) => setTName(e.target.value)}
                className="bg-muted border-border"
              />
            </div>
            <div>
              <Label className="text-xs text-white/50 uppercase tracking-widest mb-1 block">
                Entry Fee
              </Label>
              <Input
                value={tFee}
                onChange={(e) => setTFee(e.target.value)}
                className="bg-muted border-border"
                placeholder="$5.00"
              />
            </div>
            <div>
              <Label className="text-xs text-white/50 uppercase tracking-widest mb-1 block">
                Date & Time
              </Label>
              <Input
                type="datetime-local"
                value={tDate}
                onChange={(e) => setTDate(e.target.value)}
                className="bg-muted border-border"
              />
            </div>
            <div>
              <Label className="text-xs text-white/50 uppercase tracking-widest mb-1 block">
                Max Slots
              </Label>
              <Input
                type="number"
                min="1"
                max="64"
                value={tSlots}
                onChange={(e) => setTSlots(e.target.value)}
                className="bg-muted border-border"
              />
            </div>
            <Button
              data-ocid="admin.save_button"
              onClick={saveSettings}
              className="w-full font-heading font-bold uppercase"
              style={{
                background: "oklch(0.45 0.2 85)",
                color: "oklch(0.95 0.05 85)",
              }}
            >
              SAVE SETTINGS
            </Button>
          </TabsContent>

          {/* Slots Tab */}
          <TabsContent value="slots" className="p-4 mt-0">
            <div className="space-y-2">
              {data.slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-2 glass-card rounded-lg px-3 py-2"
                >
                  <span className="text-xs font-body text-white/40 w-8">
                    #{slot.id}
                  </span>
                  <Input
                    value={slot.playerName}
                    onChange={(e) => onUpdateSlot(slot.id, e.target.value)}
                    placeholder="Empty"
                    className="flex-1 bg-transparent border-0 text-sm p-0 h-auto focus-visible:ring-0"
                  />
                  {slot.playerName && (
                    <button
                      type="button"
                      onClick={() => {
                        onClearSlot(slot.id);
                        toast.success(`Slot #${slot.id} cleared`);
                      }}
                      className="text-destructive/70 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Poll Tab */}
          <TabsContent value="poll" className="p-4 space-y-4 mt-0">
            <div>
              <Label className="text-xs text-white/50 uppercase tracking-widest mb-1 block">
                Question
              </Label>
              <Input
                value={pollQ}
                onChange={(e) => setPollQ(e.target.value)}
                className="bg-muted border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-white/50 uppercase tracking-widest block">
                Options
              </Label>
              {pollOpts.map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <Input
                    value={opt.text}
                    onChange={(e) =>
                      setPollOpts((prev) =>
                        prev.map((o) =>
                          o.id === opt.id ? { ...o, text: e.target.value } : o,
                        ),
                      )
                    }
                    className="flex-1 bg-muted border-border"
                  />
                  <span className="text-xs text-white/30 w-12 text-right">
                    {opt.votes}v
                  </span>
                  <button
                    type="button"
                    onClick={() => removePollOption(opt.id)}
                    className="text-destructive/70 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={addPollOption}
                className="text-white/50 hover:text-white"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Option
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                data-ocid="admin.save_button"
                onClick={savePoll}
                className="flex-1 font-heading font-bold uppercase text-xs"
                style={{
                  background: "oklch(0.45 0.2 85)",
                  color: "oklch(0.95 0.05 85)",
                }}
              >
                SAVE POLL
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onResetVotes();
                  toast.success("Votes reset!");
                }}
                className="text-xs"
              >
                Reset Votes
              </Button>
            </div>
          </TabsContent>

          {/* Winners Tab */}
          <TabsContent value="winners" className="p-4 space-y-4 mt-0">
            <div className="space-y-3">
              {winners.map((w, i) => (
                <div
                  key={w.place}
                  className="glass-card rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-heading font-bold text-sm"
                      style={{ color: "oklch(0.75 0.2 85)" }}
                    >
                      Place #{w.place}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setWinners((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="text-destructive/70 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Input
                    placeholder="Player name"
                    value={w.playerName}
                    onChange={(e) =>
                      setWinners((prev) =>
                        prev.map((item, idx) =>
                          idx === i
                            ? { ...item, playerName: e.target.value }
                            : item,
                        ),
                      )
                    }
                    className="bg-muted border-border"
                  />
                  <Input
                    placeholder="Prize (optional)"
                    value={w.prize}
                    onChange={(e) =>
                      setWinners((prev) =>
                        prev.map((item, idx) =>
                          idx === i ? { ...item, prize: e.target.value } : item,
                        ),
                      )
                    }
                    className="bg-muted border-border"
                  />
                </div>
              ))}
              <Button
                variant="ghost"
                onClick={addWinner}
                className="w-full text-white/50 hover:text-white border border-dashed"
                style={{ borderColor: "oklch(0.25 0.04 220)" }}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Winner
              </Button>
            </div>
            <Button
              data-ocid="admin.save_button"
              onClick={saveWinners}
              className="w-full font-heading font-bold uppercase"
              style={{
                background: "oklch(0.45 0.2 85)",
                color: "oklch(0.95 0.05 85)",
              }}
            >
              SAVE WINNERS
            </Button>
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="p-4 space-y-5 mt-0">
            {(["home", "slots", "poll"] as const).map((section) => (
              <div key={section}>
                <Label className="text-xs text-white/50 uppercase tracking-widest mb-2 block">
                  {section} Background
                </Label>
                <div
                  className="relative rounded-xl overflow-hidden border"
                  style={{
                    borderColor: "oklch(0.25 0.05 220 / 0.5)",
                    minHeight: "80px",
                    background: data.themes[section]
                      ? `url(${data.themes[section]}) center/cover`
                      : "oklch(0.1 0.02 220)",
                  }}
                >
                  {data.themes[section] && (
                    <div className="absolute inset-0 bg-background/60" />
                  )}
                  <div className="relative flex items-center justify-center gap-3 p-4">
                    <input
                      ref={(el) => {
                        fileInputRef.current[section] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(section, file);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      data-ocid="admin.upload_button"
                      onClick={() => fileInputRef.current[section]?.click()}
                      size="sm"
                      className="font-heading font-bold uppercase text-xs"
                      style={{
                        background: "oklch(0.45 0.2 85)",
                        color: "oklch(0.95 0.05 85)",
                      }}
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      {data.themes[section] ? "CHANGE" : "UPLOAD"}
                    </Button>
                    {data.themes[section] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onUpdateTheme(section, "");
                          toast.success(`${section} theme cleared`);
                        }}
                        className="text-destructive/70 hover:text-destructive text-xs"
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> CLEAR
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// ─── Bottom Nav ────────────────────────────────────────────────────────────────
function BottomNav({
  activePage,
  onNavigate,
}: {
  activePage: Page;
  onNavigate: (page: Page) => void;
}) {
  const tabs: { id: Page | "exit"; label: string; icon: React.ReactNode }[] = [
    { id: "slots", label: "Slots", icon: <Users className="w-5 h-5" /> },
    { id: "poll", label: "Poll", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "winner", label: "Winner", icon: <Trophy className="w-5 h-5" /> },
    { id: "exit", label: "Home", icon: <LogOut className="w-5 h-5" /> },
  ];

  return (
    <nav
      className="flex-shrink-0 safe-bottom"
      style={{
        background: "oklch(0.07 0.02 220 / 0.97)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid oklch(0.2 0.04 220 / 0.6)",
      }}
    >
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = activePage === tab.id;
          const isExit = tab.id === "exit";
          return (
            <button
              type="button"
              key={tab.id}
              data-ocid={`nav.${tab.id}.link`}
              onClick={() => onNavigate(isExit ? "home" : (tab.id as Page))}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all duration-200 ${
                isActive && !isExit ? "tab-active" : ""
              }`}
              style={{
                color:
                  isActive && !isExit
                    ? "oklch(0.7 0.25 142)"
                    : isExit
                      ? "oklch(0.55 0.12 20)"
                      : "oklch(0.4 0.05 220)",
              }}
            >
              {tab.icon}
              <span className="text-xs font-heading font-semibold uppercase tracking-wider">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activePage, setActivePage] = useState<Page>("home");
  const [showAdmin, setShowAdmin] = useState(false);

  const {
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
  } = useTournament();

  const isHome = activePage === "home";

  return (
    <div className="h-full flex flex-col bg-background">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.12 0.03 220)",
            border: "1px solid oklch(0.25 0.05 220)",
            color: "oklch(0.9 0.05 220)",
          },
        }}
      />

      {/* Main content area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {isHome ? (
          <HomePage
            data={data}
            onJoin={() => setActivePage("slots")}
            onAdmin={() => setShowAdmin(true)}
          />
        ) : activePage === "slots" ? (
          <SlotsPage data={data} onJoinSlot={joinSlot} />
        ) : activePage === "poll" ? (
          <PollPage data={data} onVote={voteOnPoll} />
        ) : (
          <WinnerPage data={data} />
        )}
      </main>

      {/* Bottom nav — only show when not on home */}
      {!isHome && (
        <BottomNav activePage={activePage} onNavigate={setActivePage} />
      )}

      {/* Admin panel overlay */}
      {showAdmin && (
        <AdminPanel
          data={data}
          onClose={() => setShowAdmin(false)}
          onUpdateSettings={updateTournamentSettings}
          onUpdateSlot={updateSlot}
          onClearSlot={clearSlot}
          onUpdatePoll={updatePoll}
          onResetVotes={resetVotes}
          onUpdateWinners={updateWinners}
          onUpdateTheme={updateTheme}
        />
      )}

      {/* Footer */}
      <div
        className={`text-center py-2 text-xs ${isHome ? "absolute bottom-2 left-0 right-0 z-10" : ""}`}
        style={{ color: "oklch(0.3 0.03 220)" }}
      >
        © {new Date().getFullYear()} Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "oklch(0.45 0.1 220)" }}
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
