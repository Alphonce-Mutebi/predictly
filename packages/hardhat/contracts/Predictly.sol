// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract Predictly is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct PredictionMarket {
        uint256 marketId;
        string cryptoPairName;
        uint256 targetPrice;
        uint256 bettingDeadline;
        uint256 resolutionTime;
        bytes32 priceFeedId;
        uint256 totalYesTokens;
        uint256 totalNoTokens;
        bool isResolved;
        bool result;
    }

    struct UserBet {
        uint256 yesTokens;
        uint256 noTokens;
    }

    IERC20 public token;
    IPyth public priceOracle;
    uint256 public totalMarkets;
    uint256 public constant FEE_RATE = 1;  // 1% fee

    mapping(uint256 => PredictionMarket) public predictionMarkets;
    mapping(uint256 => mapping(address => UserBet)) public userBets;

    event MarketCreated(uint256 indexed marketId, string cryptoPairName, uint256 targetPrice, uint256 bettingDeadline, uint256 resolutionTime);
    event TokensPurchased(uint256 indexed marketId, address indexed user, bool isYes, uint256 amount);
    event TokensSold(uint256 indexed marketId, address indexed user, bool isYes, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool result, uint256 finalPrice);
    event RewardsClaimed(uint256 indexed marketId, address indexed user, uint256 amount);

    constructor(address _token, address _priceOracle) {
        token = IERC20(_token);
        priceOracle = IPyth(_priceOracle);
    }

    function createMarket(
        string memory _cryptoPairName,
        uint256 _targetPrice,
        uint256 _bettingDeadline,
        uint256 _resolutionTime,
        bytes32 _priceFeedId
    ) external {
        require(_bettingDeadline > block.timestamp, "Betting deadline must be in the future");
        require(_resolutionTime > _bettingDeadline, "Resolution time must be after betting deadline");
        require(_targetPrice > 0, "Target price must be greater than 0");

        totalMarkets++;
        predictionMarkets[totalMarkets] = PredictionMarket({
            marketId: totalMarkets,
            cryptoPairName: _cryptoPairName,
            targetPrice: _targetPrice,
            bettingDeadline: _bettingDeadline,
            resolutionTime: _resolutionTime,
            priceFeedId: _priceFeedId,
            totalYesTokens: 0,
            totalNoTokens: 0,
            isResolved: false,
            result: false
        });

        emit MarketCreated(totalMarkets, _cryptoPairName, _targetPrice, _bettingDeadline, _resolutionTime);
    }

    function purchaseTokens(uint256 _marketId, bool _isYes, uint256 _amount) external nonReentrant {
        PredictionMarket storage market = predictionMarkets[_marketId];
        require(block.timestamp < market.bettingDeadline, "Betting period has ended");
        require(!market.isResolved, "Market already resolved");
        require(_amount > 0, "Amount must be greater than 0");

        uint256 fee = (_amount * FEE_RATE) / 100;
        uint256 netAmount = _amount - fee;

        token.safeTransferFrom(msg.sender, address(this), _amount);

        UserBet storage bet = userBets[_marketId][msg.sender];
        if (_isYes) {
            market.totalYesTokens += netAmount;
            bet.yesTokens += netAmount;
        } else {
            market.totalNoTokens += netAmount;
            bet.noTokens += netAmount;
        }

        emit TokensPurchased(_marketId, msg.sender, _isYes, netAmount);
    }

    function sellTokens(uint256 _marketId, bool _isYes, uint256 _amount) external nonReentrant {
        PredictionMarket storage market = predictionMarkets[_marketId];
        require(block.timestamp < market.bettingDeadline, "Betting period has ended");
        require(!market.isResolved, "Market already resolved");
        require(_amount > 0, "Amount must be greater than 0");

        UserBet storage bet = userBets[_marketId][msg.sender];
        if (_isYes) {
            require(bet.yesTokens >= _amount, "Insufficient Yes tokens");
            market.totalYesTokens -= _amount;
            bet.yesTokens -= _amount;
        } else {
            require(bet.noTokens >= _amount, "Insufficient No tokens");
            market.totalNoTokens -= _amount;
            bet.noTokens -= _amount;
        }

        uint256 fee = (_amount * FEE_RATE) / 100;
        uint256 payout = _amount - fee;

        token.safeTransfer(msg.sender, payout);

        emit TokensSold(_marketId, msg.sender, _isYes, _amount);
    }

    function resolveMarket(uint256 _marketId, bytes[] calldata _priceUpdateData) external payable {
        PredictionMarket storage market = predictionMarkets[_marketId];
        require(block.timestamp >= market.resolutionTime, "Too early to resolve");
        require(!market.isResolved, "Market already resolved");

        uint updateFee = priceOracle.getUpdateFee(_priceUpdateData);
        priceOracle.updatePriceFeeds{value: updateFee}(_priceUpdateData);

        PythStructs.Price memory priceData = priceOracle.getPriceNoOlderThan(market.priceFeedId, 60);

        uint256 finalPrice = (uint256(uint64(priceData.price)) * (10 ** 18)) / (10 ** uint8(uint32(-1 * priceData.expo)));

        market.result = finalPrice >= market.targetPrice;
        market.isResolved = true;

        emit MarketResolved(_marketId, market.result, finalPrice);
    }

    function claimRewards(uint256 _marketId) external nonReentrant {
        PredictionMarket storage market = predictionMarkets[_marketId];
        require(market.isResolved, "Market not resolved yet");

        UserBet storage bet = userBets[_marketId][msg.sender];
        uint256 reward = 0;

        if (market.result) {
            reward = (bet.yesTokens * (market.totalYesTokens + market.totalNoTokens)) / market.totalYesTokens;
        } else {
            reward = (bet.noTokens * (market.totalYesTokens + market.totalNoTokens)) / market.totalNoTokens;
        }

        require(reward > 0, "No rewards to claim");

        bet.yesTokens = 0;
        bet.noTokens = 0;

        token.safeTransfer(msg.sender, reward);

        emit RewardsClaimed(_marketId, msg.sender, reward);
    }

    function getUserBet(uint256 _marketId, address _user) external view returns (uint256 yesTokens, uint256 noTokens) {
        UserBet storage bet = userBets[_marketId][_user];
        return (bet.yesTokens, bet.noTokens);
    }

    function getMarketInfo(uint256 _marketId) external view returns (
        string memory cryptoPairName,
        uint256 targetPrice,
        uint256 bettingDeadline,
        uint256 resolutionTime,
        uint256 totalYesTokens,
        uint256 totalNoTokens,
        bool isResolved,
        bool result
    ) {
        PredictionMarket storage market = predictionMarkets[_marketId];
        return (
            market.cryptoPairName,
            market.targetPrice,
            market.bettingDeadline,
            market.resolutionTime,
            market.totalYesTokens,
            market.totalNoTokens,
            market.isResolved,
            market.result
        );
    }

    function listAllMarkets() external view returns (PredictionMarket[] memory) {
        PredictionMarket[] memory markets = new PredictionMarket[](totalMarkets);
        for (uint256 i = 1; i <= totalMarkets; i++) {
            markets[i - 1] = predictionMarkets[i];
        }
        return markets;
    }
}
