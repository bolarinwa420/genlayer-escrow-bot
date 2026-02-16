import { getWalletAddress } from "../services/genlayer.js";

export function registerStartCommand(bot) {
  bot.command("start", async (ctx) => {
    const walletAddress = getWalletAddress();

    await ctx.reply(
      "GenLayer Escrow Marketplace\n\n" +
        "Trustless escrow deals powered by AI dispute resolution.\n\n" +
        "Bot Wallet: " + walletAddress + "\n\n" +
        "SELLER COMMANDS:\n" +
        "/createorder — Create a new escrow order (step-by-step)\n" +
        "/cancelorder <ID> — Cancel an open order\n" +
        "/delivered <ID> — Notify buyer you've delivered\n" +
        "/myorders — View your orders\n\n" +
        "BUYER COMMANDS:\n" +
        "/vieworder <ID> — View order details\n" +
        "/lockorder <ID> — Lock order and fund escrow\n" +
        "/rejectorder <ID> — Reject an order\n\n" +
        "AFTER LOCKING:\n" +
        "/confirm <ID> — Confirm delivery (release funds)\n" +
        "/dispute <ID> <reason> — AI-powered dispute resolution\n" +
        "/cancel <ID> — Cancel and get refund\n\n" +
        "HOW IT WORKS:\n" +
        "1. Seller creates an order with /createorder\n" +
        "2. Seller shares the Order ID with buyer\n" +
        "3. Buyer views order with /vieworder\n" +
        "4. Buyer pastes GenLayer explorer link\n" +
        "5. Buyer locks order with /lockorder\n" +
        "6. Seller delivers the product/service\n" +
        "7. Buyer confirms OR raises an AI dispute\n\n" +
        "Disputes are resolved by GenLayer AI validators —\n" +
        "multiple AI models vote independently. No human needed.\n\n" +
        "Type /help for the command list."
    );
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      "ESCROW MARKETPLACE COMMANDS:\n\n" +
        "SELLER:\n" +
        "/createorder — New order (step-by-step)\n" +
        "/cancelorder <ID> — Cancel open order\n" +
        "/delivered <ID> — Notify buyer of delivery\n" +
        "/myorders — List your orders\n\n" +
        "BUYER:\n" +
        "/vieworder <ID> — View order details\n" +
        "/lockorder <ID> — Lock and fund escrow\n" +
        "/rejectorder <ID> — Reject order\n\n" +
        "AFTER DEAL IS LOCKED:\n" +
        "/confirm <ID> — Release funds to seller\n" +
        "/dispute <ID> <reason> — AI dispute resolution\n" +
        "/cancel <ID> — Cancel and refund\n\n" +
        "EXAMPLE FLOW:\n" +
        "Seller: /createorder\n" +
        "Buyer: /vieworder ORD-A7X3\n" +
        "Buyer: paste explorer link\n" +
        "Buyer: /lockorder ORD-A7X3\n" +
        "Buyer: /confirm ORD-A7X3"
    );
  });
}
