// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GameToken
 * @dev ERC-20 token for the gaming platform with minting controlled by TokenStore
 */
contract GameToken is ERC20, Ownable {
    address public tokenStore;

    event Minted(address indexed to, uint256 amount);

    modifier onlyTokenStore() {
        require(msg.sender == tokenStore, "Only TokenStore can mint");
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {}

    /**
     * @dev Set the TokenStore contract address (one-time setup)
     */
    function setTokenStore(address _tokenStore) external onlyOwner {
        require(tokenStore == address(0), "TokenStore already set");
        require(_tokenStore != address(0), "Invalid TokenStore address");
        tokenStore = _tokenStore;
    }

    /**
     * @dev Mint tokens - only callable by TokenStore contract
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (18 decimals)
     */
    function mint(address to, uint256 amount) external onlyTokenStore {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(to, amount);
        emit Minted(to, amount);
    }

    /**
     * @dev Returns the number of decimals used to get user representation
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}