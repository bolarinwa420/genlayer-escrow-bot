import { Bot } from "grammy";
import { config } from "./config.js";
import { registerStartCommand } from "./commands/start.js";
import { registerStatusCommand } from "./commands/status.js";
import { registerFundCommand } from "./commands/fund.js";
import { registerConfirmCommand } from "./commands/confirm.js";
import { registerDisputeCommand } from "./commands/dispute.js";
import { registerCancelCommand } from "./commands/cancel.js";
import { getWalletAddress } from "./services/genlayer.js";

// Create bot instance
const bot = new Bot(config.botToken);

// Register all commands
registerStartCommand(bot);
registerStatusCommand(bot);
registerFundCommand(bot);
registerConfirmCommand(bot);
registerDisputeCommand(bot);
registerCancelCommand(bot);

// Handle unknown messages
bot.on("message:text", async (ctx) => {
  await ctx.reply(
    "I don't understand that command.\nType /help to see available commands."
  );
});

// Error handler
bot.catch((err) => {
  console.error("Bot error:", err.message);
});

// Start the bot
console.log("=================================");
console.log("  GenLayer Escrow Bot Starting");
console.log("=================================");
console.log(`Contract: ${config.contractAddress}`);
console.log(`Deployer: 0x53aD0e8f9f400431BA4d6b5c8C3Dc6CFFB5F7289`);
console.log(`Endpoint: ${config.rpcEndpoint}`);
console.log("=================================");
console.log("Bot is running! Press Ctrl+C to stop.");

bot.start();
