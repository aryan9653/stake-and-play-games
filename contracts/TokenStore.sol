// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./GameToken.sol";

/**
 * @title TokenStore
 * @dev USDT to GameToken on-ramp with secure purchase mechanism
 */
contract TokenStore is ReentrancyGuard, Ownable {
    IERC20 public immutable usdt;
    GameToken public immutable gameToken;
    uint256 public immutable gtPerUsdt; // GT tokens per USDT (scaled by 1e6 for USDT decimals)

    event Purchase(
        address indexed buyer, 
        uint256 usdtAmount, 
        uint256 gtOut
    );

    constructor(
        address _usdt,
        address _gameToken,
        uint256 _gtPerUsdt,
        address initialOwner
    ) Ownable(initialOwner) {
        require(_usdt != address(0), "Invalid USDT address");
        require(_gameToken != address(0), "Invalid GameToken address");
        require(_gtPerUsdt > 0, "Invalid exchange rate");

        usdt = IERC20(_usdt);
        gameToken = GameToken(_gameToken);
        gtPerUsdt = _gtPerUsdt; // e.g., 1e18 means 1 USDT = 1 GT
    }

    /**
     * @dev Purchase GameTokens with USDT
     * @param usdtAmount Amount of USDT to spend (6 decimals)
     */
    function buy(uint256 usdtAmount) external nonReentrant {
        require(usdtAmount > 0, "Amount must be greater than 0");

        // Calculate GT output (convert USDT 6 decimals to GT 18 decimals)
        uint256 gtOut = (usdtAmount * gtPerUsdt) / 1e6;
        require(gtOut > 0, "GT output too small");

        // Pull USDT from buyer (CEI pattern - Checks, Effects, Interactions)
        require(
            usdt.transferFrom(msg.sender, address(this), usdtAmount),
            "USDT transfer failed"
        );

        // Mint GT to buyer
        gameToken.mint(msg.sender, gtOut);

        emit Purchase(msg.sender, usdtAmount, gtOut);
    }

    /**
     * @dev Withdraw accumulated USDT (owner only)
     * @param to Address to send USDT to
     * @param amount Amount of USDT to withdraw
     */
    function withdrawUSDT(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        require(
            usdt.balanceOf(address(this)) >= amount,
            "Insufficient USDT balance"
        );

        require(usdt.transfer(to, amount), "USDT transfer failed");
    }

    /**
     * @dev Get contract USDT balance
     */
    function getUSDTBalance() external view returns (uint256) {
        return usdt.balanceOf(address(this));
    }

    /**
     * @dev Calculate GT output for given USDT input
     * @param usdtAmount USDT input amount
     * @return GT output amount
     */
    function calculateGTOutput(uint256 usdtAmount) external view returns (uint256) {
        return (usdtAmount * gtPerUsdt) / 1e6;
    }
}