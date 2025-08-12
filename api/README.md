# GameStake Backend API

Backend gateway for blockchain gaming platform with smart contract integration.

## Features

- **Token Purchase API**: USDT to GT conversion endpoint
- **Match Management**: Create matches and coordinate staking
- **Result Submission**: Automated payout processing
- **Event Monitoring**: Real-time blockchain event tracking

## Environment Setup

```bash
# Required environment variables
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=0x...  # Backend operator private key
GAME_TOKEN_ADDRESS=0x...
TOKEN_STORE_ADDRESS=0x...
PLAY_GAME_ADDRESS=0x...
PORT=3001
```

## API Endpoints

### GET /purchase
Convert USDT to Game Tokens
```bash
curl -X GET "http://localhost:3001/purchase?amount=100"
```

### POST /match/start
Create and initialize a new match
```bash
curl -X POST http://localhost:3001/match/start \
  -H "Content-Type: application/json" \
  -d '{
    "matchId": "match_123",
    "player1": "0x...",
    "player2": "0x...",
    "stake": "100"
  }'
```

### POST /match/result
Submit match results and trigger payouts
```bash
curl -X POST http://localhost:3001/match/result \
  -H "Content-Type: application/json" \
  -d '{
    "matchId": "match_123",
    "winner": "0x..."
  }'
```

## Installation

```bash
npm install express ethers dotenv cors helmet
npm install -D @types/express @types/node typescript ts-node
```

## Running

```bash
# Development
npm run dev

# Production  
npm start
```

## Smart Contract Integration

The backend integrates with three main contracts:

1. **GameToken.sol** - ERC-20 token for gaming
2. **TokenStore.sol** - USDT to GT exchange
3. **PlayGame.sol** - Match escrow and payouts

All transactions are signed by the backend operator key for automated processing.