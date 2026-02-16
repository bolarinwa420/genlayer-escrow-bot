import "dotenv/config";

export const config = {
  // Telegram Bot Token from @BotFather
  botToken: process.env.BOT_TOKEN,

  // Your wallet private key (the bot operator's key)
  privateKey: process.env.PRIVATE_KEY,

  // Deployed escrow contract address from GenLayer Studio
  contractAddress: process.env.CONTRACT_ADDRESS,

  // GenLayer network endpoint
  // Options: studionet, testnet-asimov
  rpcEndpoint:
    process.env.RPC_ENDPOINT || "https://studio.genlayer.com/api",

  // Chain setting
  chain: process.env.CHAIN || "studionet",

  // Admin Telegram chat ID for order notifications
  adminChatId: process.env.ADMIN_CHAT_ID || null,
};

// Validate required config
const required = ["botToken", "contractAddress"];
for (const key of required) {
  if (!config[key]) {
    console.error(`Missing required env var for: ${key}`);
    console.error("Copy .env.example to .env and fill in your values.");
    process.exit(1);
  }
}
