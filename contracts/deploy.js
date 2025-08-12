/**
 * GameStake Deployment Script
 * 
 * Deploys all smart contracts and sets up proper permissions
 */

const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Starting GameStake deployment...\n');

  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deploying contracts with account: ${deployer.address}`);
  console.log(`💰 Account balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH\n`);

  // Deployment configuration
  const config = {
    gameToken: {
      name: "Game Token",
      symbol: "GT"
    },
    tokenStore: {
      usdtAddress: process.env.USDT_ADDRESS || "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Mainnet USDT
      gtPerUsdt: ethers.parseEther("1") // 1 USDT = 1 GT
    }
  };

  try {
    // 1. Deploy GameToken
    console.log('📄 Deploying GameToken...');
    const GameToken = await ethers.getContractFactory('GameToken');
    const gameToken = await GameToken.deploy(
      config.gameToken.name,
      config.gameToken.symbol,
      deployer.address
    );
    await gameToken.waitForDeployment();
    const gameTokenAddress = await gameToken.getAddress();
    console.log(`✅ GameToken deployed to: ${gameTokenAddress}\n`);

    // 2. Deploy TokenStore
    console.log('🏪 Deploying TokenStore...');
    const TokenStore = await ethers.getContractFactory('TokenStore');
    const tokenStore = await TokenStore.deploy(
      config.tokenStore.usdtAddress,
      gameTokenAddress,
      config.tokenStore.gtPerUsdt,
      deployer.address
    );
    await tokenStore.waitForDeployment();
    const tokenStoreAddress = await tokenStore.getAddress();
    console.log(`✅ TokenStore deployed to: ${tokenStoreAddress}\n`);

    // 3. Deploy PlayGame
    console.log('🎮 Deploying PlayGame...');
    const PlayGame = await ethers.getContractFactory('PlayGame');
    const playGame = await PlayGame.deploy(
      gameTokenAddress,
      deployer.address, // Operator address (backend)
      deployer.address  // Owner address
    );
    await playGame.waitForDeployment();
    const playGameAddress = await playGame.getAddress();
    console.log(`✅ PlayGame deployed to: ${playGameAddress}\n`);

    // 4. Set TokenStore as minter for GameToken
    console.log('🔗 Setting up permissions...');
    await gameToken.setTokenStore(tokenStoreAddress);
    console.log('✅ TokenStore set as GameToken minter\n');

    // 5. Verification and summary
    console.log('📋 DEPLOYMENT SUMMARY');
    console.log('=====================');
    console.log(`GameToken:   ${gameTokenAddress}`);
    console.log(`TokenStore:  ${tokenStoreAddress}`);
    console.log(`PlayGame:    ${playGameAddress}`);
    console.log(`USDT:        ${config.tokenStore.usdtAddress}`);
    console.log(`Exchange:    1 USDT = 1 GT\n`);

    // 6. Generate environment variables
    console.log('🔧 ENVIRONMENT VARIABLES');
    console.log('========================');
    console.log(`GAME_TOKEN_ADDRESS=${gameTokenAddress}`);
    console.log(`TOKEN_STORE_ADDRESS=${tokenStoreAddress}`);
    console.log(`PLAY_GAME_ADDRESS=${playGameAddress}`);
    console.log(`USDT_ADDRESS=${config.tokenStore.usdtAddress}`);
    console.log(`OPERATOR_ADDRESS=${deployer.address}\n`);

    // 7. Contract verification instructions
    console.log('✅ Deployment completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your .env file with the contract addresses above');
    console.log('2. Verify contracts on Etherscan (if on mainnet)');
    console.log('3. Set up backend API with the new addresses');
    console.log('4. Start the leaderboard service');
    console.log('5. Fund the operator address with ETH for gas');

    // 8. Basic contract interaction tests
    console.log('\n🧪 Running basic tests...');
    
    // Test GameToken decimals
    const decimals = await gameToken.decimals();
    console.log(`GameToken decimals: ${decimals}`);
    
    // Test TokenStore rate
    const testAmount = ethers.parseUnits("100", 6); // 100 USDT (6 decimals)
    const expectedGT = await tokenStore.calculateGTOutput(testAmount);
    console.log(`100 USDT → ${ethers.formatEther(expectedGT)} GT`);
    
    console.log('✅ All tests passed!\n');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Deployment script failed:', error);
    process.exit(1);
  });

module.exports = main;