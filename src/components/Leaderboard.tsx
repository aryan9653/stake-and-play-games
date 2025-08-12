import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp, Coins } from "lucide-react";

interface LeaderboardEntry {
  address: string;
  wins: number;
  totalGTWon: number;
  matchesPlayed: number;
  winRate: number;
}

const mockLeaderboard: LeaderboardEntry[] = [
  {
    address: "0x1a2b...3c4d",
    wins: 15,
    totalGTWon: 2850,
    matchesPlayed: 18,
    winRate: 83.3,
  },
  {
    address: "0x5e6f...7g8h",
    wins: 12,
    totalGTWon: 2400,
    matchesPlayed: 16,
    winRate: 75.0,
  },
  {
    address: "0x9i0j...1k2l",
    wins: 10,
    totalGTWon: 1950,
    matchesPlayed: 14,
    winRate: 71.4,
  },
  {
    address: "0x3m4n...5o6p",
    wins: 8,
    totalGTWon: 1600,
    matchesPlayed: 12,
    winRate: 66.7,
  },
  {
    address: "0x7q8r...9s0t",
    wins: 7,
    totalGTWon: 1350,
    matchesPlayed: 11,
    winRate: 63.6,
  },
];

export const Leaderboard = () => {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-gaming-gold" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-gaming-orange" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
            {index + 1}
          </div>
        );
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <Badge className="bg-gaming-gold/20 text-gaming-gold border-gaming-gold/30">
            Champion
          </Badge>
        );
      case 1:
        return (
          <Badge className="bg-gray-400/20 text-gray-400 border-gray-400/30">
            Runner-up
          </Badge>
        );
      case 2:
        return (
          <Badge className="bg-gaming-orange/20 text-gaming-orange border-gaming-orange/30">
            Third Place
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-muted/50">
            #{index + 1}
          </Badge>
        );
    }
  };

  return (
    <Card className="bg-card border-border shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 rounded-lg bg-gradient-accent">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          Leaderboard
        </CardTitle>
        <p className="text-muted-foreground">
          Top players by GT tokens won
        </p>
      </CardHeader>
      <CardContent>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-gradient-primary/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Matches</p>
                <p className="text-2xl font-bold text-primary">1,234</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-gradient-accent/10 border border-accent/20">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">GT Distributed</p>
                <p className="text-2xl font-bold text-accent">456,789</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-gradient-gaming/10 border border-gaming-purple/20">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-gaming-purple" />
              <div>
                <p className="text-sm text-muted-foreground">Active Players</p>
                <p className="text-2xl font-bold text-gaming-purple">2,547</p>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="space-y-3">
          {mockLeaderboard.map((entry, index) => (
            <div
              key={entry.address}
              className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-lg ${
                index === 0
                  ? "bg-gaming-gold/5 border-gaming-gold/30 shadow-md"
                  : index === 1
                  ? "bg-gray-400/5 border-gray-400/30"
                  : index === 2
                  ? "bg-gaming-orange/5 border-gaming-orange/30"
                  : "bg-secondary/50 border-border hover:bg-secondary/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getRankIcon(index)}
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <code className="text-sm font-mono font-semibold">
                        {entry.address}
                      </code>
                      {getRankBadge(index)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{entry.wins} wins</span>
                      <span>{entry.matchesPlayed} matches</span>
                      <span className="text-accent font-medium">
                        {entry.winRate}% win rate
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="w-4 h-4 text-accent" />
                    <span className="text-xl font-bold font-mono text-accent">
                      {entry.totalGTWon.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">GT</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Avg: {(entry.totalGTWon / entry.wins).toFixed(0)} GT/win
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-accent" />
            Recent Winners
          </h3>
          <div className="space-y-2">
            {[
              { winner: "0x1a2b...3c4d", amount: 200, matchId: "match_045" },
              { winner: "0x5e6f...7g8h", amount: 150, matchId: "match_044" },
              { winner: "0x9i0j...1k2l", amount: 300, matchId: "match_043" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="w-4 h-4 text-gaming-gold" />
                  <code className="text-sm">{activity.winner}</code>
                  <span className="text-xs text-muted-foreground">
                    won {activity.matchId}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-accent font-semibold">
                  <Coins className="w-4 h-4" />
                  {activity.amount} GT
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};