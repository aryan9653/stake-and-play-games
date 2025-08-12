import { TokenPurchase } from "@/components/TokenPurchase";
import { MatchManager } from "@/components/MatchManager";
import { Leaderboard } from "@/components/Leaderboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Shield, Zap, Github } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  GameStake Protocol
                </h1>
                <p className="text-sm text-muted-foreground">
                  Blockchain Gaming Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-accent/20 text-accent">
                Testnet
              </Badge>
              <Button variant="outline" size="sm">
                <Github className="w-4 h-4" />
                View Contracts
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Stake, Play,{" "}
              <span className="bg-gradient-gaming bg-clip-text text-transparent">
                Win
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8">
              Complete blockchain gaming platform with smart contract escrow,
              token exchange, and automated payouts
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50">
                <Shield className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium">Secure Escrow</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Instant Payouts</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50">
                <Gamepad2 className="w-5 h-5 text-gaming-purple" />
                <span className="text-sm font-medium">Fair Gaming</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Token Purchase */}
          <div className="xl:col-span-1">
            <TokenPurchase />
          </div>

          {/* Middle Column - Match Manager */}
          <div className="xl:col-span-1">
            <MatchManager />
          </div>

          {/* Right Column - Leaderboard */}
          <div className="xl:col-span-1">
            <Leaderboard />
          </div>
        </div>

        {/* Smart Contract Info */}
        <section className="mt-16 py-12 border-t border-border">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Smart Contract Architecture</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with secure, auditable smart contracts for transparent gaming
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-card border border-border shadow-lg">
              <div className="p-3 rounded-lg bg-gradient-primary w-fit mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2">GameToken.sol</h4>
              <p className="text-muted-foreground text-sm mb-4">
                ERC-20 token with controlled minting for gaming rewards
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 bg-secondary rounded">
                  <span className="text-accent">mint()</span> - Token creation
                </div>
                <div className="p-2 bg-secondary rounded">
                  <span className="text-accent">18 decimals</span> - Standard precision
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border shadow-lg">
              <div className="p-3 rounded-lg bg-gradient-accent w-fit mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2">TokenStore.sol</h4>
              <p className="text-muted-foreground text-sm mb-4">
                USDT to GT exchange with secure purchase mechanism
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 bg-secondary rounded">
                  <span className="text-accent">buy()</span> - Token purchase
                </div>
                <div className="p-2 bg-secondary rounded">
                  <span className="text-accent">1:1 ratio</span> - USDT to GT
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border shadow-lg">
              <div className="p-3 rounded-lg bg-gradient-gaming w-fit mb-4">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2">PlayGame.sol</h4>
              <p className="text-muted-foreground text-sm mb-4">
                Match escrow and automated payout system
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 bg-secondary rounded">
                  <span className="text-accent">createMatch()</span> - Setup games
                </div>
                <div className="p-2 bg-secondary rounded">
                  <span className="text-accent">stake()</span> - Lock tokens
                </div>
                <div className="p-2 bg-secondary rounded">
                  <span className="text-accent">commitResult()</span> - Distribute rewards
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              Built with React, TypeScript, and Solidity smart contracts
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Complete end-to-end blockchain gaming platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
