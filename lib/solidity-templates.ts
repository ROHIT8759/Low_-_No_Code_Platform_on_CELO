/**
 * Optimized Solidity Templates for Celo No-Code Builder
 * These templates are standalone (no external imports) and compile with solc
 */

export interface ContractConfig {
  name: string
  symbol: string
  initialSupply?: string
  baseUri?: string
  stablecoin?: string
  stakingToken?: string
  rewardToken?: string
  governanceToken?: string
}

export const OPTIMIZED_TEMPLATES = {
  erc20: (config: ContractConfig) => `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ${config.name}
 * @dev ERC20 Token implementation with mint and burn functionality
 */
contract ${config.name.replace(/\s+/g, "")} {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
        _mint(msg.sender, _initialSupply);
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(to != address(0), "Invalid recipient");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        require(spender != address(0), "Invalid spender");
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(to != address(0), "Invalid recipient");
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        totalSupply -= amount;
        balanceOf[msg.sender] -= amount;
        emit Burn(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }

    function _mint(address to, uint256 amount) internal {
        require(to != address(0), "Invalid recipient");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Mint(to, amount);
        emit Transfer(address(0), to, amount);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }
}`,

  nft: (config: ContractConfig) => `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ${config.name}
 * @dev ERC721 NFT implementation
 */
contract ${config.name.replace(/\s+/g, "")} {
    string public name;
    string public symbol;
    uint256 private _tokenIdCounter;
    string private _baseTokenURI;
    address public owner;

    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public getApproved;
    mapping(address => mapping(address => bool)) public isApprovedForAll;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
        _baseTokenURI = "${config.baseUri || "https://ipfs.io/ipfs/"}";
    }

    function mint(address to) public onlyOwner returns (uint256) {
        require(to != address(0), "Invalid recipient");
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        ownerOf[tokenId] = to;
        balanceOf[to]++;
        
        emit Transfer(address(0), to, tokenId);
        return tokenId;
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(ownerOf[tokenId] == from, "Not token owner");
        require(
            msg.sender == from || 
            getApproved[tokenId] == msg.sender || 
            isApprovedForAll[from][msg.sender],
            "Not authorized"
        );
        require(to != address(0), "Invalid recipient");

        delete getApproved[tokenId];
        balanceOf[from]--;
        balanceOf[to]++;
        ownerOf[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function approve(address to, uint256 tokenId) public {
        address tokenOwner = ownerOf[tokenId];
        require(msg.sender == tokenOwner || isApprovedForAll[tokenOwner][msg.sender], "Not authorized");
        getApproved[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public {
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(ownerOf[tokenId] != address(0), "Token does not exist");
        return string(abi.encodePacked(_baseTokenURI, _toString(tokenId)));
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }
}`,

  staking: (config: ContractConfig) => `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleStaking
 * @dev Staking contract with time-based rewards
 */
contract SimpleStaking {
    address public stakingToken;
    address public rewardToken;
    address public owner;
    
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakingTimestamp;
    mapping(address => uint256) public lastRewardClaim;
    
    uint256 public constant REWARD_RATE = 100; // 1% per day (basis points)
    uint256 public constant SECONDS_PER_DAY = 86400;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor(address _stakingToken, address _rewardToken) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        owner = msg.sender;
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Cannot stake 0");
        
        // Claim pending rewards before staking more
        if (stakedBalance[msg.sender] > 0) {
            _claimReward(msg.sender);
        }
        
        // Transfer tokens from user
        (bool success, ) = stakingToken.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), amount)
        );
        require(success, "Transfer failed");
        
        stakedBalance[msg.sender] += amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        lastRewardClaim[msg.sender] = block.timestamp;
        
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        
        // Claim rewards before unstaking
        _claimReward(msg.sender);
        
        stakedBalance[msg.sender] -= amount;
        
        // Transfer tokens back to user
        (bool success, ) = stakingToken.call(
            abi.encodeWithSignature("transfer(address,uint256)", msg.sender, amount)
        );
        require(success, "Transfer failed");
        
        emit Unstaked(msg.sender, amount);
    }

    function claimReward() external {
        _claimReward(msg.sender);
    }

    function calculateReward(address user) public view returns (uint256) {
        if (stakedBalance[user] == 0) return 0;
        
        uint256 timeStaked = block.timestamp - lastRewardClaim[user];
        uint256 daysStaked = timeStaked / SECONDS_PER_DAY;
        
        return (stakedBalance[user] * REWARD_RATE * daysStaked) / 10000;
    }

    function _claimReward(address user) internal {
        uint256 reward = calculateReward(user);
        
        if (reward > 0) {
            lastRewardClaim[user] = block.timestamp;
            
            (bool success, ) = rewardToken.call(
                abi.encodeWithSignature("transfer(address,uint256)", user, reward)
            );
            require(success, "Reward transfer failed");
            
            emit RewardClaimed(user, reward);
        }
    }

    function getStakeInfo(address user) external view returns (
        uint256 staked,
        uint256 pendingReward,
        uint256 stakedSince
    ) {
        return (
            stakedBalance[user],
            calculateReward(user),
            stakingTimestamp[user]
        );
    }
}`,

  payment: (config: ContractConfig) => `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimplePayment
 * @dev Payment contract for cUSD/cEUR transactions on Celo
 */
contract SimplePayment {
    address public owner;
    address public stablecoin;

    event PaymentReceived(address indexed from, address indexed to, uint256 amount);
    event PaymentSent(address indexed from, address indexed to, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor(address _stablecoin) {
        owner = msg.sender;
        stablecoin = _stablecoin;
    }

    function sendPayment(address recipient, uint256 amount) external {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        (bool success, ) = stablecoin.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, recipient, amount)
        );
        require(success, "Payment failed");
        
        emit PaymentSent(msg.sender, recipient, amount);
    }

    function receivePayment(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        
        (bool success, ) = stablecoin.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), amount)
        );
        require(success, "Payment failed");
        
        emit PaymentReceived(msg.sender, address(this), amount);
    }

    function withdraw(uint256 amount) external onlyOwner {
        (bool success, bytes memory data) = stablecoin.call(
            abi.encodeWithSignature("balanceOf(address)", address(this))
        );
        require(success, "Balance check failed");
        
        uint256 balance = abi.decode(data, (uint256));
        require(balance >= amount, "Insufficient balance");
        
        (success, ) = stablecoin.call(
            abi.encodeWithSignature("transfer(address,uint256)", owner, amount)
        );
        require(success, "Withdrawal failed");
        
        emit Withdrawn(owner, amount);
    }

    function getBalance() external view returns (uint256) {
        (bool success, bytes memory data) = stablecoin.staticcall(
            abi.encodeWithSignature("balanceOf(address)", address(this))
        );
        require(success, "Balance check failed");
        
        return abi.decode(data, (uint256));
    }
}`,

  governance: (config: ContractConfig) => `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleGovernance
 * @dev Basic governance contract with proposal and voting
 */
contract SimpleGovernance {
    address public governanceToken;
    
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 endTime;
        bool executed;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 3 days;
    
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(address _governanceToken) {
        governanceToken = _governanceToken;
    }

    function propose(string memory description) external returns (uint256) {
        // Check if proposer has governance tokens
        (bool success, bytes memory data) = governanceToken.staticcall(
            abi.encodeWithSignature("balanceOf(address)", msg.sender)
        );
        require(success, "Token balance check failed");
        uint256 balance = abi.decode(data, (uint256));
        require(balance > 0, "Must hold governance tokens");
        
        proposalCount++;
        
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            proposer: msg.sender,
            description: description,
            forVotes: 0,
            againstVotes: 0,
            endTime: block.timestamp + VOTING_PERIOD,
            executed: false
        });
        
        emit ProposalCreated(proposalCount, msg.sender, description);
        return proposalCount;
    }

    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp < proposal.endTime, "Voting period ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        
        // Get voting weight
        (bool success, bytes memory data) = governanceToken.staticcall(
            abi.encodeWithSignature("balanceOf(address)", msg.sender)
        );
        require(success, "Token balance check failed");
        uint256 weight = abi.decode(data, (uint256));
        require(weight > 0, "No voting power");
        
        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }
        
        hasVoted[proposalId][msg.sender] = true;
        emit Voted(proposalId, msg.sender, support, weight);
    }

    function execute(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp >= proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Already executed");
        require(proposal.forVotes > proposal.againstVotes, "Proposal rejected");
        
        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }

    function getProposal(uint256 proposalId) external view returns (
        address proposer,
        string memory description,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 endTime,
        bool executed
    ) {
        Proposal storage p = proposals[proposalId];
        return (
            p.proposer,
            p.description,
            p.forVotes,
            p.againstVotes,
            p.endTime,
            p.executed
        );
    }

    function getProposalCount() external view returns (uint256) {
        return proposalCount;
    }
}`,
}

/**
 * Helper function to get template by type
 */
export function getTemplate(type: string, config: ContractConfig): string {
  const templateFn = OPTIMIZED_TEMPLATES[type as keyof typeof OPTIMIZED_TEMPLATES]
  if (!templateFn) {
    throw new Error(`Template not found for type: ${type}`)
  }
  return templateFn(config)
}
