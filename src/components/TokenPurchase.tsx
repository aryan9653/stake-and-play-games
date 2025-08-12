import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Coins, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const TokenPurchase = () => {
  const [usdtAmount, setUsdtAmount] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const calculateGT = (usdt: string) => {
    const amount = parseFloat(usdt) || 0;
    return amount; // 1:1 ratio for demo
  };

  const handlePurchase = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
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

    toast({
      title: "Purchase Successful! 🎮",
      description: `Converted ${usdtAmount} USDT to ${calculateGT(usdtAmount)} GT`,
    });
    setUsdtAmount("");
  };

  const connectWallet = () => {
    setIsConnected(true);
    toast({
      title: "Wallet Connected! 🔗",
      description: "0x1234...5678 connected successfully",
    });
  };

  return (
    <Card className="bg-card border-border shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <Coins className="w-6 h-6 text-white" />
          </div>
          Buy Game Tokens
        </CardTitle>
        <p className="text-muted-foreground">
          Convert USDT to GT at 1:1 ratio
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Connection */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
            <span className="font-medium">
              {isConnected ? "Wallet Connected" : "Connect Wallet"}
            </span>
          </div>
          {!isConnected && (
            <Button variant="outline" size="sm" onClick={connectWallet}>
              Connect
            </Button>
          )}
          {isConnected && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              0x1234...5678
            </Badge>
          )}
        </div>

        {/* Exchange Input */}
        <div className="space-y-4">
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
                className="pl-10"
              />
            </div>
          </div>

          {/* Exchange Arrow */}
          <div className="flex justify-center">
            <div className="p-2 rounded-full bg-gradient-primary">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* GT Output */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">You'll Receive</Label>
            <div className="p-3 rounded-lg bg-secondary border border-border">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-accent" />
                <span className="text-xl font-mono font-semibold">
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
          className="w-full"
          onClick={handlePurchase}
          disabled={!isConnected}
        >
          <Coins className="w-5 h-5" />
          Purchase Game Tokens
        </Button>

        {/* Balance Display */}
        {isConnected && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">USDT Balance</p>
              <p className="text-lg font-semibold font-mono">1,250.00</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">GT Balance</p>
              <p className="text-lg font-semibold font-mono text-accent">
                847.50
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};