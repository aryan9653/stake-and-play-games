# 🎮 GameStake Protocol

**Complete blockchain gaming platform with smart contract escrow, token exchange, and automated payouts**

## 🏗️ Architecture

A full-stack gaming platform built with:

- **Frontend**: React + TypeScript + Tailwind CSS
- **Smart Contracts**: Solidity (Hardhat framework)
- **Backend**: Node.js + Express + ethers.js
- **Database**: In-memory/SQLite for leaderboards
- **Blockchain**: Ethereum-compatible networks

## 📁 Project Structure

```
gamestake-protocol/
├── contracts/           # Smart contracts
│   ├── GameToken.sol   # ERC-20 gaming token
│   ├── TokenStore.sol  # USDT → GT exchange
│   ├── PlayGame.sol    # Match escrow system
│   └── deploy.js       # Deployment script
├── api/                # Backend gateway
├── tools/              # Event indexer & leaderboard
├── src/                # React frontend
└── README.md          # This file
```

## 🔥 Key Features

### Smart Contracts
- **GameToken (GT)**: ERC-20 token with 18 decimals, controlled minting
- **TokenStore**: Secure USDT to GT conversion at 1:1 ratio
- **PlayGame**: Match escrow with automated winner payouts

### Frontend
- **Token Purchase**: Buy GT with USDT through web interface
- **Match Manager**: Create matches, stake tokens, submit results
- **Live Leaderboard**: Real-time player rankings and statistics
- **Wallet Integration**: Connect wallet simulation with balance tracking

### Backend
- **Purchase API**: `/purchase?amount=USDT` - Convert USDT to GT
- **Match API**: `/match/start` - Create and coordinate matches
- **Results API**: `/match/result` - Submit results and trigger payouts

### Leaderboard System
- **Event Monitoring**: Listen to all contract events
- **Player Stats**: Track wins, GT earned, match history
- **Live Rankings**: Sort by total GT won
- **Recent Activity**: Show latest match results

## 🚀 Quick Start

### 1. Smart Contract Deployment

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your RPC URL and private key

# Deploy contracts
npx hardhat run contracts/deploy.js --network mainnet

# Verify on Etherscan
npx hardhat verify CONTRACT_ADDRESS --network mainnet
```

### 2. Backend Setup

```bash
cd api/
npm install

# Configure environment
export ETHEREUM_RPC_URL="https://mainnet.infura.io/v3/YOUR_KEY"
export GAME_TOKEN_ADDRESS="0x..."
export TOKEN_STORE_ADDRESS="0x..."
export PLAY_GAME_ADDRESS="0x..."
export PRIVATE_KEY="0x..."

# Start API server
npm start
```

### 3. Leaderboard Service

```bash
cd tools/
node leaderboard.js
```

### 4. Frontend Development

```bash
# Start React development server
npm run dev
```

## 📊 Smart Contract Flow

### Token Purchase Flow
1. User approves USDT spend to TokenStore
2. Call `TokenStore.buy(usdtAmount)`
3. Contract pulls USDT, mints GT to user
4. Event: `Purchase(buyer, usdtAmount, gtOut)`

### Match Flow
1. Admin calls `PlayGame.createMatch(id, p1, p2, stake)`
2. Both players call `PlayGame.stake(matchId)` 
3. When both staked, match status = STAKED
4. Backend calls `PlayGame.commitResult(matchId, winner)`
5. Winner receives `2 × stake` GT automatically
6. Event: `Settled(matchId, winner, totalPayout)`

### Security Features
- **ReentrancyGuard**: All state-changing functions protected
- **Access Control**: Only authorized addresses can submit results
- **CEI Pattern**: Checks-Effects-Interactions order maintained
- **Idempotency**: Double-submit protection on all critical functions
- **Timeout Refunds**: Players can reclaim stakes after 24h if no result

## 🔒 Security Checklist

✅ **USDT → GT**: 1 USDT mints exactly 1e18 GT  
✅ **Escrow**: Both stakes required before match becomes STAKED  
✅ **Payout**: Winner receives exactly 2 × stake; loser's GT unchanged  
✅ **Double-submit safe**: Second commitResult reverts (status guard)  
✅ **Refund**: Works only after timeout and before a result  
✅ **Events**: Emitted for all critical actions; reader shows leaderboard  

## 🛠️ Development

### Running Tests
```bash
npx hardhat test
```

### Local Development
```bash
# Start local Hardhat network
npx hardhat node

# Deploy to local network
npx hardhat run contracts/deploy.js --network localhost

# Start all services
npm run dev        # Frontend
npm run api        # Backend
npm run leaderboard # Event indexer
```

### Environment Variables
```bash
# Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=0x...

# Contract Addresses (set after deployment)
GAME_TOKEN_ADDRESS=0x...
TOKEN_STORE_ADDRESS=0x...
PLAY_GAME_ADDRESS=0x...
USDT_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7

# API
PORT=3001
LEADERBOARD_PORT=3002
```

## 📈 Production Deployment

### Smart Contracts
1. Deploy to mainnet/testnet using verified Hardhat scripts
2. Verify contracts on Etherscan
3. Set up multi-sig for contract ownership
4. Fund operator address with ETH for gas

### Backend Services
1. Deploy API to cloud provider (AWS/GCP/Heroku)
2. Set up Redis for caching player stats
3. Use PostgreSQL for persistent leaderboard data
4. Monitor with logging (Winston/DataDog)

### Frontend
1. Build production React app: `npm run build`
2. Deploy to CDN (Netlify/Vercel/Cloudflare)
3. Configure custom domain
4. Set up analytics and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Discord**: [GameStake Community](https://discord.gg/gamestake)
- **Docs**: [docs.gamestake.io](https://docs.gamestake.io)
- **Email**: [support@gamestake.io](mailto:support@gamestake.io)

---

**Built with ❤️ for the future of blockchain gaming**