/**
 * GameStake Leaderboard Service
 * 
 * Event listener and leaderboard API for tracking player statistics
 * Monitors blockchain events and maintains player rankings
 */

const { ethers } = require('ethers');
const express = require('express');
const cors = require('cors');

// In-memory storage (use SQLite/Redis for production)
const playerStats = new Map();
const recentMatches = [];

class LeaderboardService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    this.app = express();
    this.setupAPI();
    this.startEventListeners();
  }

  setupAPI() {
    this.app.use(cors());
    this.app.use(express.json());

    // Get top players leaderboard
    this.app.get('/leaderboard', (req, res) => {
      const limit = parseInt(req.query.limit) || 10;
      
      const sortedPlayers = Array.from(playerStats.entries())
        .map(([address, stats]) => ({
          address,
          ...stats,
          winRate: stats.matchesPlayed > 0 ? (stats.wins / stats.matchesPlayed * 100) : 0
        }))
        .sort((a, b) => b.totalGTWon - a.totalGTWon)
        .slice(0, limit);

      res.json({
        leaderboard: sortedPlayers,
        totalPlayers: playerStats.size,
        totalMatches: recentMatches.length
      });
    });

    // Get player statistics
    this.app.get('/player/:address', (req, res) => {
      const address = req.params.address.toLowerCase();
      const stats = playerStats.get(address) || {
        wins: 0,
        totalGTWon: 0,
        matchesPlayed: 0
      };

      res.json({
        address,
        ...stats,
        winRate: stats.matchesPlayed > 0 ? (stats.wins / stats.matchesPlayed * 100) : 0
      });
    });

    // Get recent activity
    this.app.get('/recent', (req, res) => {
      const limit = parseInt(req.query.limit) || 10;
      res.json({
        recentMatches: recentMatches.slice(-limit).reverse()
      });
    });
  }

  async startEventListeners() {
    console.log('🎮 Starting GameStake event listeners...');

    // Contract addresses from environment
    const gameTokenAddress = process.env.GAME_TOKEN_ADDRESS;
    const tokenStoreAddress = process.env.TOKEN_STORE_ADDRESS; 
    const playGameAddress = process.env.PLAY_GAME_ADDRESS;

    // Contract ABIs (simplified for events)
    const playGameABI = [
      'event MatchCreated(bytes32 indexed matchId, address indexed player1, address indexed player2, uint256 stake)',
      'event Staked(bytes32 indexed matchId, address indexed player, uint256 amount)',
      'event Settled(bytes32 indexed matchId, address indexed winner, uint256 totalPayout)',
      'event Refunded(bytes32 indexed matchId, address indexed player1, address indexed player2, uint256 stake)'
    ];

    const tokenStoreABI = [
      'event Purchase(address indexed buyer, uint256 usdtAmount, uint256 gtOut)'
    ];

    // Initialize contracts
    const playGameContract = new ethers.Contract(playGameAddress, playGameABI, this.provider);
    const tokenStoreContract = new ethers.Contract(tokenStoreAddress, tokenStoreABI, this.provider);

    // Listen to Purchase events
    tokenStoreContract.on('Purchase', (buyer, usdtAmount, gtOut, event) => {
      console.log(`💰 Purchase: ${buyer} bought ${ethers.formatEther(gtOut)} GT`);
      
      // Update player stats for token purchase
      this.updatePlayerStats(buyer.toLowerCase(), {
        tokensPurchased: Number(ethers.formatEther(gtOut))
      });
    });

    // Listen to Match Created events
    playGameContract.on('MatchCreated', (matchId, player1, player2, stake, event) => {
      console.log(`🎮 Match Created: ${matchId} - ${player1} vs ${player2}`);
      
      recentMatches.push({
        matchId,
        player1: player1.toLowerCase(),
        player2: player2.toLowerCase(),
        stake: Number(ethers.formatEther(stake)),
        status: 'created',
        timestamp: Date.now()
      });
    });

    // Listen to Staked events
    playGameContract.on('Staked', (matchId, player, amount, event) => {
      console.log(`💎 Staked: ${player} staked ${ethers.formatEther(amount)} GT for ${matchId}`);
      
      // Update match status
      const match = recentMatches.find(m => m.matchId === matchId);
      if (match) {
        match.status = 'staked';
      }
    });

    // Listen to Settled events (most important for leaderboard)
    playGameContract.on('Settled', (matchId, winner, totalPayout, event) => {
      console.log(`🏆 Match Settled: ${winner} won ${ethers.formatEther(totalPayout)} GT from ${matchId}`);
      
      // Update winner statistics
      this.updatePlayerStats(winner.toLowerCase(), {
        wins: 1,
        totalGTWon: Number(ethers.formatEther(totalPayout)),
        matchesPlayed: 1
      });

      // Find and update the match
      const match = recentMatches.find(m => m.matchId === matchId);
      if (match) {
        match.status = 'settled';
        match.winner = winner.toLowerCase();
        match.payout = Number(ethers.formatEther(totalPayout));

        // Update loser statistics (played but didn't win)
        const loser = match.player1 === winner.toLowerCase() ? match.player2 : match.player1;
        this.updatePlayerStats(loser, {
          matchesPlayed: 1
        });
      }
    });

    // Listen to Refunded events
    playGameContract.on('Refunded', (matchId, player1, player2, stake, event) => {
      console.log(`🔄 Match Refunded: ${matchId} - ${ethers.formatEther(stake)} GT returned to players`);
      
      // Update match status
      const match = recentMatches.find(m => m.matchId === matchId);
      if (match) {
        match.status = 'refunded';
      }
    });

    console.log('✅ Event listeners started successfully');
  }

  updatePlayerStats(address, updates) {
    const current = playerStats.get(address) || {
      wins: 0,
      totalGTWon: 0,
      matchesPlayed: 0,
      tokensPurchased: 0
    };

    playerStats.set(address, {
      wins: current.wins + (updates.wins || 0),
      totalGTWon: current.totalGTWon + (updates.totalGTWon || 0),
      matchesPlayed: current.matchesPlayed + (updates.matchesPlayed || 0),
      tokensPurchased: current.tokensPurchased + (updates.tokensPurchased || 0)
    });
  }

  start(port = 3002) {
    this.app.listen(port, () => {
      console.log(`🚀 Leaderboard API running on port ${port}`);
      console.log(`📊 Leaderboard: http://localhost:${port}/leaderboard`);
      console.log(`📈 Recent matches: http://localhost:${port}/recent`);
    });
  }
}

// Initialize and start the service
if (require.main === module) {
  require('dotenv').config();
  
  const service = new LeaderboardService();
  service.start();
}

module.exports = LeaderboardService;