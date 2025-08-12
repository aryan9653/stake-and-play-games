import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, Users, Trophy, Clock, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Match {
  id: string;
  player1: string;
  player2: string;
  stake: number;
  status: "created" | "staked" | "settled" | "refunded";
  winner?: string;
  startTime?: number;
}

export const MatchManager = () => {
  const [matches, setMatches] = useState<Match[]>([
    {
      id: "match_001",
      player1: "0x1234...5678",
      player2: "0x8765...4321",
      stake: 50,
      status: "staked",
      startTime: Date.now() - 30 * 60 * 1000, // 30 minutes ago
    },
    {
      id: "match_002",
      player1: "0xabcd...efgh",
      player2: "0xijkl...mnop",
      stake: 100,
      status: "created",
    },
  ]);

  const [newMatch, setNewMatch] = useState({
    matchId: "",
    player1: "",
    player2: "",
    stake: "",
  });

  const [stakeMatchId, setStakeMatchId] = useState("");
  const [resultData, setResultData] = useState({
    matchId: "",
    winner: "",
  });

  const { toast } = useToast();

  const createMatch = () => {
    if (!newMatch.matchId || !newMatch.player1 || !newMatch.player2 || !newMatch.stake) {
      toast({
        title: "Missing Information",
        description: "Please fill in all match details",
        variant: "destructive",
      });
      return;
    }

    const match: Match = {
      id: newMatch.matchId,
      player1: newMatch.player1,
      player2: newMatch.player2,
      stake: parseFloat(newMatch.stake),
      status: "created",
    };

    setMatches([...matches, match]);
    setNewMatch({ matchId: "", player1: "", player2: "", stake: "" });
    
    toast({
      title: "Match Created! 🎮",
      description: `Match ${match.id} created with ${match.stake} GT stake`,
    });
  };

  const stakeMatch = () => {
    if (!stakeMatchId) return;

    setMatches(matches.map(match => {
      if (match.id === stakeMatchId && match.status === "created") {
        return {
          ...match,
          status: "staked" as const,
          startTime: Date.now(),
        };
      }
      return match;
    }));

    toast({
      title: "Stake Placed! 💰",
      description: `Both players staked for match ${stakeMatchId}`,
    });
    setStakeMatchId("");
  };

  const submitResult = () => {
    if (!resultData.matchId || !resultData.winner) return;

    setMatches(matches.map(match => {
      if (match.id === resultData.matchId && match.status === "staked") {
        return {
          ...match,
          status: "settled" as const,
          winner: resultData.winner,
        };
      }
      return match;
    }));

    const match = matches.find(m => m.id === resultData.matchId);
    if (match) {
      toast({
        title: "Match Settled! 🏆",
        description: `Winner receives ${match.stake * 2} GT`,
      });
    }
    
    setResultData({ matchId: "", winner: "" });
  };

  const getStatusBadge = (status: Match["status"]) => {
    const variants = {
      created: "bg-gaming-orange/20 text-gaming-orange",
      staked: "bg-primary/20 text-primary",
      settled: "bg-accent/20 text-accent",
      refunded: "bg-gaming-red/20 text-gaming-red",
    };

    const labels = {
      created: "Created",
      staked: "Active",
      settled: "Settled",
      refunded: "Refunded",
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <Card className="bg-card border-border shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 rounded-lg bg-gradient-gaming">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          Match Manager
        </CardTitle>
        <p className="text-muted-foreground">
          Create matches, stake tokens, and submit results
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Match</TabsTrigger>
            <TabsTrigger value="stake">Stake Tokens</TabsTrigger>
            <TabsTrigger value="results">Submit Results</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="match-id">Match ID</Label>
                <Input
                  id="match-id"
                  placeholder="match_003"
                  value={newMatch.matchId}
                  onChange={(e) => setNewMatch({ ...newMatch, matchId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stake-amount">Stake Amount (GT)</Label>
                <Input
                  id="stake-amount"
                  type="number"
                  placeholder="100"
                  value={newMatch.stake}
                  onChange={(e) => setNewMatch({ ...newMatch, stake: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="player1">Player 1 Address</Label>
                <Input
                  id="player1"
                  placeholder="0x..."
                  value={newMatch.player1}
                  onChange={(e) => setNewMatch({ ...newMatch, player1: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="player2">Player 2 Address</Label>
                <Input
                  id="player2"
                  placeholder="0x..."
                  value={newMatch.player2}
                  onChange={(e) => setNewMatch({ ...newMatch, player2: e.target.value })}
                />
              </div>
            </div>
            <Button variant="gaming" size="lg" className="w-full" onClick={createMatch}>
              <Users className="w-5 h-5" />
              Create Match
            </Button>
          </TabsContent>

          <TabsContent value="stake" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stake-match-id">Match ID to Stake</Label>
              <Input
                id="stake-match-id"
                placeholder="Select a match ID"
                value={stakeMatchId}
                onChange={(e) => setStakeMatchId(e.target.value)}
              />
            </div>
            <Button variant="accent" size="lg" className="w-full" onClick={stakeMatch}>
              <Coins className="w-5 h-5" />
              Stake Tokens
            </Button>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="result-match-id">Match ID</Label>
                <Input
                  id="result-match-id"
                  placeholder="match_001"
                  value={resultData.matchId}
                  onChange={(e) => setResultData({ ...resultData, matchId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="winner-address">Winner Address</Label>
                <Input
                  id="winner-address"
                  placeholder="0x..."
                  value={resultData.winner}
                  onChange={(e) => setResultData({ ...resultData, winner: e.target.value })}
                />
              </div>
            </div>
            <Button variant="gold" size="lg" className="w-full" onClick={submitResult}>
              <Trophy className="w-5 h-5" />
              Submit Result
            </Button>
          </TabsContent>
        </Tabs>

        {/* Active Matches */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Active Matches
          </h3>
          <div className="space-y-3">
            {matches.map((match) => (
              <div
                key={match.id}
                className="p-4 rounded-lg border border-border bg-secondary/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <code className="px-2 py-1 text-xs bg-muted rounded font-mono">
                      {match.id}
                    </code>
                    {getStatusBadge(match.status)}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Stake</p>
                    <p className="font-mono font-semibold text-accent">
                      {match.stake} GT
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Player 1</p>
                    <code className="text-foreground">{match.player1}</code>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Player 2</p>
                    <code className="text-foreground">{match.player2}</code>
                  </div>
                </div>
                {match.winner && (
                  <div className="mt-3 p-2 rounded bg-accent/10 border border-accent/20">
                    <p className="text-sm text-accent">
                      🏆 Winner: <code>{match.winner}</code>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};