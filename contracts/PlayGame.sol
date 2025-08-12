// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PlayGame
 * @dev Escrow and payout system for gaming matches
 */
contract PlayGame is ReentrancyGuard, Ownable {
    IERC20 public immutable gameToken;
    address public operator; // Backend address authorized to commit results
    uint256 public constant MATCH_TIMEOUT = 24 hours;

    enum MatchStatus { CREATED, STAKED, SETTLED, REFUNDED }

    struct Match {
        bytes32 id;
        address player1;
        address player2;
        uint256 stake;
        bool p1Staked;
        bool p2Staked;
        uint256 startTime;
        MatchStatus status;
        address winner;
    }

    mapping(bytes32 => Match) public matches;
    mapping(bytes32 => bool) public matchExists;

    event MatchCreated(
        bytes32 indexed matchId,
        address indexed player1,
        address indexed player2,
        uint256 stake
    );

    event Staked(
        bytes32 indexed matchId,
        address indexed player,
        uint256 amount
    );

    event Settled(
        bytes32 indexed matchId,
        address indexed winner,
        uint256 totalPayout
    );

    event Refunded(
        bytes32 indexed matchId,
        address indexed player1,
        address indexed player2,
        uint256 stake
    );

    modifier onlyOperator() {
        require(msg.sender == operator, "Only operator can call this");
        _;
    }

    modifier matchInStatus(bytes32 matchId, MatchStatus status) {
        require(matchExists[matchId], "Match does not exist");
        require(matches[matchId].status == status, "Invalid match status");
        _;
    }

    constructor(
        address _gameToken,
        address _operator,
        address initialOwner
    ) Ownable(initialOwner) {
        require(_gameToken != address(0), "Invalid GameToken address");
        require(_operator != address(0), "Invalid operator address");
        
        gameToken = IERC20(_gameToken);
        operator = _operator;
    }

    /**
     * @dev Create a new match (owner/manager only)
     */
    function createMatch(
        bytes32 matchId,
        address p1,
        address p2,
        uint256 stake
    ) external onlyOwner {
        require(!matchExists[matchId], "Match already exists");
        require(p1 != address(0) && p2 != address(0), "Invalid player addresses");
        require(p1 != p2, "Players must be different");
        require(stake > 0, "Stake must be greater than 0");

        matches[matchId] = Match({
            id: matchId,
            player1: p1,
            player2: p2,
            stake: stake,
            p1Staked: false,
            p2Staked: false,
            startTime: 0,
            status: MatchStatus.CREATED,
            winner: address(0)
        });

        matchExists[matchId] = true;

        emit MatchCreated(matchId, p1, p2, stake);
    }

    /**
     * @dev Stake tokens for a match
     */
    function stake(bytes32 matchId) 
        external 
        nonReentrant 
        matchInStatus(matchId, MatchStatus.CREATED) 
    {
        Match storage m = matches[matchId];
        
        require(
            msg.sender == m.player1 || msg.sender == m.player2,
            "Not a player in this match"
        );

        bool isPlayer1 = msg.sender == m.player1;
        
        // Check if player already staked (idempotency)
        if (isPlayer1) {
            require(!m.p1Staked, "Player 1 already staked");
        } else {
            require(!m.p2Staked, "Player 2 already staked");
        }

        // Transfer stake from player
        require(
            gameToken.transferFrom(msg.sender, address(this), m.stake),
            "GameToken transfer failed"
        );

        // Mark player as staked
        if (isPlayer1) {
            m.p1Staked = true;
        } else {
            m.p2Staked = true;
        }

        emit Staked(matchId, msg.sender, m.stake);

        // If both players staked, start the match
        if (m.p1Staked && m.p2Staked) {
            m.status = MatchStatus.STAKED;
            m.startTime = block.timestamp;
        }
    }

    /**
     * @dev Commit match result (operator only)
     */
    function commitResult(bytes32 matchId, address winner) 
        external 
        onlyOperator 
        nonReentrant 
        matchInStatus(matchId, MatchStatus.STAKED) 
    {
        Match storage m = matches[matchId];
        
        require(
            winner == m.player1 || winner == m.player2,
            "Winner must be one of the players"
        );

        // Double-submit protection (status check above handles this)
        m.status = MatchStatus.SETTLED;
        m.winner = winner;

        uint256 totalPayout = m.stake * 2;

        // Transfer total stake to winner
        require(
            gameToken.transfer(winner, totalPayout),
            "Winner payout failed"
        );

        emit Settled(matchId, winner, totalPayout);
    }

    /**
     * @dev Refund stakes after timeout
     */
    function refund(bytes32 matchId) 
        external 
        nonReentrant 
        matchInStatus(matchId, MatchStatus.STAKED) 
    {
        Match storage m = matches[matchId];
        
        require(
            block.timestamp >= m.startTime + MATCH_TIMEOUT,
            "Match timeout not reached"
        );

        m.status = MatchStatus.REFUNDED;

        // Refund both players
        if (m.p1Staked) {
            require(
                gameToken.transfer(m.player1, m.stake),
                "Player 1 refund failed"
            );
        }
        
        if (m.p2Staked) {
            require(
                gameToken.transfer(m.player2, m.stake),
                "Player 2 refund failed"
            );
        }

        emit Refunded(matchId, m.player1, m.player2, m.stake);
    }

    /**
     * @dev Update operator address (owner only)
     */
    function setOperator(address newOperator) external onlyOwner {
        require(newOperator != address(0), "Invalid operator address");
        operator = newOperator;
    }

    /**
     * @dev Get match details
     */
    function getMatch(bytes32 matchId) external view returns (Match memory) {
        require(matchExists[matchId], "Match does not exist");
        return matches[matchId];
    }

    /**
     * @dev Check if match is ready for settlement
     */
    function isMatchStaked(bytes32 matchId) external view returns (bool) {
        return matchExists[matchId] && matches[matchId].status == MatchStatus.STAKED;
    }

    /**
     * @dev Check if match can be refunded
     */
    function canRefund(bytes32 matchId) external view returns (bool) {
        if (!matchExists[matchId]) return false;
        
        Match memory m = matches[matchId];
        return m.status == MatchStatus.STAKED && 
               block.timestamp >= m.startTime + MATCH_TIMEOUT;
    }
}