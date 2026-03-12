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
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { createActorWithConfig } from "@/config";
import {
  BarChart2,
  BookOpen,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  DollarSign,
  Edit2,
  GitBranch,
  Home,
  Loader2,
  Megaphone,
  MessageCircle,
  Play,
  Plus,
  RefreshCw,
  Settings,
  Swords,
  Trash2,
  Trophy,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
type Page =
  | "home"
  | "slots"
  | "polls"
  | "leaderboard"
  | "results"
  | "bracket"
  | "announcements"
  | "rules";
type TournamentStatus = "UPCOMING" | "ONGOING" | "COMPLETED";
type AdminTab =
  | "slots"
  | "polls"
  | "leaderboard"
  | "results"
  | "bracket"
  | "announcements"
  | "rules"
  | "themes";

interface Slot {
  id: number;
  player: string;
}

interface SlotRequest {
  id: number;
  playerName: string;
  slotNumber: number;
  whatsappNo?: string;
  status: string;
  submittedAt: bigint;
}

interface Poll {
  id: number;
  matchup: string;
}

interface LeaderboardRow {
  id: number;
  player: string;
  played: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  points: number;
}

interface MatchResult {
  id: number;
  team1: string;
  score1: number;
  score2: number;
  team2: string;
}

interface BracketSlot {
  id: number;
  team1: string;
  team2: string;
}

interface Bracket {
  qf: BracketSlot[];
  sf: BracketSlot[];
  final: BracketSlot;
}

interface Announcement {
  id: number;
  title: string;
  message: string;
  date: string;
}

interface TournamentSettings {
  entryFee: string;
  dateTime: string;
  status: string;
  maxSlots: number;
}

// ─── localStorage helpers (themes only) ──────────────────────────────────────
function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function saveLocal<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_SLOTS: Slot[] = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  player: "",
}));
const DEFAULT_BRACKET: Bracket = {
  qf: [
    { id: 1, team1: "", team2: "" },
    { id: 2, team1: "", team2: "" },
    { id: 3, team1: "", team2: "" },
    { id: 4, team1: "", team2: "" },
  ],
  sf: [
    { id: 1, team1: "", team2: "" },
    { id: 2, team1: "", team2: "" },
  ],
  final: { id: 1, team1: "", team2: "" },
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminPwError, setAdminPwError] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTab | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [actor, setActor] = useState<any>(null);

  // Shared state (backend-sourced)
  const [status, setStatus] = useState<TournamentStatus>("UPCOMING");
  const [entryFee, setEntryFee] = useState<string>("₹100");
  const [tournDate, setTournDate] = useState<string>("2026-04-01 18:00");
  const [maxSlots, setMaxSlots] = useState<number>(16);
  const [slots, setSlots] = useState<Slot[]>(DEFAULT_SLOTS);
  const [slotRequests, setSlotRequests] = useState<SlotRequest[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [bracket, setBracket] = useState<Bracket>(DEFAULT_BRACKET);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [rules, setRules] = useState<string>(
    "1. Each player must be present 5 minutes before their match.\n2. No disconnects allowed unless technical failure.\n3. Fair play is mandatory.\n4. Admin decisions are final.",
  );

  // Themes stored locally (base64 images)
  const [themeHome, setThemeHome] = useState<string>(() =>
    loadLocal("theme_home", ""),
  );
  const [themeSlots, setThemeSlots] = useState<string>(() =>
    loadLocal("theme_slots", ""),
  );
  const [themePolls, setThemePolls] = useState<string>(() =>
    loadLocal("theme_polls", ""),
  );
  const [themeLeaderboard, setThemeLeaderboard] = useState<string>(() =>
    loadLocal("theme_leaderboard", ""),
  );
  const [themeResults, setThemeResults] = useState<string>(() =>
    loadLocal("theme_results", ""),
  );

  useEffect(() => {
    saveLocal("theme_home", themeHome);
  }, [themeHome]);
  useEffect(() => {
    saveLocal("theme_slots", themeSlots);
  }, [themeSlots]);
  useEffect(() => {
    saveLocal("theme_polls", themePolls);
  }, [themePolls]);
  useEffect(() => {
    saveLocal("theme_leaderboard", themeLeaderboard);
  }, [themeLeaderboard]);
  useEffect(() => {
    saveLocal("theme_results", themeResults);
  }, [themeResults]);

  const [pollPrize, setPollPrize] = useState<string>(() =>
    loadLocal("poll_prize", ""),
  );
  useEffect(() => {
    saveLocal("poll_prize", pollPrize);
  }, [pollPrize]);

  const [quarterFinalPlayers, setQuarterFinalPlayers] = useState<number>(() =>
    loadLocal("qf_players", 8),
  );
  const [semiFinalPlayers, setSemiFinalPlayers] = useState<number>(() =>
    loadLocal("sf_players", 4),
  );
  useEffect(() => {
    saveLocal("qf_players", quarterFinalPlayers);
  }, [quarterFinalPlayers]);
  useEffect(() => {
    saveLocal("sf_players", semiFinalPlayers);
  }, [semiFinalPlayers]);

  // Initialize actor on mount
  useEffect(() => {
    createActorWithConfig()
      .then((a: any) => setActor(a))
      .catch(console.error);
  }, []);

  // ─── Fetch all data from backend ───────────────────────────────────────
  const fetchAll = useCallback(
    async (showToast = false) => {
      if (!actor) return;
      const act = actor;
      try {
        const [
          settingsRes,
          slotsRes,
          slotRequestsRes,
          pollsRes,
          leaderboardRes,
          resultsRes,
          bracketRes,
          announcementsRes,
          rulesRes,
        ] = await Promise.all([
          act.getSettings(),
          act.getSlots(),
          act.getSlotRequests(),
          act.getPolls(),
          act.getLeaderboard(),
          act.getMatchResults(),
          act.getBracket(),
          act.getAnnouncements(),
          act.getRules(),
        ]);

        const s = settingsRes as TournamentSettings;
        setStatus((s.status as TournamentStatus) || "UPCOMING");
        setEntryFee(s.entryFee || "₹100");
        setTournDate(s.dateTime || "2026-04-01 18:00");
        setMaxSlots(Number(s.maxSlots) || 16);

        const rawSlots = (
          slotsRes as Array<{ id: bigint; player: string }>
        ).map((sl) => ({ id: Number(sl.id), player: sl.player }));
        // Merge with default 16-slot grid
        const slotMap = new Map(rawSlots.map((sl) => [sl.id, sl.player]));
        const n = Number(s.maxSlots) || 16;
        const merged: Slot[] = Array.from({ length: n }, (_, i) => ({
          id: i + 1,
          player: slotMap.get(i + 1) || "",
        }));
        setSlots(merged);

        setSlotRequests(
          (
            slotRequestsRes as Array<{
              id: bigint;
              playerName: string;
              slotNumber: bigint;
              status: string;
              submittedAt: bigint;
            }>
          ).map((r) => ({
            id: Number(r.id),
            playerName: r.playerName,
            slotNumber: Number(r.slotNumber),
            status: r.status,
            submittedAt: r.submittedAt,
          })),
        );

        setPolls(
          (pollsRes as Array<{ id: bigint; matchup: string }>).map((p) => ({
            id: Number(p.id),
            matchup: p.matchup,
          })),
        );

        setLeaderboard(
          (
            leaderboardRes as Array<{
              id: bigint;
              player: string;
              played: bigint;
              w: bigint;
              d: bigint;
              l: bigint;
              gf: bigint;
              ga: bigint;
              points: bigint;
            }>
          ).map((r) => ({
            id: Number(r.id),
            player: r.player,
            played: Number(r.played),
            w: Number(r.w),
            d: Number(r.d),
            l: Number(r.l),
            gf: Number(r.gf),
            ga: Number(r.ga),
            points: Number(r.points),
          })),
        );

        setResults(
          (
            resultsRes as Array<{
              id: bigint;
              team1: string;
              score1: bigint;
              score2: bigint;
              team2: string;
            }>
          ).map((r) => ({
            id: Number(r.id),
            team1: r.team1,
            score1: Number(r.score1),
            score2: Number(r.score2),
            team2: r.team2,
          })),
        );

        const br = bracketRes as {
          qf: Array<{ id: bigint; team1: string; team2: string }>;
          sf: Array<{ id: bigint; team1: string; team2: string }>;
          final: { id: bigint; team1: string; team2: string };
        };
        setBracket({
          qf:
            br.qf.length > 0
              ? br.qf.map((b) => ({
                  id: Number(b.id),
                  team1: b.team1,
                  team2: b.team2,
                }))
              : DEFAULT_BRACKET.qf,
          sf:
            br.sf.length > 0
              ? br.sf.map((b) => ({
                  id: Number(b.id),
                  team1: b.team1,
                  team2: b.team2,
                }))
              : DEFAULT_BRACKET.sf,
          final: {
            id: Number(br.final.id),
            team1: br.final.team1,
            team2: br.final.team2,
          },
        });

        setAnnouncements(
          (
            announcementsRes as Array<{
              id: bigint;
              title: string;
              message: string;
              date: string;
            }>
          ).map((a) => ({
            id: Number(a.id),
            title: a.title,
            message: a.message,
            date: a.date,
          })),
        );

        if (rulesRes) setRules(rulesRes as string);

        if (showToast) toast.success("Data refreshed");
      } catch {
        console.error("Failed to fetch data");
        if (showToast) toast.error("Failed to refresh data");
      } finally {
        setLoading(false);
      }
    },
    [actor],
  );

  // Initial fetch
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // 10-second polling
  useEffect(() => {
    const interval = setInterval(() => fetchAll(), 10000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ─── Admin actions ─────────────────────────────────────────────────────
  const handleAdminLogin = () => {
    if (adminPw === "suraj121") {
      setAdminLoggedIn(true);
      setAdminPwError(false);
      setAdminPw("");
      toast.success("Admin logged in");
    } else {
      setAdminPwError(true);
    }
  };

  const handleAdminLogout = () => {
    setAdminLoggedIn(false);
    setAdminTab(null);
    setAdminOpen(false);
    toast("Logged out");
  };

  const saveSettings = async (
    newFee: string,
    newDate: string,
    newStatus: TournamentStatus,
    newMaxSlots?: number,
  ) => {
    const act = actor;
    const slots_count = newMaxSlots ?? maxSlots;
    try {
      await act.updateSettings({
        entryFee: newFee,
        dateTime: newDate,
        status: newStatus,
        maxSlots: BigInt(slots_count),
      });
      setEntryFee(newFee);
      setTournDate(newDate);
      setStatus(newStatus);
      if (newMaxSlots !== undefined) setMaxSlots(newMaxSlots);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const advanceTournament = async () => {
    const next =
      status === "UPCOMING"
        ? "ONGOING"
        : status === "ONGOING"
          ? "COMPLETED"
          : "UPCOMING";
    await saveSettings(entryFee, tournDate, next);
    toast.success(`Tournament status: ${next}`);
  };

  const saveSlots = async (newSlots: Slot[]) => {
    const act = actor;
    try {
      const filled = newSlots.filter((s) => s.player);
      await act.setSlots(
        filled.map((s) => ({ id: BigInt(s.id), player: s.player })),
      );
      setSlots(newSlots);
      toast.success("Slots saved");
    } catch {
      toast.error("Failed to save slots");
    }
  };

  const approveRequest = async (requestId: number) => {
    const act = actor;
    try {
      await act.approveSlotRequest(BigInt(requestId));
      toast.success("Request approved");
      fetchAll();
    } catch {
      toast.error("Failed to approve request");
    }
  };

  const rejectRequest = async (requestId: number) => {
    const act = actor;
    try {
      await act.rejectSlotRequest(BigInt(requestId));
      toast.success("Request rejected");
      fetchAll();
    } catch {
      toast.error("Failed to reject request");
    }
  };

  const savePolls = async (newPolls: Poll[]) => {
    const act = actor;
    try {
      await act.setPolls(
        newPolls.map((p) => ({ id: BigInt(p.id), matchup: p.matchup })),
      );
      setPolls(newPolls);
      toast.success("Fixtures saved");
    } catch {
      toast.error("Failed to save fixtures");
    }
  };

  const saveLeaderboard = async (newLb: LeaderboardRow[]) => {
    const act = actor;
    try {
      await act.setLeaderboard(
        newLb.map((r) => ({
          id: BigInt(r.id),
          player: r.player,
          played: BigInt(r.played),
          w: BigInt(r.w),
          d: BigInt(r.d),
          l: BigInt(r.l),
          gf: BigInt(r.gf),
          ga: BigInt(r.ga),
          points: BigInt(r.points),
        })),
      );
      setLeaderboard(newLb);
    } catch {
      toast.error("Failed to save leaderboard");
    }
  };

  const saveResults = async (newResults: MatchResult[]) => {
    const act = actor;
    try {
      await act.setMatchResults(
        newResults.map((r) => ({
          id: BigInt(r.id),
          team1: r.team1,
          score1: BigInt(r.score1),
          score2: BigInt(r.score2),
          team2: r.team2,
        })),
      );
      setResults(newResults);
    } catch {
      toast.error("Failed to save results");
    }
  };

  const saveBracket = async (newBracket: Bracket) => {
    const act = actor;
    try {
      await act.setBracket({
        qf: newBracket.qf.map((b) => ({
          id: BigInt(b.id),
          team1: b.team1,
          team2: b.team2,
        })),
        sf: newBracket.sf.map((b) => ({
          id: BigInt(b.id),
          team1: b.team1,
          team2: b.team2,
        })),
        final: {
          id: BigInt(newBracket.final.id),
          team1: newBracket.final.team1,
          team2: newBracket.final.team2,
        },
      });
      setBracket(newBracket);
      toast.success("Bracket saved");
    } catch {
      toast.error("Failed to save bracket");
    }
  };

  const saveAnnouncements = async (newAnnouncements: Announcement[]) => {
    const act = actor;
    try {
      await act.setAnnouncements(
        newAnnouncements.map((a) => ({
          id: BigInt(a.id),
          title: a.title,
          message: a.message,
          date: a.date,
        })),
      );
      setAnnouncements(newAnnouncements);
    } catch {
      toast.error("Failed to save announcements");
    }
  };

  const saveRules = async (newRules: string) => {
    const act = actor;
    try {
      await act.setRules(newRules);
      setRules(newRules);
      toast.success("Rules saved");
    } catch {
      toast.error("Failed to save rules");
    }
  };

  const statusColor = {
    UPCOMING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    ONGOING: "bg-green-500/20 text-green-400 border-green-500/30",
    COMPLETED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  }[status];

  const navItems: { id: Page; icon: React.ElementType; label: string }[] = [
    { id: "home", icon: Home, label: "Home" },
    { id: "slots", icon: Users, label: "Slots" },
    { id: "polls", icon: Swords, label: "Polls" },
    { id: "leaderboard", icon: BarChart2, label: "Board" },
    { id: "results", icon: Trophy, label: "Results" },
    { id: "bracket", icon: GitBranch, label: "Bracket" },
    { id: "announcements", icon: Megaphone, label: "News" },
    { id: "rules", icon: BookOpen, label: "Rules" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Swords className="w-6 h-6 text-neon absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="font-heading text-neon text-glow-green text-lg tracking-widest uppercase">
          Loading...
        </p>
        <p className="text-xs text-muted-foreground">
          Connecting to tournament server
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col max-w-md mx-auto">
      <Toaster />
      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {page === "home" && (
          <HomePage
            status={status}
            statusColor={statusColor}
            entryFee={entryFee}
            tournDate={tournDate}
            themeHome={themeHome}
            onGearClick={() => setAdminOpen(true)}
            onRefresh={() => fetchAll(true)}
          />
        )}
        {page === "slots" && (
          <SlotsPage
            slots={slots}
            slotRequests={slotRequests}
            themeSlots={themeSlots}
            adminLoggedIn={adminLoggedIn}
            onSaveSlots={saveSlots}
          />
        )}
        {page === "polls" && (
          <PollsPage
            polls={polls}
            themePolls={themePolls}
            pollPrize={pollPrize}
          />
        )}
        {page === "leaderboard" && (
          <LeaderboardPage leaderboard={leaderboard} />
        )}
        {page === "results" && <ResultsPage results={results} />}
        {page === "bracket" && <BracketPage bracket={bracket} />}
        {page === "announcements" && (
          <AnnouncementsPage announcements={announcements} />
        )}
        {page === "rules" && <RulesPage rules={rules} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card/95 backdrop-blur border-t border-border z-50">
        <div className="flex overflow-x-auto scrollbar-hide">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              type="button"
              key={id}
              data-ocid={`nav.${id}.link`}
              onClick={() => setPage(id)}
              className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 min-w-[60px] transition-colors ${
                page === id
                  ? "text-neon"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Admin Dialog */}
      <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
        <DialogContent
          className="bg-card border-border max-w-xs mx-auto max-h-[85vh] overflow-y-auto"
          data-ocid="admin.dialog"
        >
          {!adminLoggedIn ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-neon">
                  Admin Login
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <Input
                  data-ocid="admin.input"
                  type="password"
                  placeholder="Password"
                  value={adminPw}
                  onChange={(e) => setAdminPw(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                  className={adminPwError ? "border-destructive" : ""}
                />
                {adminPwError && (
                  <p className="text-destructive text-sm">Incorrect password</p>
                )}
              </div>
              <DialogFooter>
                <Button
                  data-ocid="admin.submit_button"
                  onClick={handleAdminLogin}
                  className="bg-primary text-primary-foreground w-full"
                >
                  Login
                </Button>
              </DialogFooter>
            </>
          ) : adminTab === null ? (
            <AdminMenu
              status={status}
              onAdvance={advanceTournament}
              onSelectTab={setAdminTab}
              onLogout={handleAdminLogout}
            />
          ) : (
            <AdminTabPanel
              tab={adminTab}
              onBack={() => setAdminTab(null)}
              slots={slots}
              saveSlots={saveSlots}
              slotRequests={slotRequests}
              approveRequest={approveRequest}
              rejectRequest={rejectRequest}
              polls={polls}
              savePolls={savePolls}
              leaderboard={leaderboard}
              saveLeaderboard={saveLeaderboard}
              results={results}
              saveResults={saveResults}
              bracket={bracket}
              saveBracket={saveBracket}
              announcements={announcements}
              saveAnnouncements={saveAnnouncements}
              rules={rules}
              saveRules={saveRules}
              entryFee={entryFee}
              tournDate={tournDate}
              saveSettings={saveSettings}
              maxSlots={maxSlots}
              setMaxSlots={setMaxSlots}
              status={status}
              themeHome={themeHome}
              setThemeHome={setThemeHome}
              themeSlots={themeSlots}
              setThemeSlots={setThemeSlots}
              themePolls={themePolls}
              setThemePolls={setThemePolls}
              themeLeaderboard={themeLeaderboard}
              setThemeLeaderboard={setThemeLeaderboard}
              themeResults={themeResults}
              setThemeResults={setThemeResults}
              pollPrize={pollPrize}
              setPollPrize={setPollPrize}
              quarterFinalPlayers={quarterFinalPlayers}
              setQuarterFinalPlayers={setQuarterFinalPlayers}
              semiFinalPlayers={semiFinalPlayers}
              setSemiFinalPlayers={setSemiFinalPlayers}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({
  status,
  statusColor,
  entryFee,
  tournDate,
  themeHome,
  onGearClick,
  onRefresh,
}: {
  status: TournamentStatus;
  statusColor: string;
  entryFee: string;
  tournDate: string;
  themeHome: string;
  onGearClick: () => void;
  onRefresh: () => void;
}) {
  return (
    <div
      className="min-h-full relative"
      style={
        themeHome
          ? {
              backgroundImage: `url(${themeHome})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}
      }
    >
      {/* Hero */}
      <div
        className="relative h-56 flex items-end overflow-hidden"
        style={{
          backgroundImage:
            "url(/assets/generated/efootball-hero-bg.dim_1200x800.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
        <div className="relative z-10 w-full px-4 pb-4 flex items-end justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white text-shadow">
              eFootball
            </h1>
            <p className="font-heading text-sm text-neon text-glow-green tracking-widest uppercase">
              Tournament Hub
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="home.secondary_button"
              onClick={onRefresh}
              className="p-2 glass-card rounded-full text-muted-foreground hover:text-neon transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              data-ocid="home.open_modal_button"
              onClick={onGearClick}
              className="p-2 glass-card rounded-full text-muted-foreground hover:text-neon transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="px-4 py-4 space-y-3">
        <div className="glass-card rounded-xl p-4 flex items-center justify-between animate-fade-slide-up">
          <span className="text-muted-foreground text-sm">Status</span>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColor}`}
          >
            {status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-xl p-4 animate-fade-slide-up">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              Entry Fee
            </div>
            <p className="font-heading text-lg font-bold text-gold text-glow-gold">
              {entryFee}
            </p>
          </div>
          <div className="glass-card rounded-xl p-4 animate-fade-slide-up">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Calendar className="w-3.5 h-3.5" />
              Date
            </div>
            <p className="font-heading text-xs font-bold text-neon">
              {tournDate}
            </p>
          </div>
        </div>

        {/* WhatsApp Group */}
        <a
          href="https://chat.whatsapp.com/G8yA9aBWqRdE6V7cEpYAtJ?mode=hq1tcla"
          target="_blank"
          rel="noopener noreferrer"
          data-ocid="home.primary_button"
          className="flex items-center gap-3 glass-card rounded-xl p-4 border border-green-600/40 hover:border-green-500/60 transition-all animate-fade-slide-up"
        >
          <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="font-heading text-sm font-bold text-green-400">
              Join WhatsApp Group
            </p>
            <p className="text-xs text-muted-foreground">
              Click to join the tournament group
            </p>
          </div>
        </a>

        {/* About */}
        <div className="glass-card rounded-xl p-4 space-y-2 animate-fade-slide-up">
          <h2 className="font-heading text-sm font-bold text-gold">
            About Tournament
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Welcome to the eFootball Tournament Hub! Compete against players
            from across the country. Register, check your match schedule, and
            follow live results. May the best player win!
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="text-neon hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}

// ─── Slots Page ───────────────────────────────────────────────────────────────
function SlotsPage({
  slots,
  slotRequests,
  themeSlots,
  adminLoggedIn,
  onSaveSlots,
}: {
  slots: Slot[];
  slotRequests: SlotRequest[];
  themeSlots: string;
  adminLoggedIn: boolean;
  onSaveSlots: (s: Slot[]) => void;
}) {
  const [joinName, setJoinName] = useState("");
  const [joinWhatsApp, setJoinWhatsApp] = useState("");
  const [joinSlot, setJoinSlot] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  const emptySlots = slots.filter((s) => !s.player);
  const filled = slots.filter((s) => s.player).length;

  const handleSubmitRequest = async () => {
    if (!joinName.trim() || joinSlot === null) return;
    setSubmitting(true);
    try {
      await createActorWithConfig().then((a) =>
        (a as any).submitSlotRequest(joinName.trim(), BigInt(joinSlot)),
      );
      setSubmittedName(joinName.trim());
      setSubmitted(true);
      setJoinName("");
      setJoinWhatsApp("");
      setJoinSlot(null);
      toast.success("Request submitted! Waiting for admin approval.");
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminClearSlot = (id: number) => {
    const updated = slots.map((s) => (s.id === id ? { ...s, player: "" } : s));
    onSaveSlots(updated);
  };

  // Group requests for display
  const pendingForPlayer = slotRequests.filter((r) => r.status === "pending");

  return (
    <div
      className="min-h-full relative"
      style={
        themeSlots
          ? {
              backgroundImage: `url(${themeSlots})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}
      }
    >
      {themeSlots && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: "rgba(0,0,0,0.65)" }}
        />
      )}
      <div className={themeSlots ? "relative z-10" : ""}>
        <PageHeader
          title="Player Slots"
          subtitle={`${filled} / ${slots.length} registered`}
          icon={Users}
        />
        <div className="px-4 pb-6 space-y-4">
          {/* Contact */}
          <div className="glass-card rounded-xl p-4 space-y-2">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">
              Contact for Entry
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="https://wa.me/917002352569"
                target="_blank"
                rel="noreferrer"
                data-ocid="slots.primary_button"
                className="flex items-center gap-2 text-green-400 hover:text-green-300"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-bold">WhatsApp: 7002352569</span>
              </a>
              <a
                href="https://wa.me/917099127072"
                target="_blank"
                rel="noreferrer"
                data-ocid="slots.secondary_button"
                className="flex items-center gap-2 text-green-400 hover:text-green-300"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-bold">WhatsApp: 7099127072</span>
              </a>
            </div>
          </div>

          {/* Request a Slot */}
          {!submitted ? (
            <div className="glass-card rounded-xl p-4 space-y-3">
              <p className="font-heading text-sm font-bold text-neon">
                Request a Slot
              </p>
              <Input
                data-ocid="slots.input"
                placeholder="Your name"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
              />
              <Input
                data-ocid="slots.whatsapp_input"
                placeholder="WhatsApp number (optional)"
                value={joinWhatsApp}
                onChange={(e) => setJoinWhatsApp(e.target.value)}
                type="tel"
              />
              <select
                data-ocid="slots.select"
                value={joinSlot ?? ""}
                onChange={(e) => setJoinSlot(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
              >
                <option value="">Choose a slot number</option>
                {emptySlots.map((s) => (
                  <option key={s.id} value={s.id}>
                    Slot #{s.id}
                  </option>
                ))}
              </select>
              <Button
                data-ocid="slots.submit_button"
                onClick={handleSubmitRequest}
                disabled={submitting || !joinName.trim() || joinSlot === null}
                className="w-full bg-primary text-primary-foreground"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Request Slot
              </Button>
            </div>
          ) : (
            <div
              className="glass-card rounded-xl p-4 space-y-2 border border-amber-500/30"
              data-ocid="slots.success_state"
            >
              <div className="flex items-center gap-2 text-amber-400">
                <Clock className="w-4 h-4" />
                <p className="font-heading text-sm font-bold">
                  Request Pending
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-neon font-bold">{submittedName}</span>,
                your request is pending admin approval. Check back soon!
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmitted(false)}
                className="text-xs"
              >
                Submit another request
              </Button>
            </div>
          )}

          {/* Pending requests (visible to all) */}
          {pendingForPlayer.length > 0 && (
            <div className="glass-card rounded-xl p-4 space-y-2">
              <p className="font-heading text-xs font-bold text-amber-400 uppercase tracking-wide">
                Pending Approvals ({pendingForPlayer.length})
              </p>
              {pendingForPlayer.map((req, i) => (
                <div
                  key={req.id}
                  data-ocid={`slots.item.${i + 1}`}
                  className="flex items-center justify-between text-sm py-1 border-b border-border/30 last:border-0"
                >
                  <span className="font-bold text-foreground">
                    {req.playerName}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Slot #{req.slotNumber}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-amber-400 border-amber-500/30 text-xs"
                  >
                    Pending
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Slots grid */}
          <div className="grid grid-cols-2 gap-2">
            {slots.map((slot, i) => (
              <div
                key={slot.id}
                data-ocid={`slots.item.${i + 1}`}
                className={`relative rounded-xl p-3 min-h-[60px] flex items-center justify-between gap-2 ${
                  slot.player ? "slot-filled" : "slot-empty"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground font-mono w-5 flex-shrink-0">
                    #{slot.id}
                  </span>
                  {slot.player ? (
                    <span className="text-sm font-bold text-neon truncate">
                      {slot.player}
                    </span>
                  ) : (
                    <button
                      type="button"
                      data-ocid={`slots.edit_button.${i + 1}`}
                      onClick={() => setJoinSlot(slot.id)}
                      className="text-xs text-muted-foreground hover:text-neon transition-colors"
                    >
                      + Request
                    </button>
                  )}
                </div>
                {adminLoggedIn && slot.player && (
                  <button
                    type="button"
                    data-ocid={`slots.delete_button.${i + 1}`}
                    onClick={() => handleAdminClearSlot(slot.id)}
                    className="flex-shrink-0 p-1 rounded hover:bg-destructive/20 text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Polls Page ───────────────────────────────────────────────────────────────
function PollsPage({
  polls,
  themePolls,
  pollPrize,
}: { polls: Poll[]; themePolls: string; pollPrize: string }) {
  return (
    <div
      className="min-h-full"
      style={
        themePolls
          ? {
              backgroundImage: `url(${themePolls})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}
      }
    >
      <PageHeader
        title="Match Fixtures"
        subtitle="Current matchups"
        icon={Swords}
      />
      <div className="px-4 pb-6">
        {pollPrize && (
          <div
            data-ocid="polls.prize_section"
            className="mb-4 flex items-center justify-center gap-2 rounded-xl px-4 py-3 border border-yellow-500/40 bg-yellow-500/10 text-yellow-300 font-bold text-base shadow-lg"
          >
            <span className="text-xl">🏆</span>
            <span className="text-gold font-heading tracking-wide">
              Prize: {pollPrize}
            </span>
          </div>
        )}
        {polls.length === 0 ? (
          <EmptyState
            data-ocid="polls.empty_state"
            message="No matchups scheduled yet"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {polls.map((poll, i) => (
              <div
                key={poll.id}
                data-ocid={`polls.item.${i + 1}`}
                className="glass-card rounded-xl p-3 flex flex-col items-center gap-2 border-glow-green"
              >
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-bold">
                  Match {poll.id}
                </span>
                <div className="w-full text-center">
                  {poll.matchup.includes(" vs ") ? (
                    <>
                      <p className="text-sm font-bold text-neon text-glow-green truncate">
                        {poll.matchup.split(" vs ")[0]}
                      </p>
                      <p className="text-xs text-gold font-bold my-1">VS</p>
                      <p className="text-sm font-bold text-neon text-glow-green truncate">
                        {poll.matchup.split(" vs ")[1]}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-bold text-neon">
                      {poll.matchup}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Leaderboard Page ─────────────────────────────────────────────────────────
function LeaderboardPage({ leaderboard }: { leaderboard: LeaderboardRow[] }) {
  const sorted = [...leaderboard].sort(
    (a, b) => b.points - a.points || b.gf - b.ga - (a.gf - a.ga),
  );
  return (
    <div className="min-h-full">
      <PageHeader
        title="Leaderboard"
        subtitle="Season standings"
        icon={BarChart2}
      />
      <div className="px-2 pb-6">
        {sorted.length === 0 ? (
          <EmptyState
            data-ocid="leaderboard.empty_state"
            message="No standings yet"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs" data-ocid="leaderboard.table">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="py-2 px-2 text-left">#</th>
                  <th className="py-2 px-2 text-left">Player</th>
                  <th className="py-2 px-1 text-center">P</th>
                  <th className="py-2 px-1 text-center">W</th>
                  <th className="py-2 px-1 text-center">D</th>
                  <th className="py-2 px-1 text-center">L</th>
                  <th className="py-2 px-1 text-center">GF</th>
                  <th className="py-2 px-1 text-center">GA</th>
                  <th className="py-2 px-1 text-center">GD</th>
                  <th className="py-2 px-1 text-center font-bold text-gold">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => (
                  <tr
                    key={row.id}
                    data-ocid={`leaderboard.item.${i + 1}`}
                    className={`border-b border-border/50 ${
                      i === 0
                        ? "winner-gold"
                        : i === 1
                          ? "winner-silver"
                          : i === 2
                            ? "winner-bronze"
                            : ""
                    }`}
                  >
                    <td className="py-2 px-2 font-bold">{i + 1}</td>
                    <td className="py-2 px-2 font-bold text-neon">
                      {row.player}
                    </td>
                    <td className="py-2 px-1 text-center">{row.played}</td>
                    <td className="py-2 px-1 text-center text-green-400">
                      {row.w}
                    </td>
                    <td className="py-2 px-1 text-center">{row.d}</td>
                    <td className="py-2 px-1 text-center text-destructive">
                      {row.l}
                    </td>
                    <td className="py-2 px-1 text-center">{row.gf}</td>
                    <td className="py-2 px-1 text-center">{row.ga}</td>
                    <td className="py-2 px-1 text-center">{row.gf - row.ga}</td>
                    <td className="py-2 px-1 text-center font-bold text-gold">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Results Page ─────────────────────────────────────────────────────────────
function ResultsPage({ results }: { results: MatchResult[] }) {
  return (
    <div className="min-h-full">
      <PageHeader
        title="Match Results"
        subtitle="All completed matches"
        icon={Trophy}
      />
      <div className="px-4 pb-6 space-y-3">
        {results.length === 0 ? (
          <EmptyState
            data-ocid="results.empty_state"
            message="No results yet"
          />
        ) : (
          results.map((r, i) => (
            <div
              key={r.id}
              data-ocid={`results.item.${i + 1}`}
              className="glass-card rounded-xl p-4 flex items-center justify-between"
            >
              <span className="text-sm font-bold text-foreground flex-1 text-right">
                {r.team1}
              </span>
              <div className="flex items-center gap-2 px-4">
                <span className="font-heading text-xl font-bold text-neon text-glow-green">
                  {r.score1}
                </span>
                <span className="text-muted-foreground">—</span>
                <span className="font-heading text-xl font-bold text-neon text-glow-green">
                  {r.score2}
                </span>
              </div>
              <span className="text-sm font-bold text-foreground flex-1">
                {r.team2}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Bracket Page ─────────────────────────────────────────────────────────────
function BracketPage({ bracket }: { bracket: Bracket }) {
  const renderMatch = (slot: BracketSlot, index: number, round: string) => (
    <div
      key={`${round}-${index}`}
      className="glass-card rounded-xl p-3 border-glow-green"
    >
      <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-bold">
        {round} {index + 1}
      </div>
      <div className="space-y-1">
        <div
          className={`text-sm font-bold px-2 py-1 rounded ${slot.team1 ? "text-neon" : "text-muted-foreground/50"}`}
        >
          {slot.team1 || "TBD"}
        </div>
        <div className="text-center text-xs text-gold font-bold">VS</div>
        <div
          className={`text-sm font-bold px-2 py-1 rounded ${slot.team2 ? "text-neon" : "text-muted-foreground/50"}`}
        >
          {slot.team2 || "TBD"}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full">
      <PageHeader
        title="Knockout Bracket"
        subtitle="Tournament bracket"
        icon={GitBranch}
      />
      <div className="px-4 pb-6 space-y-6">
        <div>
          <h3 className="font-heading text-xs font-bold text-gold uppercase tracking-widest mb-3">
            Quarter-Finals
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {bracket.qf.map((slot, i) => renderMatch(slot, i, "QF"))}
          </div>
        </div>
        <div>
          <h3 className="font-heading text-xs font-bold text-gold uppercase tracking-widest mb-3">
            Semi-Finals
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {bracket.sf.map((slot, i) => renderMatch(slot, i, "SF"))}
          </div>
        </div>
        <div>
          <h3 className="font-heading text-xs font-bold text-gold uppercase tracking-widest mb-3">
            Final
          </h3>
          <div className="max-w-xs">
            {renderMatch(bracket.final, 0, "Final")}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Announcements Page ───────────────────────────────────────────────────────
function AnnouncementsPage({
  announcements,
}: { announcements: Announcement[] }) {
  return (
    <div className="min-h-full">
      <PageHeader
        title="Announcements"
        subtitle="Latest updates"
        icon={Megaphone}
      />
      <div className="px-4 pb-6 space-y-3">
        {announcements.length === 0 ? (
          <EmptyState
            data-ocid="announcements.empty_state"
            message="No announcements"
          />
        ) : (
          [...announcements].reverse().map((a, i) => (
            <div
              key={a.id}
              data-ocid={`announcements.item.${i + 1}`}
              className="glass-card rounded-xl p-4 border-l-2 border-neon animate-fade-slide-up"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading text-sm font-bold text-neon">
                  {a.title}
                </h3>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {a.date}
                </span>
              </div>
              <p className="text-sm text-foreground/80 mt-1 leading-relaxed">
                {a.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Rules Page ───────────────────────────────────────────────────────────────
function RulesPage({ rules }: { rules: string }) {
  return (
    <div className="min-h-full">
      <PageHeader
        title="Rules"
        subtitle="Tournament regulations"
        icon={BookOpen}
      />
      <div className="px-4 pb-6">
        <div className="glass-card rounded-xl p-4">
          {rules ? (
            <pre className="text-sm text-foreground/90 whitespace-pre-wrap font-body leading-relaxed">
              {rules}
            </pre>
          ) : (
            <p className="text-muted-foreground text-sm">No rules set yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Admin Menu ───────────────────────────────────────────────────────────────
function AdminMenu({
  status,
  onAdvance,
  onSelectTab,
  onLogout,
}: {
  status: TournamentStatus;
  onAdvance: () => void;
  onSelectTab: (tab: AdminTab) => void;
  onLogout: () => void;
}) {
  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: "slots", label: "Slots", icon: Users },
    { id: "polls", label: "Polls", icon: Swords },
    { id: "leaderboard", label: "Leaderboard", icon: BarChart2 },
    { id: "results", label: "Results", icon: Trophy },
    { id: "bracket", label: "Bracket", icon: GitBranch },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "rules", label: "Rules", icon: BookOpen },
    { id: "themes", label: "Themes", icon: Upload },
  ];

  const nextLabel =
    status === "UPCOMING"
      ? "Start Tournament"
      : status === "ONGOING"
        ? "Complete Tournament"
        : "Reset Tournament";
  const btnClass =
    status === "UPCOMING"
      ? "bg-green-600 hover:bg-green-500"
      : status === "ONGOING"
        ? "bg-amber-600 hover:bg-amber-500"
        : "bg-blue-600 hover:bg-blue-500";

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-heading text-neon text-glow-green">
          Admin Panel
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <Button
          data-ocid="admin.primary_button"
          onClick={onAdvance}
          className={`w-full text-white font-bold flex items-center gap-2 ${btnClass}`}
        >
          <Play className="w-4 h-4" />
          {nextLabel}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              data-ocid={`admin.${id}.button`}
              onClick={() => onSelectTab(id)}
              className="glass-card rounded-xl p-3 flex flex-col items-center gap-2 hover:border-neon/50 transition-all text-center"
            >
              <Icon className="w-5 h-5 text-neon" />
              <span className="text-xs font-bold">{label}</span>
            </button>
          ))}
        </div>
        <Button
          data-ocid="admin.secondary_button"
          variant="outline"
          onClick={onLogout}
          className="w-full"
        >
          Logout
        </Button>
      </div>
    </>
  );
}

// ─── Admin Tab Panel ──────────────────────────────────────────────────────────
function AdminTabPanel(props: {
  tab: AdminTab;
  onBack: () => void;
  slots: Slot[];
  saveSlots: (s: Slot[]) => void;
  slotRequests: SlotRequest[];
  approveRequest: (id: number) => void;
  rejectRequest: (id: number) => void;
  polls: Poll[];
  savePolls: (p: Poll[]) => void;
  leaderboard: LeaderboardRow[];
  saveLeaderboard: (l: LeaderboardRow[]) => void;
  results: MatchResult[];
  saveResults: (r: MatchResult[]) => void;
  bracket: Bracket;
  saveBracket: (b: Bracket) => void;
  announcements: Announcement[];
  saveAnnouncements: (a: Announcement[]) => void;
  rules: string;
  saveRules: (r: string) => void;
  entryFee: string;
  tournDate: string;
  status: TournamentStatus;
  saveSettings: (
    fee: string,
    date: string,
    status: TournamentStatus,
    newMaxSlots?: number,
  ) => void;
  maxSlots?: number;
  setMaxSlots?: (v: number) => void;
  themeHome: string;
  setThemeHome: (v: string) => void;
  themeSlots: string;
  setThemeSlots: (v: string) => void;
  themePolls: string;
  setThemePolls: (v: string) => void;
  themeLeaderboard?: string;
  setThemeLeaderboard?: (v: string) => void;
  themeResults?: string;
  setThemeResults?: (v: string) => void;
  pollPrize: string;
  setPollPrize: (v: string) => void;
  quarterFinalPlayers?: number;
  setQuarterFinalPlayers?: (v: number) => void;
  semiFinalPlayers?: number;
  setSemiFinalPlayers?: (v: number) => void;
}) {
  const { tab, onBack } = props;

  const BackBtn = () => (
    <button
      type="button"
      data-ocid="admin.cancel_button"
      onClick={onBack}
      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-neon mb-3"
    >
      <ChevronLeft className="w-4 h-4" /> Back
    </button>
  );

  if (tab === "slots")
    return (
      <AdminSlots
        {...props}
        maxSlots={props.maxSlots ?? 16}
        setMaxSlots={props.setMaxSlots ?? (() => {})}
        BackBtn={BackBtn}
      />
    );
  if (tab === "polls")
    return (
      <AdminPolls
        {...props}
        quarterFinalPlayers={props.quarterFinalPlayers ?? 8}
        setQuarterFinalPlayers={props.setQuarterFinalPlayers ?? (() => {})}
        semiFinalPlayers={props.semiFinalPlayers ?? 4}
        setSemiFinalPlayers={props.setSemiFinalPlayers ?? (() => {})}
        BackBtn={BackBtn}
      />
    );
  if (tab === "leaderboard")
    return <AdminLeaderboard {...props} BackBtn={BackBtn} />;
  if (tab === "results") return <AdminResults {...props} BackBtn={BackBtn} />;
  if (tab === "bracket") return <AdminBracket {...props} BackBtn={BackBtn} />;
  if (tab === "announcements")
    return <AdminAnnouncements {...props} BackBtn={BackBtn} />;
  if (tab === "rules") return <AdminRules {...props} BackBtn={BackBtn} />;
  if (tab === "themes") return <AdminThemes {...props} BackBtn={BackBtn} />;
  return null;
}

// ─── Admin Slots ──────────────────────────────────────────────────────────────
function AdminSlots({
  slots,
  saveSlots,
  slotRequests,
  approveRequest,
  rejectRequest,
  entryFee,
  tournDate,
  status,
  saveSettings,
  maxSlots,
  BackBtn,
}: any) {
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");
  const [fee, setFee] = useState(entryFee);
  const [date, setDate] = useState(tournDate);
  const [slotCount, setSlotCount] = useState(String(maxSlots ?? 16));
  useEffect(() => {
    setFee(entryFee);
  }, [entryFee]);
  useEffect(() => {
    setDate(tournDate);
  }, [tournDate]);
  useEffect(() => {
    setSlotCount(String(maxSlots ?? 16));
  }, [maxSlots]);

  const pendingRequests = slotRequests.filter(
    (r: SlotRequest) => r.status === "pending",
  );

  return (
    <div className="space-y-4">
      <BackBtn />
      <h3 className="font-heading font-bold text-gold">Manage Slots & Info</h3>

      {/* Settings */}
      <div className="space-y-2">
        <Label className="text-xs">Entry Fee</Label>
        <div className="flex gap-2">
          <Input
            value={fee}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFee(e.target.value)
            }
            className="flex-1"
          />
          <Button size="sm" onClick={() => saveSettings(fee, date, status)}>
            Save
          </Button>
        </div>
        <Label className="text-xs">Tournament Date/Time</Label>
        <div className="flex gap-2">
          <Input
            value={date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDate(e.target.value)
            }
            className="flex-1"
            placeholder="e.g. 2026-04-01 18:00"
          />
          <Button size="sm" onClick={() => saveSettings(fee, date, status)}>
            Save
          </Button>
        </div>
        <Label className="text-xs">Total No. of Slots</Label>
        <div className="flex gap-2">
          <Input
            data-ocid="admin.slots.count_input"
            type="number"
            min={2}
            max={64}
            value={slotCount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSlotCount(e.target.value)
            }
            className="flex-1"
            placeholder="e.g. 16"
          />
          <Button
            size="sm"
            data-ocid="admin.slots.count_save_button"
            onClick={() => {
              const n = Math.max(
                2,
                Math.min(64, Number.parseInt(slotCount) || 16),
              );
              setSlotCount(String(n));
              saveSettings(fee, date, status, n);
            }}
          >
            Save
          </Button>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-2">
          <p className="font-heading text-xs font-bold text-amber-400 uppercase tracking-wide">
            Pending Requests ({pendingRequests.length})
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {pendingRequests.map((req: SlotRequest, i: number) => (
              <div
                key={req.id}
                data-ocid={`admin.slots.item.${i + 1}`}
                className="glass-card rounded-lg p-3 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-neon truncate">
                    {req.playerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Slot #{req.slotNumber}
                  </p>
                  {req.whatsappNo && (
                    <a
                      href={`https://wa.me/${req.whatsappNo.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                    >
                      <span>📱 {req.whatsappNo}</span>
                    </a>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    data-ocid={`admin.slots.edit_button.${i + 1}`}
                    onClick={() => approveRequest(req.id)}
                    className="bg-green-600 hover:bg-green-500 text-white h-7 px-2 text-xs"
                  >
                    <Check className="w-3 h-3 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    data-ocid={`admin.slots.delete_button.${i + 1}`}
                    onClick={() => rejectRequest(req.id)}
                    className="h-7 px-2 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Slots */}
      <div className="space-y-2">
        <p className="font-heading text-xs font-bold text-gold uppercase tracking-wide">
          Approved Slots
        </p>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {slots.map((slot: Slot, i: number) => (
            <div key={slot.id} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-6">
                #{slot.id}
              </span>
              {editingSlot === slot.id ? (
                <>
                  <Input
                    value={editVal}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditVal(e.target.value)
                    }
                    className="flex-1 h-8 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = slots.map((s: Slot) =>
                        s.id === slot.id ? { ...s, player: editVal } : s,
                      );
                      saveSlots(updated);
                      setEditingSlot(null);
                    }}
                  >
                    <Check className="w-4 h-4 text-neon" />
                  </button>
                  <button type="button" onClick={() => setEditingSlot(null)}>
                    <X className="w-4 h-4 text-destructive" />
                  </button>
                </>
              ) : (
                <>
                  <span
                    className={`flex-1 text-sm ${slot.player ? "text-neon" : "text-muted-foreground/50"}`}
                  >
                    {slot.player || "Empty"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSlot(slot.id);
                      setEditVal(slot.player);
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-neon" />
                  </button>
                  {slot.player && (
                    <button
                      type="button"
                      data-ocid={`admin.slots.delete_button.${i + 1}`}
                      onClick={() => {
                        const updated = slots.map((s: Slot) =>
                          s.id === slot.id ? { ...s, player: "" } : s,
                        );
                        saveSlots(updated);
                        toast("Slot cleared");
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive/70 hover:text-destructive" />
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Admin Polls ──────────────────────────────────────────────────────────────
function AdminPolls({
  polls,
  savePolls,
  pollPrize,
  setPollPrize,
  quarterFinalPlayers,
  setQuarterFinalPlayers,
  semiFinalPlayers,
  setSemiFinalPlayers,
  BackBtn,
}: any) {
  const [localPolls, setLocalPolls] = useState<Poll[]>(polls);
  const [count, setCount] = useState(String(polls.length || 4));

  const applyCount = () => {
    const n = Math.max(1, Math.min(12, Number.parseInt(count) || 1));
    const next: Poll[] = Array.from({ length: n }, (_, i) => ({
      id: i + 1,
      matchup:
        localPolls[i]?.matchup ?? `Player ${i * 2 + 1} vs Player ${i * 2 + 2}`,
    }));
    setLocalPolls(next);
  };

  const updateMatchup = (id: number, val: string) => {
    setLocalPolls(
      localPolls.map((p: Poll) => (p.id === id ? { ...p, matchup: val } : p)),
    );
  };

  return (
    <div className="space-y-4">
      <BackBtn />
      <h3 className="font-heading font-bold text-gold">
        Manage Polls / Fixtures
      </h3>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          Poll Prize / Reward
        </Label>
        <Input
          data-ocid="admin.polls.prize_input"
          value={pollPrize ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPollPrize(e.target.value)
          }
          placeholder="e.g. ₹500 Cash Prize"
          className="h-8 text-sm"
        />
      </div>
      <div className="flex gap-2 items-center">
        <Label className="text-xs whitespace-nowrap">No. of Polls</Label>
        <Input
          value={count}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCount(e.target.value)
          }
          className="w-20 h-8"
        />
        <Button size="sm" onClick={applyCount}>
          Apply
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Quarter Final Players
          </Label>
          <Input
            data-ocid="admin.polls.qf_players_input"
            type="number"
            min={2}
            max={32}
            value={quarterFinalPlayers}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuarterFinalPlayers(
                Math.max(2, Math.min(32, Number(e.target.value) || 2)),
              )
            }
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Semi Final Players
          </Label>
          <Input
            data-ocid="admin.polls.sf_players_input"
            type="number"
            min={2}
            max={32}
            value={semiFinalPlayers}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSemiFinalPlayers(
                Math.max(2, Math.min(32, Number(e.target.value) || 2)),
              )
            }
            className="h-8 text-sm"
          />
        </div>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {localPolls.map((poll: Poll, i: number) => (
          <div
            key={poll.id}
            data-ocid={`admin.polls.item.${i + 1}`}
            className="space-y-1"
          >
            <Label className="text-xs text-muted-foreground">
              Match {poll.id}
            </Label>
            <Input
              data-ocid={`admin.polls.input.${i + 1}`}
              value={poll.matchup}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateMatchup(poll.id, e.target.value)
              }
              placeholder="Player A vs Player B"
              className="h-8 text-sm"
            />
          </div>
        ))}
      </div>
      <Button
        data-ocid="admin.polls.save_button"
        onClick={() => savePolls(localPolls)}
        className="w-full bg-primary text-primary-foreground"
      >
        Save All
      </Button>
    </div>
  );
}

// ─── Admin Leaderboard ────────────────────────────────────────────────────────
function AdminLeaderboard({ leaderboard, saveLeaderboard, BackBtn }: any) {
  const [form, setForm] = useState({
    player: "",
    played: "0",
    w: "0",
    d: "0",
    l: "0",
    gf: "0",
    ga: "0",
    points: "0",
  });

  const addRow = () => {
    if (!form.player.trim()) return;
    const row: LeaderboardRow = {
      id: Date.now(),
      player: form.player.trim(),
      played: Number.parseInt(form.played) || 0,
      w: Number.parseInt(form.w) || 0,
      d: Number.parseInt(form.d) || 0,
      l: Number.parseInt(form.l) || 0,
      gf: Number.parseInt(form.gf) || 0,
      ga: Number.parseInt(form.ga) || 0,
      points: Number.parseInt(form.points) || 0,
    };
    const next = [...leaderboard, row];
    saveLeaderboard(next);
    toast.success("Player added");
    setForm({
      player: "",
      played: "0",
      w: "0",
      d: "0",
      l: "0",
      gf: "0",
      ga: "0",
      points: "0",
    });
  };

  return (
    <div className="space-y-4">
      <BackBtn />
      <h3 className="font-heading font-bold text-gold">Leaderboard</h3>
      <div className="space-y-2">
        <Input
          data-ocid="admin.leaderboard.input"
          placeholder="Player name"
          value={form.player}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, player: e.target.value })
          }
        />
        <div className="grid grid-cols-4 gap-1">
          {(["played", "w", "d", "l"] as const).map((k) => (
            <div key={k}>
              <Label className="text-[10px] text-muted-foreground uppercase">
                {k}
              </Label>
              <Input
                value={form[k]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, [k]: e.target.value })
                }
                className="h-8 text-sm"
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1">
          {(["gf", "ga", "points"] as const).map((k) => (
            <div key={k}>
              <Label className="text-[10px] text-muted-foreground uppercase">
                {k}
              </Label>
              <Input
                value={form[k]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, [k]: e.target.value })
                }
                className="h-8 text-sm"
              />
            </div>
          ))}
          <Button
            data-ocid="admin.leaderboard.submit_button"
            size="sm"
            onClick={addRow}
            className="self-end bg-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {leaderboard.map((row: LeaderboardRow, i: number) => (
          <div
            key={row.id}
            data-ocid={`admin.leaderboard.item.${i + 1}`}
            className="flex items-center justify-between glass-card rounded-lg p-2 text-sm"
          >
            <span className="text-neon font-bold">{row.player}</span>
            <span className="text-muted-foreground text-xs">
              {row.points} pts
            </span>
            <button
              type="button"
              data-ocid={`admin.leaderboard.delete_button.${i + 1}`}
              onClick={() =>
                saveLeaderboard(
                  leaderboard.filter((r: LeaderboardRow) => r.id !== row.id),
                )
              }
            >
              <Trash2 className="w-4 h-4 text-destructive/70 hover:text-destructive" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Admin Results ────────────────────────────────────────────────────────────
function AdminResults({ results, saveResults, BackBtn }: any) {
  const [form, setForm] = useState({
    team1: "",
    score1: "0",
    score2: "0",
    team2: "",
  });

  const addResult = () => {
    if (!form.team1.trim() || !form.team2.trim()) return;
    const next = [
      ...results,
      {
        id: Date.now(),
        team1: form.team1,
        score1: Number.parseInt(form.score1) || 0,
        score2: Number.parseInt(form.score2) || 0,
        team2: form.team2,
      },
    ];
    saveResults(next);
    toast.success("Result added");
    setForm({ team1: "", score1: "0", score2: "0", team2: "" });
  };

  return (
    <div className="space-y-4">
      <BackBtn />
      <h3 className="font-heading font-bold text-gold">Match Results</h3>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Input
            data-ocid="admin.results.input"
            placeholder="Team 1"
            value={form.team1}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, team1: e.target.value })
            }
          />
          <Input
            placeholder="Team 2"
            value={form.team2}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, team2: e.target.value })
            }
          />
        </div>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="0"
            value={form.score1}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, score1: e.target.value })
            }
            className="w-16 text-center"
          />
          <span className="text-muted-foreground">—</span>
          <Input
            placeholder="0"
            value={form.score2}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, score2: e.target.value })
            }
            className="w-16 text-center"
          />
          <Button
            data-ocid="admin.results.submit_button"
            onClick={addResult}
            className="flex-1 bg-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {results.map((r: MatchResult, i: number) => (
          <div
            key={r.id}
            data-ocid={`admin.results.item.${i + 1}`}
            className="flex items-center justify-between glass-card rounded-lg p-2 text-sm"
          >
            <span className="truncate flex-1 text-right">{r.team1}</span>
            <span className="text-neon font-bold mx-2">
              {r.score1}–{r.score2}
            </span>
            <span className="truncate flex-1">{r.team2}</span>
            <button
              type="button"
              data-ocid={`admin.results.delete_button.${i + 1}`}
              onClick={() =>
                saveResults(results.filter((x: MatchResult) => x.id !== r.id))
              }
            >
              <Trash2 className="w-4 h-4 text-destructive/70 hover:text-destructive ml-2" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Admin Bracket ────────────────────────────────────────────────────────────
function AdminBracket({ bracket, saveBracket, BackBtn }: any) {
  const [local, setLocal] = useState<Bracket>(bracket);

  const update = (
    round: "qf" | "sf",
    idx: number,
    field: "team1" | "team2",
    val: string,
  ) => {
    if (round === "qf") {
      setLocal({
        ...local,
        qf: local.qf.map((s: BracketSlot, i: number) =>
          i === idx ? { ...s, [field]: val } : s,
        ),
      });
    } else {
      setLocal({
        ...local,
        sf: local.sf.map((s: BracketSlot, i: number) =>
          i === idx ? { ...s, [field]: val } : s,
        ),
      });
    }
  };
  const updateFinal = (field: "team1" | "team2", val: string) => {
    setLocal({ ...local, final: { ...local.final, [field]: val } });
  };

  return (
    <div className="space-y-4">
      <BackBtn />
      <h3 className="font-heading font-bold text-gold">Bracket Editor</h3>
      <div className="max-h-72 overflow-y-auto space-y-4">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">
            Quarter-Finals
          </p>
          {local.qf.map((slot: BracketSlot, i: number) => (
            <div key={slot.id} className="grid grid-cols-2 gap-1 mb-2">
              <Input
                placeholder={`QF${i + 1} Team 1`}
                value={slot.team1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  update("qf", i, "team1", e.target.value)
                }
                className="h-8 text-sm"
              />
              <Input
                placeholder={`QF${i + 1} Team 2`}
                value={slot.team2}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  update("qf", i, "team2", e.target.value)
                }
                className="h-8 text-sm"
              />
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">
            Semi-Finals
          </p>
          {local.sf.map((slot: BracketSlot, i: number) => (
            <div key={slot.id} className="grid grid-cols-2 gap-1 mb-2">
              <Input
                placeholder={`SF${i + 1} Team 1`}
                value={slot.team1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  update("sf", i, "team1", e.target.value)
                }
                className="h-8 text-sm"
              />
              <Input
                placeholder={`SF${i + 1} Team 2`}
                value={slot.team2}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  update("sf", i, "team2", e.target.value)
                }
                className="h-8 text-sm"
              />
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">
            Final
          </p>
          <div className="grid grid-cols-2 gap-1">
            <Input
              placeholder="Final Team 1"
              value={local.final.team1}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateFinal("team1", e.target.value)
              }
              className="h-8 text-sm"
            />
            <Input
              placeholder="Final Team 2"
              value={local.final.team2}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateFinal("team2", e.target.value)
              }
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>
      <Button
        data-ocid="admin.bracket.save_button"
        onClick={() => saveBracket(local)}
        className="w-full bg-primary text-primary-foreground"
      >
        Save Bracket
      </Button>
    </div>
  );
}

// ─── Admin Announcements ──────────────────────────────────────────────────────
function AdminAnnouncements({
  announcements,
  saveAnnouncements,
  BackBtn,
}: any) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const add = () => {
    if (!title.trim() || !message.trim()) return;
    const next = [
      ...announcements,
      {
        id: Date.now(),
        title: title.trim(),
        message: message.trim(),
        date: new Date().toISOString().slice(0, 10),
      },
    ];
    saveAnnouncements(next);
    toast.success("Announcement posted");
    setTitle("");
    setMessage("");
  };

  return (
    <div className="space-y-4">
      <BackBtn />
      <h3 className="font-heading font-bold text-gold">Announcements</h3>
      <Input
        data-ocid="admin.announcements.input"
        placeholder="Title"
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setTitle(e.target.value)
        }
      />
      <Textarea
        data-ocid="admin.announcements.textarea"
        placeholder="Message"
        value={message}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setMessage(e.target.value)
        }
        rows={3}
      />
      <Button
        data-ocid="admin.announcements.submit_button"
        onClick={add}
        className="w-full bg-primary text-primary-foreground"
      >
        <Plus className="w-4 h-4 mr-1" /> Post
      </Button>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {announcements.map((a: Announcement, i: number) => (
          <div
            key={a.id}
            data-ocid={`admin.announcements.item.${i + 1}`}
            className="flex items-start justify-between glass-card rounded-lg p-2"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-neon truncate">{a.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {a.message}
              </p>
            </div>
            <button
              type="button"
              data-ocid={`admin.announcements.delete_button.${i + 1}`}
              onClick={() =>
                saveAnnouncements(
                  announcements.filter((x: Announcement) => x.id !== a.id),
                )
              }
              className="ml-2 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4 text-destructive/70 hover:text-destructive" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Admin Rules ──────────────────────────────────────────────────────────────
function AdminRules({ rules, saveRules, BackBtn }: any) {
  const [val, setVal] = useState(rules);
  return (
    <div className="space-y-4">
      <BackBtn />
      <h3 className="font-heading font-bold text-gold">Edit Rules</h3>
      <Textarea
        data-ocid="admin.rules.textarea"
        value={val}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setVal(e.target.value)
        }
        rows={10}
        className="text-sm"
      />
      <Button
        data-ocid="admin.rules.save_button"
        onClick={() => saveRules(val)}
        className="w-full bg-primary text-primary-foreground"
      >
        Save Rules
      </Button>
    </div>
  );
}

// ─── Admin Themes ─────────────────────────────────────────────────────────────
function AdminThemes({
  themeHome,
  setThemeHome,
  themeSlots,
  setThemeSlots,
  themePolls,
  setThemePolls,
  themeLeaderboard,
  setThemeLeaderboard,
  themeResults,
  setThemeResults,
  BackBtn,
}: any) {
  const homeRef = useRef<HTMLInputElement>(null);
  const slotsRef = useRef<HTMLInputElement>(null);
  const pollsRef = useRef<HTMLInputElement>(null);
  const lbRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLInputElement>(null);

  const handleUpload =
    (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setter(ev.target?.result as string);
        toast.success("Theme uploaded!");
      };
      reader.readAsDataURL(file);
    };

  const ThemeSection = ({
    label,
    value,
    setter,
    inputRef,
    badge,
  }: {
    label: string;
    value: string;
    setter: (v: string) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    badge?: string;
  }) => (
    <div
      className={`relative rounded-2xl overflow-hidden border ${value ? "border-primary/60" : "border-border/40"} shadow-lg`}
    >
      {/* Preview background */}
      {value ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${value})` }}
        />
      ) : null}
      <div className="relative z-10 p-4 space-y-3 bg-gradient-to-br from-black/60 to-black/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gold">{label}</p>
            {badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/30 text-primary border border-primary/40 font-bold uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {value && (
              <button
                type="button"
                onClick={() => setter("")}
                className="text-xs text-destructive/80 hover:text-destructive px-2 py-0.5 rounded border border-destructive/30 hover:border-destructive/60 transition-colors"
              >
                Remove
              </button>
            )}
            <div
              className={`w-2 h-2 rounded-full ${value ? "bg-green-400" : "bg-muted-foreground/40"}`}
            />
          </div>
        </div>
        {!value && (
          <div className="w-full h-14 rounded-xl border border-dashed border-border/50 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No image set</span>
          </div>
        )}
        {value && (
          <div
            className="w-full h-14 rounded-xl bg-cover bg-center border border-primary/20"
            style={{ backgroundImage: `url(${value})` }}
          />
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload(setter)}
        />
        <Button
          size="sm"
          data-ocid="admin.themes.upload_button"
          onClick={() => inputRef.current?.click()}
          className="w-full bg-primary/80 hover:bg-primary text-white font-bold text-xs shadow-md"
        >
          <Upload className="w-3 h-3 mr-1.5" />
          {value ? "Change Image" : "Upload Image"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <BackBtn />
      <div className="flex items-center gap-2">
        <h3 className="font-heading font-bold text-gold">Theme Settings</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wider">
          Premium
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Customize background images for each section of your tournament
      </p>
      <div className="space-y-3">
        <ThemeSection
          label="Home Page"
          value={themeHome}
          setter={setThemeHome}
          inputRef={homeRef}
        />
        <ThemeSection
          label="Player Slots"
          value={themeSlots}
          setter={setThemeSlots}
          inputRef={slotsRef}
        />
        <ThemeSection
          label="Polls / Matches"
          value={themePolls}
          setter={setThemePolls}
          inputRef={pollsRef}
          badge="Per Poll"
        />
        <ThemeSection
          label="Leaderboard"
          value={themeLeaderboard}
          setter={setThemeLeaderboard}
          inputRef={lbRef}
        />
        <ThemeSection
          label="Match Results"
          value={themeResults}
          setter={setThemeResults}
          inputRef={resultsRef}
        />
      </div>
    </div>
  );
}

// ─── Shared UI Components ─────────────────────────────────────────────────────
function PageHeader({
  title,
  subtitle,
  icon: Icon,
}: { title: string; subtitle: string; icon: React.ElementType }) {
  return (
    <div className="px-4 pt-5 pb-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4.5 h-4.5 text-neon" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  message,
  "data-ocid": ocid,
}: { message: string; "data-ocid"?: string }) {
  return (
    <div data-ocid={ocid} className="text-center py-12 text-muted-foreground">
      <Swords className="w-8 h-8 mx-auto mb-2 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
