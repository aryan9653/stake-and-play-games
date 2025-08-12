import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Coins, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useWallet } from "@/hooks/useWallet";
import { supabase } from "@/integrations/supabase/client";
import { AuthModal } from "./AuthModal";

export const TokenPurchase = () => {
  const [usdtAmount, setUsdtAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, updateBalance } = useProfile();
  const { account, isConnected, formatAddress } = useWallet();

  const calculateGT = (usdt: string) => {
    const amount = parseFloat(usdt) || 0;
    return amount; // 1:1 ratio for demo
  };

  const handlePurchase = async () => {
    if (!user || !profile) {
      toast({
        title: "Not Authenticated",
        description: "Please sign in first",
        variant: "destructive",
      });
      return;
    }

    if (!usdtAmount || parseFloat(usdtAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid USDT amount",
        variant: "destructive",
      });
      return;
    }

    const usdtValue = parseFloat(usdtAmount);
    if (usdtValue > Number(profile.usdt_balance)) {
      toast({
        title: "Insufficient Balance",
        description: "Not enough USDT balance",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Update balances
      const { error: balanceError } = await updateBalance(usdtValue, usdtValue);
      
      if (balanceError) throw balanceError;

      // Record transaction
      await supabase.from('transactions').insert({
        user_id: profile.id,
        type: 'PURCHASE',
        usdt_amount: usdtValue,
        gt_amount: usdtValue,
      });

      toast({
        title: "Purchase Successful! 🎮",
        description: `Converted ${usdtAmount} USDT to ${calculateGT(usdtAmount)} GT`,
      });
      
      setUsdtAmount("");
    } catch (error: any) {
      toast({
        title: "Purchase Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAuth = () => {
    setAuthModalOpen(true);
  };

  return (
    <Card className="bg-card border-border shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="text-base sm:text-2xl">Buy Game Tokens</span>
        </CardTitle>
        <p className="text-muted-foreground text-sm sm:text-base">
          Convert USDT to GT at 1:1 ratio
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Authentication Status */}
        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
            <span className="font-medium text-sm sm:text-base">
              {user ? "Connected" : "Connect Account"}
            </span>
          </div>
          {!user && (
            <Button variant="outline" size="sm" onClick={handleOpenAuth}>
              Connect
            </Button>
          )}
          {user && profile && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground text-xs sm:text-sm">
              {isConnected && account ? formatAddress(account) : 
               profile.wallet_address?.slice(0, 6) + '...' + profile.wallet_address?.slice(-4)}
            </Badge>
          )}
        </div>

        {/* Exchange Input */}
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="usdt-amount" className="text-sm font-medium">
              USDT Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="usdt-amount"
                type="number"
                placeholder="0.00"
                value={usdtAmount}
                onChange={(e) => setUsdtAmount(e.target.value)}
                className="pl-10 text-base"
                disabled={!user}
              />
            </div>
          </div>

          {/* Exchange Arrow */}
          <div className="flex justify-center py-2">
            <div className="p-2 rounded-full bg-gradient-primary">
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>

          {/* GT Output */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">You'll Receive</Label>
            <div className="p-3 rounded-lg bg-secondary border border-border">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                <span className="text-lg sm:text-xl font-mono font-semibold">
                  {calculateGT(usdtAmount).toFixed(2)} GT
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Button */}
        <Button 
          variant="hero" 
          size="lg" 
          className="w-full text-sm sm:text-base"
          onClick={handlePurchase}
          disabled={!user || loading}
        >
          <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
          {loading ? "Processing..." : "Purchase Game Tokens"}
        </Button>

        {/* Balance Display */}
        {user && profile && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">USDT Balance</p>
              <p className="text-base sm:text-lg font-semibold font-mono">
                {Number(profile.usdt_balance).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">GT Balance</p>
              <p className="text-base sm:text-lg font-semibold font-mono text-accent">
                {Number(profile.gt_balance).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </CardContent>
    </Card>
  );
};