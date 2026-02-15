# GenLayer Escrow Bot

A Telegram bot for trustless escrow deals powered by **GenLayer Intelligent Contracts** with AI-driven dispute resolution.

## What It Does

- **Buyer** creates an escrow deal and deposits GEN tokens
- **Seller** delivers the product/service off-chain
- **Buyer** confirms delivery (funds release to seller) OR raises a dispute
- **Disputes** are resolved by GenLayer's AI validator consensus - multiple validators running different LLMs evaluate the case and vote

## Why GenLayer?

Traditional escrow needs a trusted third party. GenLayer replaces that with **Optimistic Democracy** - a consensus mechanism where AI validators independently evaluate disputes and reach agreement. No human arbitrator needed.

## Architecture

```
Telegram User
     |
  Telegram Bot (Node.js + grammY)
     |
  GenLayerJS SDK
     |
  GenLayer Network (Studionet / Testnet)
     |
  Escrow Intelligent Contract (Python)
```

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and instructions |
| `/help` | List all commands |
| `/status` | Check current escrow status |
| `/fund <amount>` | Deposit GEN tokens into escrow |
| `/confirm` | Confirm delivery (releases funds to seller) |
| `/dispute <reason>` | Raise an AI-arbitrated dispute |
| `/cancel` | Cancel escrow and get refund |

## Setup Guide

### Step 1: Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Choose a name and username for your bot
4. Copy the **bot token** you receive

### Step 2: Deploy the Smart Contract

1. Go to [GenLayer Studio](https://studio.genlayer.com/contracts)
2. Create a new contract
3. Paste the code from `contracts/escrow.py`
4. Deploy the contract with parameters:
   - `seller_address`: The seller's wallet address
   - `description`: What the escrow is for (e.g., "Logo design service")
5. Copy the **contract address** after deployment

### Step 3: Configure the Bot

```bash
# Clone and enter the project
cd genlayer-escrow-bot

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env
```

Edit `.env` and fill in:
- `BOT_TOKEN` - From Step 1
- `PRIVATE_KEY` - Your wallet private key (with 0x prefix)
- `CONTRACT_ADDRESS` - From Step 2

### Step 4: Run the Bot

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Demo Flow

Here's how to demo the escrow bot:

1. **Start**: Send `/start` to the bot in Telegram
2. **Check Status**: Send `/status` to see the escrow details
3. **Fund**: Send `/fund 10` to deposit 10 GEN tokens
4. **Happy Path**: Send `/confirm` to release funds
5. **Dispute Path**: Send `/dispute The seller delivered a blurry logo instead of HD` to trigger AI arbitration

The dispute flow is the star feature - GenLayer validators will independently evaluate the case using different AI models and vote on the outcome.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Smart Contract | Python + GenVM SDK |
| Bot Framework | grammY (Node.js) |
| Blockchain SDK | GenLayerJS |
| Network | GenLayer Studionet / Testnet |
| Deployment | GenLayer Studio |

## How AI Dispute Resolution Works

When a dispute is raised:

1. Transaction is submitted to GenLayer network
2. A random subset of 5 validators is selected
3. Each validator runs a **different LLM** (GPT-4, Claude, etc.)
4. The lead validator proposes an outcome
5. Other validators independently evaluate and vote
6. Consensus determines: **REFUND** buyer or **RELEASE** to seller
7. Funds are transferred automatically based on the verdict

This is **Optimistic Democracy** - GenLayer's unique consensus mechanism.

## Project Structure

```
genlayer-escrow-bot/
├── contracts/
│   └── escrow.py              # Intelligent Contract (deploy via Studio)
├── bot/
│   ├── index.js               # Bot entry point
│   ├── config.js              # Environment configuration
│   ├── commands/
│   │   ├── start.js           # /start and /help commands
│   │   ├── status.js          # /status command
│   │   ├── fund.js            # /fund command
│   │   ├── confirm.js         # /confirm command
│   │   ├── dispute.js         # /dispute command
│   │   └── cancel.js          # /cancel command
│   └── services/
│       └── genlayer.js        # GenLayerJS SDK wrapper
├── package.json
├── .env.example               # Environment template
├── .gitignore
└── README.md
```

## Links

- [GenLayer Documentation](https://docs.genlayer.com/)
- [GenLayer Studio](https://studio.genlayer.com/contracts)
- [GenLayerJS SDK](https://docs.genlayer.com/api-references/genlayer-js)
- [grammY Telegram Framework](https://grammy.dev/)

## License

MIT
