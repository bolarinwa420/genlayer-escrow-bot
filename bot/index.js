import { Bot } from "grammy";
import { config } from "./config.js";
import { setExplorerLink } from "./services/orderStore.js";
import { isInCreateFlow, processCreateOrderStep } from "./commands/createorder.js";

// Import all command registrations
import { registerStartCommand } from "./commands/start.js";
import { registerCreateOrderCommand } from "./commands/createorder.js";
import { registerCancelOrderCommand } from "./commands/cancelorder.js";
import { registerViewOrderCommand } from "./commands/vieworder.js";
import { registerLockOrderCommand } from "./commands/lockorder.js";
import { registerRejectOrderCommand } from "./commands/rejectorder.js";
import { registerMyOrdersCommand } from "./commands/myorders.js";
import { registerConfirmCommand } from "./commands/confirm.js";
import { registerDisputeCommand } from "./commands/dispute.js";
import { registerCancelCommand } from "./commands/cancel.js";
import { registerDeliveredCommand } from "./commands/delivered.js";

// Initialize bot
const bot = new Bot(config.botToken);

// Register all commands
registerStartCommand(bot);
registerCreateOrderCommand(bot);
registerCancelOrderCommand(bot);
registerViewOrderCommand(bot);
registerLockOrderCommand(bot);
registerRejectOrderCommand(bot);
registerMyOrdersCommand(bot);
registerConfirmCommand(bot);
registerDisputeCommand(bot);
registerCancelCommand(bot);
registerDeliveredCommand(bot);

// Handle non-command text messages:
// 1. Check if user is in a createorder conversation flow
// 2. Check if message contains a GenLayer explorer link
// 3. Otherwise show help
bot.on("message:text", async (ctx) => {
  const text = ctx.message.text;

  // Log every message with chat ID (useful for finding ADMIN_CHAT_ID)
  console.log("Message from " + (ctx.from.username || ctx.from.first_name) + " | User ID: " + ctx.from.id + " | Chat ID: " + ctx.chat.id);

  // Skip commands — they're handled above
  if (text.startsWith("/")) {
    await ctx.reply(
      "Unknown command. Type /help to see available commands."
    );
    return;
  }

  const userId = ctx.from.id;

  // Check if user is in the /createorder step-by-step flow
  if (isInCreateFlow(userId)) {
    await processCreateOrderStep(ctx);
    return;
  }

  // Check for GenLayer explorer link
  const explorerPattern = /(https?:\/\/[^\s]*(?:genlayer|studio\.genlayer)[^\s]*)/i;
  const match = text.match(explorerPattern);

  if (match) {
    const link = match[1];
    setExplorerLink(userId, link);

    // Log the user's chat ID (helpful for setting ADMIN_CHAT_ID)
    console.log("Explorer link from user " + userId + " (chat " + ctx.chat.id + "): " + link);

    await ctx.reply(
      "Explorer link saved!\n\n" +
        link + "\n\n" +
        "You can now lock an order with:\n" +
        "/lockorder <Order ID>"
    );
    return;
  }

  // Default: unknown message
  await ctx.reply(
    "I don't understand that.\nType /help to see available commands."
  );
});

// Error handler
bot.catch((err) => {
  console.error("Bot error:", err.message);
});

// Start the bot
console.log("=================================");
console.log("  GenLayer Escrow Marketplace");
console.log("=================================");
console.log("Contract: " + config.contractAddress);
console.log("Endpoint: " + config.rpcEndpoint);
if (config.adminChatId) {
  console.log("Admin: chat ID " + config.adminChatId);
} else {
  console.log("Admin: ADMIN_CHAT_ID not set (notifications disabled)");
}
console.log("=================================");
console.log("Bot is running! Press Ctrl+C to stop.");

// Graceful shutdown for hosting platforms (Railway, Render, etc.)
function shutdown(signal) {
  console.log(signal + " received — shutting down bot...");
  bot.stop();
  process.exit(0);
}
process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

bot.start();
