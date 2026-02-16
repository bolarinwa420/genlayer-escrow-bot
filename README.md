# GenLayer Escrow Marketplace Bot

A Telegram escrow marketplace powered by **GenLayer Intelligent Contracts** with AI-driven dispute resolution.

## What It Does

- **Seller** creates an escrow order with amount, delivery time, and description
- **Buyer** views the order, submits a GenLayer explorer link, and locks the deal
- **Seller** delivers the product/service off-chain and notifies the buyer
- **Buyer** confirms delivery (funds release to seller) OR raises a dispute
- **Disputes** are resolved by GenLayer's AI validator consensus — multiple validators running different LLMs evaluate the case and vote: **BUYER REFUNDED** or **SELLER PAID**
- **Admin** is notified when orders are locked for oversight

## Why GenLayer?

Traditional escrow needs a trusted third party. GenLayer replaces that with **Optimistic Democracy** — a consensus mechanism where AI validators independently evaluate disputes and reach agreement. No human arbitrator needed.

## Architecture

```
Seller (Telegram)          Buyer (Telegram)
       \                      /
        \                    /
     Telegram Bot (Node.js + grammY)
         |              |
   Order Store       Admin Notifier
   (In-Memory)      (@karlkestis)
         |
    GenLayerJS SDK
         |
    GenLayer Network (Studionet / Testnet)
         |
    Escrow Intelligent Contract (Python)
```

## Bot Commands

### Seller Commands

| Command | Description |
|---------|-------------|
| `/createorder` | Create a new order (step-by-step: amount, delivery time, description) |
| `/cancelorder <ID>` | Cancel an open order (before buyer locks it) |
| `/delivered <ID>` | Notify buyer that you've delivered |
| `/myorders` | View all your orders |

### Buyer Commands

| Command | Description |
|---------|-------------|
| `/vieworder <ID>` | View order details (amount, delivery time, seller) |
| `/lockorder <ID>` | Lock order and fund escrow on-chain |
| `/rejectorder <ID>` | Reject an order (seller notified) |

### After Deal is Locked

| Command | Description |
|---------|-------------|
| `/confirm <ID>` | Confirm delivery — releases funds to seller |
| `/dispute <ID> <reason>` | Raise an AI-powered dispute — validators vote |
| `/cancel <ID>` | Cancel and refund buyer |

### General

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and full instructions |
| `/help` | List all commands |

## Demo Flow

### Happy Path (No Dispute)

1. **Seller** sends `/createorder` — bot asks amount, delivery time, description step by step
2. **Seller** gets an Order ID (e.g., `ORD-A7X3`) and shares it with the buyer
3. **Buyer** sends `/vieworder ORD-A7X3` — sees order details with delivery time highlighted
4. **Buyer** pastes a GenLayer explorer link in the chat — bot saves it and notifies admin
5. **Buyer** sends `/lockorder ORD-A7X3` — escrow funded on-chain, seller notified
6. **Seller** delivers the product/service, then sends `/delivered ORD-A7X3` — buyer notified
7. **Buyer** sends `/confirm ORD-A7X3` — funds released to seller. Deal complete.

### Dispute Path (AI Arbitration)

1. Steps 1–6 same as above
2. **Buyer** sends `/dispute ORD-A7X3 Seller delivered a blurry 100x100 logo instead of HD`
3. GenLayer validators (each running a **different AI model**) independently evaluate the dispute
4. Validators vote: **BUYER REFUNDED** or **SELLER PAID**
5. Funds transferred automatically based on AI consensus

The dispute flow is the star feature — true AI arbitration with no human in the loop.

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
git clone https://github.com/bolarinwa420/genlayer-escrow-bot.git
cd genlayer-escrow-bot

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env
```

Edit `.env` and fill in:
- `BOT_TOKEN` — From Step 1
- `PRIVATE_KEY` — Your wallet private key (with 0x prefix)
- `CONTRACT_ADDRESS` — From Step 2
- `ADMIN_CHAT_ID` — Your Telegram chat ID (for order lock notifications)

### Step 4: Run the Bot

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Smart Contract | Python + GenVM SDK |
| Bot Framework | grammY (Node.js) |
| Blockchain SDK | GenLayerJS v0.18.10 |
| Network | GenLayer Studionet / Testnet |
| Deployment | GenLayer Studio |
| Order Storage | In-memory (demo) |

## How AI Dispute Resolution Works

When a dispute is raised:

1. Transaction is submitted to GenLayer network
2. A random subset of validators is selected
3. Each validator runs a **different LLM** (GPT-4, Claude, etc.)
4. The lead validator proposes an outcome
5. Other validators independently evaluate and vote
6. Consensus determines: **BUYER REFUNDED** or **SELLER PAID**
7. Funds are transferred automatically based on the verdict

This is **Optimistic Democracy** — GenLayer's unique consensus mechanism.

## Project Structure

```
genlayer-escrow-bot/
├── contracts/
│   └── escrow.py                # Intelligent Contract (deploy via Studio)
├── bot/
│   ├── index.js                 # Bot entry point + explorer link detection
│   ├── config.js                # Environment configuration
│   ├── commands/
│   │   ├── start.js             # /start and /help
│   │   ├── createorder.js       # /createorder (step-by-step flow)
│   │   ├── cancelorder.js       # /cancelorder
│   │   ├── vieworder.js         # /vieworder
│   │   ├── lockorder.js         # /lockorder (funds escrow on-chain)
│   │   ├── rejectorder.js       # /rejectorder
│   │   ├── delivered.js         # /delivered (seller notifies buyer)
│   │   ├── confirm.js           # /confirm (release funds)
│   │   ├── dispute.js           # /dispute (AI arbitration)
│   │   ├── cancel.js            # /cancel (refund)
│   │   └── myorders.js          # /myorders
│   └── services/
│       ├── genlayer.js          # GenLayerJS SDK wrapper
│       ├── orderStore.js        # In-memory order management
│       └── adminNotifier.js     # Admin notification service
├── package.json
├── .env.example                 # Environment template
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
