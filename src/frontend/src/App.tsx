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
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  LogOut,
  MessageSquare,
  Pencil,
  Plus,
  Settings,
  Shield,
  Swords,
  Trash2,
  Trophy,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type BracketMatch,
  type LeaderboardEntry,
  type MatchResult,
  type Poll,
  type PollOption,
  type Winner,
  useTournament,
} from "./hooks/useTournament";

type Page =
  | "home"
  | "slots"
  | "poll"
  | "winner"
  | "announcements"
  | "rules"
  | "leaderboard"
  | "results"
  | "bracket";

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

// ─── WhatsApp Contact Banner ───────────────────────────────────────────────────
function WhatsAppBanner() {
  return (
    <div
      className="mx-4 mb-3 rounded-xl px-4 py-3 flex items-center gap-3"
      style={{
        background: "oklch(0.13 0.06 142 / 0.8)",
        border: "1px solid oklch(0.4 0.2 142 / 0.5)",
      }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "oklch(0.45 0.25 142)" }}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="WhatsApp"
          role="img"
        >
          <title>WhatsApp</title>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="font-heading font-bold text-xs uppercase tracking-widest"
          style={{ color: "oklch(0.7 0.25 142)" }}
        >
          Player Entry — WhatsApp
        </p>
        <div className="flex flex-wrap gap-x-2 mt-0.5">
          <a
            href="https://wa.me/917002352569"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm font-semibold"
            style={{ color: "oklch(0.85 0.15 142)" }}
          >
            7002352569
          </a>
          <span style={{ color: "oklch(0.4 0.05 142)" }}>/</span>
          <a
            href="https://wa.me/917099127072"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm font-semibold"
            style={{ color: "oklch(0.85 0.15 142)" }}
          >
            7099127072
          </a>
        </div>
      </div>
      <div
        className="mt-2 pt-2 flex justify-center"
        style={{ borderTop: "1px solid oklch(0.25 0.1 142 / 0.4)" }}
      >
        <a
          href="https://chat.whatsapp.com/G8yA9aBWqRdE6V7cEpYAtJ?mode=hq1tcla"
          target="_blank"
          rel="noopener noreferrer"
          data-ocid="home.join_group_button"
          className="flex items-center gap-2 px-4 py-2 rounded-full font-heading font-bold text-xs uppercase tracking-widest transition-all duration-200 active:scale-95"
          style={{
            background: "oklch(0.45 0.25 142)",
            color: "white",
          }}
        >
          <Users className="w-3.5 h-3.5" />
          Join WhatsApp Group
        </a>
      </div>
    </div>
  );
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
  tournamentStarted,
  onJoin,
  onAdmin,
}: {
  data: ReturnType<typeof useTournament>["data"];
  tournamentStarted: boolean;
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
        {/* Status badge */}
        <div
          className="px-4 py-1.5 rounded-full font-heading font-black text-sm uppercase tracking-widest"
          style={
            tournamentStarted
              ? {
                  background: "oklch(0.35 0.15 142 / 0.3)",
                  border: "1.5px solid oklch(0.7 0.25 142)",
                  color: "oklch(0.8 0.25 142)",
                  boxShadow: "0 0 16px oklch(0.7 0.25 142 / 0.4)",
                }
              : {
                  background: "oklch(0.35 0.15 85 / 0.2)",
                  border: "1.5px solid oklch(0.65 0.2 85)",
                  color: "oklch(0.8 0.18 85)",
                }
          }
        >
          {tournamentStarted ? "🟢 LIVE" : "⏳ UPCOMING"}
        </div>

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
          <p
            className="mt-1 font-body text-sm"
            style={{ color: "oklch(0.6 0.1 220)" }}
          >
            {filledSlots} of {data.maxSlots} slots filled
          </p>
        </div>

        {/* WhatsApp Banner */}
        <WhatsAppBanner />

        {/* Progress */}
        <div className="mb-5 px-0">
          <Progress
            value={(filledSlots / data.maxSlots) * 100}
            className="h-1.5 bg-muted"
          />
        </div>

        {/* Slots Grid */}
        <div className="grid grid-cols-2 gap-3">
          {data.slots.map((slot, i) => {
            const isFilled = Boolean(slot.playerName);
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
                className={`rounded-xl p-3 text-left transition-all duration-200 border ${
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
            data-ocid="slots.dialog"
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
                data-ocid="slots.cancel_button"
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

          <div className="grid grid-cols-2 gap-3">
            {data.poll.options
              .filter((o) => o.text.trim())
              .map((option, i) => {
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
                    className={`relative overflow-hidden rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-200 ${
                      hasVoted
                        ? "cursor-default"
                        : "hover:scale-105 hover:brightness-110 active:scale-95"
                    }`}
                    style={{
                      minHeight: "100px",
                      padding: "16px 12px",
                      background: isVoted
                        ? "oklch(0.12 0.04 142 / 0.85)"
                        : "oklch(0.1 0.02 220 / 0.8)",
                      border: isVoted
                        ? "2px solid oklch(0.55 0.25 142)"
                        : "1.5px solid oklch(0.25 0.04 220 / 0.6)",
                      boxShadow: isVoted
                        ? "0 0 16px oklch(0.55 0.25 142 / 0.4), inset 0 0 20px oklch(0.4 0.2 142 / 0.15)"
                        : "none",
                    }}
                  >
                    {hasVoted && (
                      <div
                        className="absolute inset-0 rounded-2xl transition-all duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          background: isVoted
                            ? "oklch(0.45 0.2 142 / 0.2)"
                            : "oklch(0.35 0.05 220 / 0.15)",
                        }}
                      />
                    )}
                    <span
                      className="relative font-heading font-black text-sm uppercase tracking-wide leading-tight"
                      style={{
                        color: isVoted
                          ? "oklch(0.8 0.28 142)"
                          : "oklch(0.85 0.05 220)",
                      }}
                    >
                      {option.text}
                    </span>
                    {hasVoted && (
                      <span
                        className="relative mt-2 font-body font-bold text-xl leading-none"
                        style={{
                          color: isVoted
                            ? "oklch(0.75 0.28 142)"
                            : "oklch(0.45 0.05 220)",
                        }}
                      >
                        {pct}%
                      </span>
                    )}
                    {!hasVoted && (
                      <span
                        className="relative mt-1 font-body text-xs opacity-50"
                        style={{ color: "oklch(0.55 0.05 220)" }}
                      >
                        Tap to vote
                      </span>
                    )}
                  </button>
                );
              })}
          </div>

          {hasVoted && (
            <p
              className="text-center text-xs mt-4"
              style={{ color: "oklch(0.45 0.08 220)" }}
            >
              Total votes: {totalVotes}
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

// ─── Announcements Page ────────────────────────────────────────────────────────
function AnnouncementsPage({
  announcements,
}: {
  announcements: ReturnType<typeof useTournament>["announcements"];
}) {
  return (
    <div
      data-ocid="announcements.page"
      className="h-full overflow-y-auto scrollbar-hide"
    >
      <div className="p-4">
        <div className="mb-6 pt-2">
          <h2
            className="font-heading text-2xl font-black uppercase text-white"
            style={{ letterSpacing: "-0.01em" }}
          >
            Announcements
          </h2>
          <p
            className="mt-1 font-body text-sm"
            style={{ color: "oklch(0.6 0.1 220)" }}
          >
            Latest news and updates
          </p>
        </div>

        {announcements.length === 0 ? (
          <div
            data-ocid="announcements.empty_state"
            className="glass-card rounded-2xl p-8 text-center"
            style={{ border: "1px solid oklch(0.25 0.05 220 / 0.4)" }}
          >
            <MessageSquare
              className="w-12 h-12 mx-auto mb-3"
              style={{ color: "oklch(0.35 0.05 220)" }}
            />
            <p className="font-heading text-lg font-bold text-white/40">
              No announcements yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {announcements.map((ann, i) => (
              <div
                key={ann.id}
                data-ocid={`announcements.item.${i + 1}`}
                className="glass-card rounded-2xl p-4"
                style={{ border: "1px solid oklch(0.25 0.08 142 / 0.4)" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0 animate-pulse-neon"
                    style={{ background: "oklch(0.7 0.25 142)" }}
                  />
                  <div className="flex-1">
                    <h3
                      className="font-heading font-bold text-base"
                      style={{ color: "oklch(0.85 0.1 142)" }}
                    >
                      {ann.title}
                    </h3>
                    <p
                      className="font-body text-sm mt-1 leading-relaxed"
                      style={{ color: "oklch(0.7 0.05 220)" }}
                    >
                      {ann.message}
                    </p>
                    <p
                      className="text-xs mt-2"
                      style={{ color: "oklch(0.4 0.04 220)" }}
                    >
                      {formatDate(ann.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Rules Page ────────────────────────────────────────────────────────────────
function RulesPage({ rules }: { rules: string }) {
  return (
    <div
      data-ocid="rules.page"
      className="h-full overflow-y-auto scrollbar-hide"
    >
      <div className="p-4">
        <div className="mb-6 pt-2">
          <h2
            className="font-heading text-2xl font-black uppercase text-white"
            style={{ letterSpacing: "-0.01em" }}
          >
            Rules
          </h2>
          <p
            className="mt-1 font-body text-sm"
            style={{ color: "oklch(0.6 0.1 220)" }}
          >
            Tournament regulations
          </p>
        </div>

        <div
          className="glass-card rounded-2xl p-5"
          style={{ border: "1px solid oklch(0.25 0.05 220 / 0.5)" }}
        >
          {rules ? (
            <div className="flex flex-col gap-3">
              {rules
                .split("\n")
                .filter(Boolean)
                .map((rule, i) => (
                  <div
                    key={rule.slice(0, 20)}
                    className="flex gap-3 items-start"
                  >
                    <span
                      className="font-heading font-black text-sm mt-0.5 w-6 flex-shrink-0 text-center"
                      style={{ color: "oklch(0.6 0.2 85)" }}
                    >
                      {i + 1}
                    </span>
                    <p
                      className="font-body text-sm leading-relaxed flex-1"
                      style={{ color: "oklch(0.8 0.05 220)" }}
                    >
                      {rule.replace(/^\d+\.\s*/, "")}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <p
              className="text-center font-body text-sm"
              style={{ color: "oklch(0.4 0.04 220)" }}
            >
              No rules set yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Leaderboard Page ──────────────────────────────────────────────────────────
function LeaderboardPage({
  leaderboard,
}: {
  leaderboard: LeaderboardEntry[];
}) {
  const sorted = [...leaderboard].sort((a, b) => b.points - a.points);

  const rankColor = (rank: number) => {
    if (rank === 1) return "oklch(0.75 0.2 85)";
    if (rank === 2) return "oklch(0.72 0.05 240)";
    if (rank === 3) return "oklch(0.65 0.15 60)";
    return "oklch(0.55 0.05 220)";
  };

  const rankBg = (rank: number) => {
    if (rank === 1) return "oklch(0.12 0.06 85 / 0.6)";
    if (rank === 2) return "oklch(0.12 0.03 240 / 0.4)";
    if (rank === 3) return "oklch(0.12 0.05 60 / 0.4)";
    return "oklch(0.1 0.02 220 / 0.3)";
  };

  return (
    <div
      data-ocid="leaderboard.page"
      className="h-full overflow-y-auto scrollbar-hide"
    >
      <div className="p-4">
        <div className="mb-6 pt-2">
          <h2
            className="font-heading text-2xl font-black uppercase text-white"
            style={{ letterSpacing: "-0.01em" }}
          >
            Leaderboard
          </h2>
          <p
            className="mt-1 font-body text-sm"
            style={{ color: "oklch(0.6 0.1 220)" }}
          >
            Player rankings
          </p>
        </div>

        {sorted.length === 0 ? (
          <div
            data-ocid="leaderboard.empty_state"
            className="glass-card rounded-2xl p-8 text-center"
            style={{ border: "1px solid oklch(0.25 0.05 220 / 0.4)" }}
          >
            <BarChart3
              className="w-12 h-12 mx-auto mb-3"
              style={{ color: "oklch(0.35 0.05 220)" }}
            />
            <p className="font-heading text-lg font-bold text-white/40">
              No rankings yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((entry, i) => (
              <div
                key={entry.id}
                data-ocid={`leaderboard.item.${i + 1}`}
                className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{
                  background: rankBg(i + 1),
                  border: `1px solid ${rankColor(i + 1)}33`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-heading font-black text-sm flex-shrink-0"
                  style={{
                    background: rankBg(i + 1),
                    color: rankColor(i + 1),
                    border: `1px solid ${rankColor(i + 1)}55`,
                  }}
                >
                  {i + 1 <= 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                </div>
                <div className="flex-1">
                  <p
                    className="font-heading font-bold text-sm"
                    style={{ color: rankColor(i + 1) }}
                  >
                    {entry.playerName}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "oklch(0.45 0.04 220)" }}
                  >
                    W:{entry.wins} L:{entry.losses}
                  </p>
                </div>
                <div
                  className="font-heading font-black text-xl"
                  style={{ color: rankColor(i + 1) }}
                >
                  {entry.points}
                  <span
                    className="text-xs font-body ml-0.5"
                    style={{ color: "oklch(0.4 0.04 220)" }}
                  >
                    pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Match Results Page ────────────────────────────────────────────────────────
function MatchResultsPage({
  matchResults,
}: {
  matchResults: MatchResult[];
}) {
  return (
    <div
      data-ocid="results.page"
      className="h-full overflow-y-auto scrollbar-hide"
    >
      <div className="p-4">
        <div className="mb-6 pt-2">
          <h2
            className="font-heading text-2xl font-black uppercase text-white"
            style={{ letterSpacing: "-0.01em" }}
          >
            Match Results
          </h2>
          <p
            className="mt-1 font-body text-sm"
            style={{ color: "oklch(0.6 0.1 220)" }}
          >
            {matchResults.length} matches played
          </p>
        </div>

        {matchResults.length === 0 ? (
          <div
            data-ocid="results.empty_state"
            className="glass-card rounded-2xl p-8 text-center"
            style={{ border: "1px solid oklch(0.25 0.05 220 / 0.4)" }}
          >
            <Swords
              className="w-12 h-12 mx-auto mb-3"
              style={{ color: "oklch(0.35 0.05 220)" }}
            />
            <p className="font-heading text-lg font-bold text-white/40">
              No results yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {[...matchResults].reverse().map((result, i) => {
              const p1Won = result.score1 > result.score2;
              const p2Won = result.score2 > result.score1;
              const ocidIndex = i + 1;
              return (
                <div
                  key={result.id}
                  data-ocid={`results.item.${ocidIndex}`}
                  className="glass-card rounded-2xl p-4"
                  style={{ border: "1px solid oklch(0.22 0.05 220 / 0.5)" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`flex-1 text-right font-heading font-bold text-sm ${
                        p1Won ? "" : ""
                      }`}
                      style={{
                        color: p1Won
                          ? "oklch(0.7 0.25 142)"
                          : "oklch(0.6 0.05 220)",
                      }}
                    >
                      {result.player1}
                    </div>
                    <div
                      className="flex items-center gap-2 px-3 py-1 rounded-lg"
                      style={{ background: "oklch(0.1 0.03 220)" }}
                    >
                      <span
                        className="font-heading font-black text-lg"
                        style={{
                          color: p1Won
                            ? "oklch(0.7 0.25 142)"
                            : "oklch(0.55 0.05 220)",
                        }}
                      >
                        {result.score1}
                      </span>
                      <span
                        className="font-body text-xs"
                        style={{ color: "oklch(0.35 0.03 220)" }}
                      >
                        –
                      </span>
                      <span
                        className="font-heading font-black text-lg"
                        style={{
                          color: p2Won
                            ? "oklch(0.7 0.25 142)"
                            : "oklch(0.55 0.05 220)",
                        }}
                      >
                        {result.score2}
                      </span>
                    </div>
                    <div
                      className="flex-1 font-heading font-bold text-sm"
                      style={{
                        color: p2Won
                          ? "oklch(0.7 0.25 142)"
                          : "oklch(0.6 0.05 220)",
                      }}
                    >
                      {result.player2}
                    </div>
                  </div>
                  <p
                    className="text-center text-xs mt-2"
                    style={{ color: "oklch(0.35 0.04 220)" }}
                  >
                    {formatDate(result.date)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bracket Page ──────────────────────────────────────────────────────────────
function BracketPage({
  bracketMatches,
}: {
  bracketMatches: BracketMatch[];
}) {
  const rounds = Array.from(new Set(bracketMatches.map((m) => m.round))).sort(
    (a, b) => a - b,
  );

  const roundLabel = (round: number, totalRounds: number) => {
    const fromEnd = totalRounds - round;
    if (fromEnd === 0) return "Final";
    if (fromEnd === 1) return "Semi-Final";
    if (fromEnd === 2) return "Quarter-Final";
    return `Round ${round}`;
  };

  return (
    <div
      data-ocid="bracket.page"
      className="h-full overflow-y-auto scrollbar-hide"
    >
      <div className="p-4">
        <div className="mb-6 pt-2">
          <h2
            className="font-heading text-2xl font-black uppercase text-white"
            style={{ letterSpacing: "-0.01em" }}
          >
            Knockout Bracket
          </h2>
          <p
            className="mt-1 font-body text-sm"
            style={{ color: "oklch(0.6 0.1 220)" }}
          >
            Tournament bracket
          </p>
        </div>

        {bracketMatches.length === 0 ? (
          <div
            data-ocid="bracket.empty_state"
            className="glass-card rounded-2xl p-8 text-center"
            style={{ border: "1px solid oklch(0.25 0.05 220 / 0.4)" }}
          >
            <Swords
              className="w-12 h-12 mx-auto mb-3"
              style={{ color: "oklch(0.35 0.05 220)" }}
            />
            <p className="font-heading text-lg font-bold text-white/40">
              Bracket not set up yet
            </p>
            <p
              className="font-body text-sm mt-1"
              style={{ color: "oklch(0.35 0.05 220)" }}
            >
              Admin will configure the bracket soon
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {rounds.map((round) => {
              const roundMatches = bracketMatches
                .filter((m) => m.round === round)
                .sort((a, b) => a.position - b.position);
              return (
                <div key={round}>
                  <div
                    className="text-xs font-heading font-bold uppercase tracking-widest mb-3"
                    style={{ color: "oklch(0.6 0.15 85)" }}
                  >
                    {roundLabel(round, rounds.length)}
                  </div>
                  <div className="flex flex-col gap-2">
                    {roundMatches.map((match, mi) => (
                      <div
                        key={match.id}
                        data-ocid={`bracket.item.${mi + 1}`}
                        className="glass-card rounded-xl overflow-hidden"
                        style={{
                          border: "1px solid oklch(0.22 0.05 220 / 0.5)",
                        }}
                      >
                        {[match.player1, match.player2].map((player, pi) => {
                          const isWinner = player && player === match.winner;
                          const isLoser =
                            match.winner && player && player !== match.winner;
                          return (
                            <div
                              key={pi === 0 ? "player1" : "player2"}
                              className={`flex items-center px-4 py-2.5 ${
                                pi === 0 ? "border-b" : ""
                              }`}
                              style={{
                                borderColor: "oklch(0.18 0.04 220 / 0.5)",
                                background: isWinner
                                  ? "oklch(0.12 0.05 142 / 0.5)"
                                  : "transparent",
                              }}
                            >
                              <span
                                className="flex-1 font-heading font-bold text-sm"
                                style={{
                                  color: isWinner
                                    ? "oklch(0.7 0.25 142)"
                                    : isLoser
                                      ? "oklch(0.35 0.04 220)"
                                      : player
                                        ? "oklch(0.75 0.05 220)"
                                        : "oklch(0.3 0.03 220)",
                                }}
                              >
                                {player || "TBD"}
                              </span>
                              {isWinner && (
                                <Badge
                                  className="text-xs"
                                  style={{
                                    background: "oklch(0.45 0.25 142 / 0.3)",
                                    color: "oklch(0.7 0.25 142)",
                                    border:
                                      "1px solid oklch(0.5 0.2 142 / 0.4)",
                                  }}
                                >
                                  WIN
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
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
  announcements,
  rules,
  leaderboard,
  matchResults,
  bracketMatches,
  onClose,
  onUpdateSettings,
  onUpdateSlot,
  onClearSlot,
  onUpdatePoll,
  onResetVotes,
  onUpdateWinners,
  onUpdateTheme,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onUpdateRules,
  onUpdateLeaderboard,
  onAddMatchResult,
  onDeleteMatchResult,
  onUpdateBracket,
  onStartTournament,
  onStopTournament,
  tournamentStarted,
}: {
  data: ReturnType<typeof useTournament>["data"];
  announcements: ReturnType<typeof useTournament>["announcements"];
  rules: string;
  leaderboard: LeaderboardEntry[];
  matchResults: MatchResult[];
  bracketMatches: BracketMatch[];
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
  onAddAnnouncement: ReturnType<typeof useTournament>["addAnnouncement"];
  onDeleteAnnouncement: ReturnType<typeof useTournament>["deleteAnnouncement"];
  onUpdateRules: ReturnType<typeof useTournament>["updateRules"];
  onUpdateLeaderboard: ReturnType<typeof useTournament>["updateLeaderboard"];
  onAddMatchResult: ReturnType<typeof useTournament>["addMatchResult"];
  onDeleteMatchResult: ReturnType<typeof useTournament>["deleteMatchResult"];
  onUpdateBracket: ReturnType<typeof useTournament>["updateBracket"];
  onStartTournament: () => void;
  onStopTournament: () => void;
  tournamentStarted: boolean;
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

  // Announcement state
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");

  // Rules state
  const [rulesText, setRulesText] = useState(rules);

  // Leaderboard state
  const [lbEntries, setLbEntries] = useState<LeaderboardEntry[]>(leaderboard);

  // Match result state
  const [mr_p1, setMrP1] = useState("");
  const [mr_p2, setMrP2] = useState("");
  const [mr_s1, setMrS1] = useState("0");
  const [mr_s2, setMrS2] = useState("0");

  // Bracket state
  const [bracketEntries, setBracketEntries] =
    useState<BracketMatch[]>(bracketMatches);

  const fileInputRef = useRef<{ [k: string]: HTMLInputElement | null }>({});

  const handleAuth = () => {
    if (pw === "suraj121") {
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
    onUpdatePoll({
      question: pollQ,
      options: pollOpts.filter((o) => o.text.trim()),
    });
    toast.success("Poll updated!");
  };

  const _addPollOption = () => {
    const nextId = Math.max(0, ...pollOpts.map((o) => o.id)) + 1;
    setPollOpts((prev) => [...prev, { id: nextId, text: "", votes: 0 }]);
  };

  const _removePollOption = (id: number) => {
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

  const postAnnouncement = () => {
    if (!annTitle.trim() || !annMessage.trim()) {
      toast.error("Enter both title and message");
      return;
    }
    onAddAnnouncement(annTitle.trim(), annMessage.trim());
    setAnnTitle("");
    setAnnMessage("");
    toast.success("Announcement posted!");
  };

  const saveRules = () => {
    onUpdateRules(rulesText);
    toast.success("Rules saved!");
  };

  const saveLeaderboard = () => {
    onUpdateLeaderboard(lbEntries.filter((e) => e.playerName.trim()));
    toast.success("Leaderboard saved!");
  };

  const addLbEntry = () => {
    setLbEntries((prev) => [
      ...prev,
      { id: Date.now(), playerName: "", points: 0, wins: 0, losses: 0 },
    ]);
  };

  const addMatchResult = () => {
    if (!mr_p1.trim() || !mr_p2.trim()) {
      toast.error("Enter both player names");
      return;
    }
    onAddMatchResult(
      mr_p1.trim(),
      mr_p2.trim(),
      Number(mr_s1) || 0,
      Number(mr_s2) || 0,
    );
    setMrP1("");
    setMrP2("");
    setMrS1("0");
    setMrS2("0");
    toast.success("Result added!");
  };

  const saveBracket = () => {
    onUpdateBracket(bracketEntries);
    toast.success("Bracket saved!");
  };

  const addBracketMatch = () => {
    const maxRound =
      bracketEntries.length > 0
        ? Math.max(...bracketEntries.map((m) => m.round))
        : 0;
    const sameRound = bracketEntries.filter((m) => m.round === maxRound);
    setBracketEntries((prev) => [
      ...prev,
      {
        id: Date.now(),
        round: maxRound + 1,
        position: sameRound.length + 1,
        player1: "",
        player2: "",
        winner: "",
      },
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
              data-ocid="admin.close_button"
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
          <button
            type="button"
            data-ocid="admin.back_button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors mr-1"
          >
            <ChevronLeft className="w-5 h-5 text-white/60" />
          </button>
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
          data-ocid="admin.close_button"
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
          {[
            "settings",
            "slots",
            "poll",
            "winners",
            "announce",
            "rules",
            "leaderboard",
            "results",
            "bracket",
            "themes",
          ].map((tab) => (
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
                data-ocid="admin.settings.input"
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

            {/* Tournament Start/Stop */}
            <div className="pt-2">
              <Label className="text-xs text-white/50 uppercase tracking-widest mb-2 block">
                Tournament Status
              </Label>
              <button
                type="button"
                data-ocid="admin.settings.start_button"
                onClick={
                  tournamentStarted ? onStopTournament : onStartTournament
                }
                className="w-full py-4 rounded-xl font-heading font-black uppercase text-base tracking-widest transition-all duration-200 active:scale-95"
                style={
                  tournamentStarted
                    ? {
                        background:
                          "linear-gradient(135deg, oklch(0.45 0.25 20) 0%, oklch(0.35 0.2 20) 100%)",
                        color: "oklch(0.95 0.05 20)",
                        boxShadow: "0 0 20px oklch(0.6 0.25 20 / 0.3)",
                      }
                    : {
                        background:
                          "linear-gradient(135deg, oklch(0.45 0.25 142) 0%, oklch(0.35 0.2 142) 100%)",
                        color: "oklch(0.95 0.05 142)",
                        boxShadow: "0 0 20px oklch(0.7 0.25 142 / 0.3)",
                      }
                }
              >
                {tournamentStarted ? "⏹ STOP TOURNAMENT" : "▶ START TOURNAMENT"}
              </button>
            </div>
          </TabsContent>

          {/* Slots Tab */}
          <TabsContent value="slots" className="p-4 mt-0">
            <div className="space-y-2">
              {data.slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-2 glass-card rounded-lg px-3 py-2"
                >
                  <span
                    className="text-xs font-body"
                    style={{ color: "oklch(0.45 0.05 220)" }}
                  >
                    #{slot.id}
                  </span>
                  <Input
                    className="flex-1 h-8 text-sm bg-transparent border-0 border-b rounded-none px-1"
                    value={slot.playerName}
                    placeholder="Empty"
                    onChange={(e) => onUpdateSlot(slot.id, e.target.value)}
                  />
                  {slot.playerName && (
                    <button
                      type="button"
                      onClick={() => onClearSlot(slot.id)}
                      className="text-white/30 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
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
            <div>
              <Label className="text-xs text-white/50 uppercase tracking-widest mb-2 block">
                Options (4×3 Grid)
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 12 }, (_, i) => {
                  const opt = pollOpts[i];
                  return (
                    <div
                      key={
                        [
                          "b0",
                          "b1",
                          "b2",
                          "b3",
                          "b4",
                          "b5",
                          "b6",
                          "b7",
                          "b8",
                          "b9",
                          "b10",
                          "b11",
                        ][i]
                      }
                      className="rounded-xl p-2 border text-xs flex flex-col gap-1"
                      style={{
                        background: "oklch(0.1 0.03 220)",
                        borderColor: "oklch(0.25 0.05 220)",
                      }}
                    >
                      <span className="text-white/30 font-heading font-bold text-center">
                        {i + 1}
                      </span>
                      <Input
                        data-ocid={`admin.poll.option.${i + 1}`}
                        value={opt ? opt.text : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPollOpts((prev) => {
                            const arr = [...prev];
                            if (arr[i]) {
                              arr[i] = { ...arr[i], text: val };
                            } else {
                              const nextId =
                                Math.max(0, ...arr.map((o) => o.id)) + 1;
                              arr[i] = { id: nextId, text: val, votes: 0 };
                            }
                            return arr;
                          });
                        }}
                        className="h-8 text-xs bg-transparent border-0 border-b rounded-none px-1 text-center"
                        placeholder="..."
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                data-ocid="admin.poll.save_button"
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
                variant="ghost"
                onClick={onResetVotes}
                className="flex-1 text-xs text-white/40"
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
                  <div className="text-xs text-white/40 uppercase tracking-widest">
                    Place #{w.place}
                  </div>
                  <Input
                    placeholder="Player name"
                    value={w.playerName}
                    onChange={(e) =>
                      setWinners((prev) =>
                        prev.map((winner, idx) =>
                          idx === i
                            ? { ...winner, playerName: e.target.value }
                            : winner,
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
                        prev.map((winner, idx) =>
                          idx === i
                            ? { ...winner, prize: e.target.value }
                            : winner,
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
                className="w-full text-xs text-white/40"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Place
              </Button>
            </div>
            <Button
              data-ocid="admin.winners.save_button"
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

          {/* Announcements Tab */}
          <TabsContent value="announce" className="p-4 space-y-4 mt-0">
            <div
              className="glass-card rounded-xl p-4 space-y-3"
              style={{ border: "1px solid oklch(0.25 0.08 142 / 0.3)" }}
            >
              <Label className="text-xs text-white/50 uppercase tracking-widest block">
                New Announcement
              </Label>
              <Input
                data-ocid="admin.announce.input"
                placeholder="Title"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="bg-muted border-border"
              />
              <Textarea
                data-ocid="admin.announce.textarea"
                placeholder="Message..."
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                className="bg-muted border-border resize-none"
                rows={3}
              />
              <Button
                data-ocid="admin.announce.submit_button"
                onClick={postAnnouncement}
                className="w-full font-heading font-bold uppercase text-xs"
                style={{
                  background: "oklch(0.45 0.2 142)",
                  color: "oklch(0.95 0.05 142)",
                }}
              >
                POST ANNOUNCEMENT
              </Button>
            </div>

            {/* Existing announcements */}
            <div className="space-y-2">
              {announcements.map((ann, i) => (
                <div
                  key={ann.id}
                  className="flex items-start gap-2 glass-card rounded-lg px-3 py-2"
                >
                  <div className="flex-1">
                    <p className="text-sm font-heading font-bold text-white/70">
                      {ann.title}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {ann.message.slice(0, 60)}
                      {ann.message.length > 60 ? "..." : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    data-ocid={`admin.announce.delete_button.${i + 1}`}
                    onClick={() => onDeleteAnnouncement(ann.id)}
                    className="text-white/20 hover:text-red-400 transition-colors mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-xs text-center text-white/30 py-4">
                  No announcements yet
                </p>
              )}
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="p-4 space-y-4 mt-0">
            <Label className="text-xs text-white/50 uppercase tracking-widest block">
              Tournament Rules (one per line)
            </Label>
            <Textarea
              data-ocid="admin.rules.textarea"
              value={rulesText}
              onChange={(e) => setRulesText(e.target.value)}
              className="bg-muted border-border resize-none font-body text-sm"
              rows={12}
              placeholder="Enter each rule on a new line..."
            />
            <Button
              data-ocid="admin.rules.save_button"
              onClick={saveRules}
              className="w-full font-heading font-bold uppercase"
              style={{
                background: "oklch(0.45 0.2 85)",
                color: "oklch(0.95 0.05 85)",
              }}
            >
              SAVE RULES
            </Button>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="p-4 space-y-4 mt-0">
            <div className="space-y-2">
              {lbEntries.map((entry, i) => (
                <div
                  key={entry.id}
                  className="glass-card rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Player name"
                      value={entry.playerName}
                      onChange={(e) =>
                        setLbEntries((prev) =>
                          prev.map((en, idx) =>
                            idx === i
                              ? { ...en, playerName: e.target.value }
                              : en,
                          ),
                        )
                      }
                      className="flex-1 bg-muted border-border"
                    />
                    <button
                      type="button"
                      data-ocid={`admin.leaderboard.delete_button.${i + 1}`}
                      onClick={() =>
                        setLbEntries((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                      className="text-white/20 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-white/30 block mb-1">
                        Points
                      </Label>
                      <Input
                        type="number"
                        value={entry.points}
                        onChange={(e) =>
                          setLbEntries((prev) =>
                            prev.map((en, idx) =>
                              idx === i
                                ? { ...en, points: Number(e.target.value) || 0 }
                                : en,
                            ),
                          )
                        }
                        className="bg-muted border-border text-sm h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-white/30 block mb-1">
                        Wins
                      </Label>
                      <Input
                        type="number"
                        value={entry.wins}
                        onChange={(e) =>
                          setLbEntries((prev) =>
                            prev.map((en, idx) =>
                              idx === i
                                ? { ...en, wins: Number(e.target.value) || 0 }
                                : en,
                            ),
                          )
                        }
                        className="bg-muted border-border text-sm h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-white/30 block mb-1">
                        Losses
                      </Label>
                      <Input
                        type="number"
                        value={entry.losses}
                        onChange={(e) =>
                          setLbEntries((prev) =>
                            prev.map((en, idx) =>
                              idx === i
                                ? {
                                    ...en,
                                    losses: Number(e.target.value) || 0,
                                  }
                                : en,
                            ),
                          )
                        }
                        className="bg-muted border-border text-sm h-8"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="ghost"
                data-ocid="admin.leaderboard.button"
                onClick={addLbEntry}
                className="w-full text-xs text-white/40"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Player
              </Button>
            </div>
            <Button
              data-ocid="admin.leaderboard.save_button"
              onClick={saveLeaderboard}
              className="w-full font-heading font-bold uppercase"
              style={{
                background: "oklch(0.45 0.2 85)",
                color: "oklch(0.95 0.05 85)",
              }}
            >
              SAVE LEADERBOARD
            </Button>
          </TabsContent>

          {/* Match Results Tab */}
          <TabsContent value="results" className="p-4 space-y-4 mt-0">
            <div
              className="glass-card rounded-xl p-4 space-y-3"
              style={{ border: "1px solid oklch(0.25 0.05 220 / 0.3)" }}
            >
              <Label className="text-xs text-white/50 uppercase tracking-widest block">
                Add Result
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  data-ocid="admin.results.input"
                  placeholder="Player 1"
                  value={mr_p1}
                  onChange={(e) => setMrP1(e.target.value)}
                  className="bg-muted border-border"
                />
                <Input
                  placeholder="Player 2"
                  value={mr_p2}
                  onChange={(e) => setMrP2(e.target.value)}
                  className="bg-muted border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-white/30 block mb-1">
                    Score 1
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={mr_s1}
                    onChange={(e) => setMrS1(e.target.value)}
                    className="bg-muted border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs text-white/30 block mb-1">
                    Score 2
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={mr_s2}
                    onChange={(e) => setMrS2(e.target.value)}
                    className="bg-muted border-border"
                  />
                </div>
              </div>
              <Button
                data-ocid="admin.results.submit_button"
                onClick={addMatchResult}
                className="w-full font-heading font-bold uppercase text-xs"
                style={{
                  background: "oklch(0.45 0.2 85)",
                  color: "oklch(0.95 0.05 85)",
                }}
              >
                ADD RESULT
              </Button>
            </div>

            {/* Existing results */}
            <div className="space-y-2">
              {matchResults.map((result, i) => (
                <div
                  key={result.id}
                  className="flex items-center gap-2 glass-card rounded-lg px-3 py-2"
                >
                  <span className="flex-1 text-xs text-white/60">
                    {result.player1} {result.score1}–{result.score2}{" "}
                    {result.player2}
                  </span>
                  <button
                    type="button"
                    data-ocid={`admin.results.delete_button.${i + 1}`}
                    onClick={() => onDeleteMatchResult(result.id)}
                    className="text-white/20 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {matchResults.length === 0 && (
                <p className="text-xs text-center text-white/30 py-4">
                  No results yet
                </p>
              )}
            </div>
          </TabsContent>

          {/* Bracket Tab */}
          <TabsContent value="bracket" className="p-4 space-y-4 mt-0">
            <div className="space-y-3">
              {bracketEntries.map((match, i) => (
                <div
                  key={match.id}
                  className="glass-card rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40 uppercase tracking-widest">
                      Round {match.round} · Match {match.position}
                    </span>
                    <button
                      type="button"
                      data-ocid={`admin.bracket.delete_button.${i + 1}`}
                      onClick={() =>
                        setBracketEntries((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                      className="text-white/20 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-white/30 mb-1 block">
                        Round
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={match.round}
                        onChange={(e) =>
                          setBracketEntries((prev) =>
                            prev.map((m, idx) =>
                              idx === i
                                ? { ...m, round: Number(e.target.value) || 1 }
                                : m,
                            ),
                          )
                        }
                        className="bg-muted border-border text-sm h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-white/30 mb-1 block">
                        Position
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={match.position}
                        onChange={(e) =>
                          setBracketEntries((prev) =>
                            prev.map((m, idx) =>
                              idx === i
                                ? {
                                    ...m,
                                    position: Number(e.target.value) || 1,
                                  }
                                : m,
                            ),
                          )
                        }
                        className="bg-muted border-border text-sm h-8"
                      />
                    </div>
                  </div>
                  <Input
                    placeholder="Player 1"
                    value={match.player1}
                    onChange={(e) =>
                      setBracketEntries((prev) =>
                        prev.map((m, idx) =>
                          idx === i ? { ...m, player1: e.target.value } : m,
                        ),
                      )
                    }
                    className="bg-muted border-border"
                  />
                  <Input
                    placeholder="Player 2"
                    value={match.player2}
                    onChange={(e) =>
                      setBracketEntries((prev) =>
                        prev.map((m, idx) =>
                          idx === i ? { ...m, player2: e.target.value } : m,
                        ),
                      )
                    }
                    className="bg-muted border-border"
                  />
                  <Input
                    placeholder="Winner (leave blank if not played)"
                    value={match.winner}
                    onChange={(e) =>
                      setBracketEntries((prev) =>
                        prev.map((m, idx) =>
                          idx === i ? { ...m, winner: e.target.value } : m,
                        ),
                      )
                    }
                    className="bg-muted border-border"
                  />
                </div>
              ))}
              <Button
                variant="ghost"
                data-ocid="admin.bracket.button"
                onClick={addBracketMatch}
                className="w-full text-xs text-white/40"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Match
              </Button>
            </div>
            <Button
              data-ocid="admin.bracket.save_button"
              onClick={saveBracket}
              className="w-full font-heading font-bold uppercase"
              style={{
                background: "oklch(0.45 0.2 85)",
                color: "oklch(0.95 0.05 85)",
              }}
            >
              SAVE BRACKET
            </Button>
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="p-4 space-y-4 mt-0">
            {(["home", "slots", "poll"] as const).map((section) => (
              <div key={section}>
                <Label className="text-xs text-white/50 uppercase tracking-widest mb-2 block">
                  {section} Background
                </Label>
                <button
                  type="button"
                  className="glass-card rounded-xl p-3 flex items-center gap-3 cursor-pointer w-full text-left"
                  onClick={() => fileInputRef.current[section]?.click()}
                  onKeyDown={(e) =>
                    e.key === "Enter" && fileInputRef.current[section]?.click()
                  }
                >
                  <div
                    className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                    style={{
                      background: data.themes[section]
                        ? `url(${data.themes[section]}) center/cover`
                        : "oklch(0.15 0.03 220)",
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-heading font-bold text-white/70">
                      {data.themes[section] ? "Change Image" : "Upload Image"}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">
                      Tap to select from gallery
                    </p>
                  </div>
                  <Upload className="w-4 h-4 text-white/30" />
                  <input
                    data-ocid={`admin.themes.${section}.upload_button`}
                    ref={(el) => {
                      fileInputRef.current[section] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(section, file);
                    }}
                  />
                </button>
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
    {
      id: "leaderboard",
      label: "Rank",
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      id: "results",
      label: "Results",
      icon: <Swords className="w-5 h-5" />,
    },
    {
      id: "announcements",
      label: "News",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    { id: "rules", label: "Rules", icon: <BookOpen className="w-5 h-5" /> },
    {
      id: "bracket",
      label: "Bracket",
      icon: <Swords className="w-5 h-5" />,
    },
    { id: "winner", label: "Winner", icon: <Shield className="w-5 h-5" /> },
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
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activePage === tab.id;
          const isExit = tab.id === "exit";
          return (
            <button
              type="button"
              key={tab.id}
              data-ocid={`nav.${tab.id}.link`}
              onClick={() => onNavigate(isExit ? "home" : (tab.id as Page))}
              className={`flex-shrink-0 flex flex-col items-center justify-center py-3 px-3 gap-1 transition-all duration-200 min-w-[60px] ${
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
    tournamentStarted,
  } = useTournament();

  const isHome = activePage === "home";

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return (
          <HomePage
            data={data}
            tournamentStarted={tournamentStarted}
            onJoin={() => setActivePage("slots")}
            onAdmin={() => setShowAdmin(true)}
          />
        );
      case "slots":
        return <SlotsPage data={data} onJoinSlot={joinSlot} />;
      case "poll":
        return <PollPage data={data} onVote={voteOnPoll} />;
      case "winner":
        return <WinnerPage data={data} />;
      case "announcements":
        return <AnnouncementsPage announcements={announcements} />;
      case "rules":
        return <RulesPage rules={rules} />;
      case "leaderboard":
        return <LeaderboardPage leaderboard={leaderboard} />;
      case "results":
        return <MatchResultsPage matchResults={matchResults} />;
      case "bracket":
        return <BracketPage bracketMatches={bracketMatches} />;
      default:
        return null;
    }
  };

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
        {renderPage()}
      </main>

      {/* Bottom nav — only show when not on home */}
      {!isHome && (
        <BottomNav activePage={activePage} onNavigate={setActivePage} />
      )}

      {/* Admin panel overlay */}
      {showAdmin && (
        <AdminPanel
          data={data}
          announcements={announcements}
          rules={rules}
          leaderboard={leaderboard}
          matchResults={matchResults}
          bracketMatches={bracketMatches}
          onClose={() => setShowAdmin(false)}
          onUpdateSettings={updateTournamentSettings}
          onUpdateSlot={updateSlot}
          onClearSlot={clearSlot}
          onUpdatePoll={updatePoll}
          onResetVotes={resetVotes}
          onUpdateWinners={updateWinners}
          onUpdateTheme={updateTheme}
          onAddAnnouncement={addAnnouncement}
          onDeleteAnnouncement={deleteAnnouncement}
          onUpdateRules={updateRules}
          onUpdateLeaderboard={updateLeaderboard}
          onAddMatchResult={addMatchResult}
          onDeleteMatchResult={deleteMatchResult}
          onUpdateBracket={updateBracket}
          onStartTournament={startTournament}
          onStopTournament={stopTournament}
          tournamentStarted={tournamentStarted}
        />
      )}

      {/* Footer */}
      <div
        className={`text-center py-2 text-xs ${
          isHome ? "absolute bottom-2 left-0 right-0 z-10" : ""
        }`}
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
