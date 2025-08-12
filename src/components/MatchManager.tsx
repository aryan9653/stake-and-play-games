import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords, Trophy, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

export const MatchManager = () => {
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedWinner, setSelectedWinner] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, updateBalance } = useProfile();

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        player1:profiles!matches_player1_id_fkey(wallet_address),
        player2:profiles!matches_player2_id_fkey(wallet_address),
        winner:profiles!matches_winner_id_fkey(wallet_address)
      `)
      .or(`player1_id.eq.${profile.id},player2_id.eq.${profile.id}`)
      .order('created_at', { ascending: false });

    if (!error) {
      setMatches(data || []);
    }
  };

  const createMatch = async () => {
    if (!user || !profile) {
      toast({
        title: "Not Authenticated",
        description: "Please sign in first",
        variant: "destructive",
      });
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid Stake",
        description: "Please enter a valid stake amount",
        variant: "destructive",
      });
      return;
    }

    const stakeValue = parseFloat(stakeAmount);
    if (stakeValue > Number(profile.gt_balance)) {
      toast({
        title: "Insufficient Balance",
        description: "Not enough GT balance for this stake",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const matchId = `MATCH_${Date.now()}`;
      const { data, error } = await supabase
        .from('matches')
        .insert({
          match_id: matchId,
          player1_id: profile.id,
          stake_amount: stakeValue,
          status: 'CREATED',
        })
        .select(`
          *,
          player1:profiles!matches_player1_id_fkey(wallet_address),
          player2:profiles!matches_player2_id_fkey(wallet_address)
        `)
        .single();

      if (error) throw error;

      setActiveMatch(data);
      await fetchMatches();
      
      toast({
        title: "Match Created! ⚔️",
        description: `Created match with ${stakeAmount} GT stake`,
      });
      
      setStakeAmount("");
    } catch (error: any) {
      toast({
        title: "Match Creation Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitResult = async () => {
    if (!selectedWinner || !activeMatch || !profile) {
      toast({
        title: "Invalid Selection",
        description: "Please select a winner",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const winnerId = selectedWinner === 'player1' ? activeMatch.player1_id : activeMatch.player2_id;
      const isCurrentUserWinner = winnerId === profile.id;
      
      // Update match status
      const { error: matchError } = await supabase
        .from('matches')
        .update({
          status: 'SETTLED',
          winner_id: winnerId,
          settled_at: new Date().toISOString(),
        })
        .eq('id', activeMatch.id);

      if (matchError) throw matchError;

      // Update winner's balance
      if (isCurrentUserWinner) {
        const winAmount = Number(activeMatch.stake_amount) * 2;
        await updateBalance(winAmount, 0);
        
        // Record win transaction
        await supabase.from('transactions').insert({
          user_id: profile.id,
          type: 'WIN',
          gt_amount: winAmount,
          match_id: activeMatch.id,
        });
      }

      await fetchMatches();
      
      toast({
        title: "Result Submitted! 🏆",
        description: `Match settled, winner receives ${Number(activeMatch.stake_amount) * 2} GT`,
      });
      
      setActiveMatch(null);
      setSelectedWinner("");
    } catch (error: any) {
      toast({
        title: "Submit Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
          <div className="p-2 rounded-lg bg-gradient-gaming">
            <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="text-base sm:text-2xl">Match Management</span>
        </CardTitle>
        <p className="text-muted-foreground text-sm sm:text-base">
          Create matches and submit results
        </p>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 text-xs sm:text-sm">
            <TabsTrigger value="create" className="text-xs sm:text-sm">Create Match</TabsTrigger>
            <TabsTrigger value="result" className="text-xs sm:text-sm">Submit Result</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stake-amount" className="text-sm font-medium">
                Stake Amount (GT)
              </Label>
              <Input
                id="stake-amount"
                type="number"
                placeholder="50"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="text-base"
                disabled={!user}
              />
            </div>
            <Button 
              variant="hero" 
              className="w-full text-sm sm:text-base"
              onClick={createMatch}
              disabled={loading || !user}
            >
              <Swords className="w-4 h-4 sm:w-5 sm:h-5" />
              {loading ? "Creating..." : "Create Match"}
            </Button>
          </TabsContent>

          <TabsContent value="result" className="space-y-4">
            {activeMatch ? (
              <>
                <div className="p-3 sm:p-4 rounded-lg bg-secondary border">
                  <h4 className="font-medium mb-2 text-sm sm:text-base">Active Match: {activeMatch.match_id}</h4>
                  <p className="text-sm text-muted-foreground">Stake: {activeMatch.stake_amount} GT</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Select Winner</Label>
                  <Select value={selectedWinner} onValueChange={setSelectedWinner}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Choose winner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="player1">
                        Player 1 ({activeMatch.player1?.wallet_address?.slice(0, 6)}...{activeMatch.player1?.wallet_address?.slice(-4)})
                      </SelectItem>
                      <SelectItem value="player2">
                        Player 2 (Waiting for opponent...)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="gold" 
                  className="w-full text-sm sm:text-base"
                  onClick={submitResult}
                  disabled={!selectedWinner || loading}
                >
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                  {loading ? "Submitting..." : "Submit Result"}
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No active match to settle</p>
                <p className="text-xs text-muted-foreground mt-1">Create a match first</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Active Match Display */}
        {activeMatch && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-secondary border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                <Clock className="w-4 h-4" />
                Active Match
              </h3>
              <Badge variant="outline" className="bg-gaming-purple/20 text-gaming-purple text-xs">
                {activeMatch.status}
              </Badge>
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              <p><span className="text-muted-foreground">Match ID:</span> {activeMatch.match_id}</p>
              <p><span className="text-muted-foreground">Stake:</span> {activeMatch.stake_amount} GT</p>
              <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3">
                <div className="text-center p-2 rounded bg-card">
                  <p className="text-xs text-muted-foreground">Player 1</p>
                  <p className="font-mono text-xs sm:text-sm">{activeMatch.player1?.wallet_address?.slice(0, 6)}...{activeMatch.player1?.wallet_address?.slice(-4)}</p>
                </div>
                <div className="text-center p-2 rounded bg-card">
                  <p className="text-xs text-muted-foreground">Player 2</p>
                  <p className="font-mono text-xs sm:text-sm">{activeMatch.player2?.wallet_address ? `${activeMatch.player2.wallet_address.slice(0, 6)}...${activeMatch.player2.wallet_address.slice(-4)}` : "Waiting..."}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Matches */}
        <div className="mt-4 sm:mt-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Users className="w-4 h-4" />
            Your Matches
          </h3>
          <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
            {matches.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-sm">No matches yet</p>
            ) : (
              matches.map((match) => (
                <div key={match.id} className="p-3 rounded-lg bg-secondary border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs sm:text-sm">{match.match_id}</span>
                    <Badge variant={match.status === "SETTLED" ? "default" : "secondary"} className="text-xs">
                      {match.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>Stake: {match.stake_amount} GT</span>
                    <span>{match.status === "SETTLED" && match.winner ? `Winner: ${match.winner.wallet_address?.slice(0, 6)}...` : match.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};