// Smart contract templates for different dApp types

export const solidityTemplates = {
  erc20: (config: { name: string; symbol: string; initialSupply: string }) => `
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ${config.name}Token is ERC20, Ownable {
    constructor() ERC20("${config.name}", "${config.symbol}") {
        _mint(msg.sender, ${config.initialSupply} * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
`,

  nft: (config: { name: string; symbol: string; baseUri?: string }) => `
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ${config.name}NFT is ERC721, Ownable {
    uint256 private tokenCounter;
    string private baseUri;

    constructor() ERC721("${config.name}", "${config.symbol}") {
        tokenCounter = 0;
        baseUri = "${config.baseUri || 'https://ipfs.io/ipfs/'}";
    }

    function mint(address to) public onlyOwner {
        _safeMint(to, tokenCounter);
        tokenCounter++;
    }

    function getCurrentTokenId() public view returns (uint256) {
        return tokenCounter;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }

    function setBaseURI(string memory _newBaseUri) public onlyOwner {
        baseUri = _newBaseUri;
    }
}
`,

  payment: () => `
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SimplePayment {
    address public owner;
    IERC20 public stablecoin; // cUSD or cEUR

    event PaymentReceived(address indexed from, address indexed to, uint256 amount);
    event PaymentSent(address indexed from, address indexed to, uint256 amount);

    constructor(address _stablecoin) {
        owner = msg.sender;
        stablecoin = IERC20(_stablecoin);
    }

    function sendPayment(address recipient, uint256 amount) public {
        require(stablecoin.transferFrom(msg.sender, recipient, amount), "Payment failed");
        emit PaymentSent(msg.sender, recipient, amount);
    }

    function receivePayment(uint256 amount) public {
        require(stablecoin.transferFrom(msg.sender, address(this), amount), "Payment failed");
        emit PaymentReceived(msg.sender, address(this), amount);
    }

    function withdraw(uint256 amount) public {
        require(msg.sender == owner, "Only owner can withdraw");
        require(stablecoin.transfer(owner, amount), "Withdrawal failed");
    }

    function getBalance() public view returns (uint256) {
        return stablecoin.balanceOf(address(this));
    }
}
`,

  stake: () => `
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SimpleStaking {
    IERC20 public stakingToken;
    IERC20 public rewardToken;
    
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakingTimestamp;
    
    uint256 public rewardRate = 100; // 1% per day
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);

    constructor(address _stakingToken, address _rewardToken) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    function stake(uint256 amount) public {
        require(amount > 0, "Cannot stake 0");
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        if (stakedBalance[msg.sender] > 0) {
            uint256 reward = calculateReward(msg.sender);
            if (reward > 0) {
                rewardToken.transfer(msg.sender, reward);
            }
        }
        
        stakedBalance[msg.sender] += amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) public {
        require(stakedBalance[msg.sender] >= amount, "Insufficient balance");
        
        uint256 reward = calculateReward(msg.sender);
        if (reward > 0) {
            rewardToken.transfer(msg.sender, reward);
        }
        
        stakedBalance[msg.sender] -= amount;
        stakingToken.transfer(msg.sender, amount);
        stakingTimestamp[msg.sender] = block.timestamp;
        
        emit Unstaked(msg.sender, amount);
    }

    function calculateReward(address user) public view returns (uint256) {
        uint256 timeStaked = block.timestamp - stakingTimestamp[user];
        uint256 daysStaked = timeStaked / 1 days;
        return (stakedBalance[user] * rewardRate * daysStaked) / 10000;
    }

    function claimReward() public {
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No rewards available");
        
        stakingTimestamp[msg.sender] = block.timestamp;
        rewardToken.transfer(msg.sender, reward);
        
        emit RewardClaimed(msg.sender, reward);
    }
}
`,

  governance: () => `
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

contract SimpleGovernance {
    IERC20 public governanceToken;
    
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    uint256 public votingPeriod = 3 days;
    
    event ProposalCreated(uint256 indexed proposalId, address proposer, string description);
    event Voted(uint256 indexed proposalId, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(address _governanceToken) {
        governanceToken = IERC20(_governanceToken);
    }

    function propose(string memory description) public returns (uint256) {
        require(governanceToken.balanceOf(msg.sender) > 0, "Must hold governance tokens");
        
        proposalCount++;
        Proposal storage newProposal = proposals[proposalCount];
        newProposal.id = proposalCount;
        newProposal.proposer = msg.sender;
        newProposal.description = description;
        newProposal.endTime = block.timestamp + votingPeriod;
        
        emit ProposalCreated(proposalCount, msg.sender, description);
        return proposalCount;
    }

    function vote(uint256 proposalId, bool support) public {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp < proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 weight = governanceToken.balanceOf(msg.sender);
        require(weight > 0, "No voting power");
        
        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }
        
        proposal.hasVoted[msg.sender] = true;
        emit Voted(proposalId, msg.sender, support, weight);
    }

    function execute(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.endTime, "Voting still active");
        require(!proposal.executed, "Already executed");
        require(proposal.forVotes > proposal.againstVotes, "Proposal rejected");
        
        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }

    function getProposal(uint256 proposalId) public view returns (
        address proposer,
        string memory description,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 endTime,
        bool executed
    ) {
        Proposal storage p = proposals[proposalId];
        return (p.proposer, p.description, p.forVotes, p.againstVotes, p.endTime, p.executed);
    }
}
`,
};

export const reactTemplates = {
  erc20: (config: { name: string; symbol: string }) => `
import { useState } from 'react';

export default function ${config.name}App() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">${config.name} (${config.symbol})</h1>
      <div className="space-y-4">
        <input 
          type="text" 
          placeholder="Recipient Address" 
          value={recipient} 
          onChange={(e) => setRecipient(e.target.value)} 
          className="w-full border rounded px-3 py-2" 
        />
        <input 
          type="number" 
          placeholder="Amount" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          className="w-full border rounded px-3 py-2" 
        />
        <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Transfer Tokens
        </button>
      </div>
    </div>
  );
}
`,

  nft: (config: { name: string; symbol: string }) => `
import { useState } from 'react';

export default function ${config.name}NFTApp() {
  const [recipient, setRecipient] = useState('');

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">${config.name} NFT</h1>
      <div className="space-y-4">
        <input 
          type="text" 
          placeholder="Recipient Address" 
          value={recipient} 
          onChange={(e) => setRecipient(e.target.value)} 
          className="w-full border rounded px-3 py-2" 
        />
        <button className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
          Mint NFT
        </button>
      </div>
    </div>
  );
}
`,

  payment: () => `
import { useState } from 'react';

export default function PaymentApp() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">cUSD Payment</h1>
      <div className="space-y-4">
        <input 
          type="text" 
          placeholder="Recipient Address" 
          value={recipient} 
          onChange={(e) => setRecipient(e.target.value)} 
          className="w-full border rounded px-3 py-2" 
        />
        <input 
          type="number" 
          placeholder="Amount in cUSD" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          className="w-full border rounded px-3 py-2" 
        />
        <button className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Send Payment
        </button>
      </div>
    </div>
  );
}
`,
};
