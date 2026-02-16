import { getOrder, completeOrder } from "../services/orderStore.js";
import { cancelEscrow } from "../services/genlayer.js";

export function registerCancelCommand(bot) {
  bot.command("cancel", async (ctx) => {
    const text = ctx.message.text;
    const parts = text.split(" ");

    if (parts.length < 2) {
      await ctx.reply("Usage: /cancel <Order ID>\nExample: /cancel ORD-A7X3");
      return;
    }

    const orderId = parts[1].trim().toUpperCase();
    const userId = ctx.from.id;
    const order = getOrder(orderId);

    if (!order) {
      await ctx.reply("Order " + orderId + " not found.");
      return;
    }
    if (order.status !== "LOCKED") {
      await ctx.reply(
        "This order is not locked on-chain. Current status: " + order.status + "\n\n" +
          "Use /cancelorder " + orderId + " to cancel an OPEN order."
      );
      return;
    }
    if (order.buyerId !== userId) {
      await ctx.reply("Only the buyer can cancel a locked order.");
      return;
    }

    await ctx.reply(
      "Cancelling order " + orderId + " and initiating refund...\n" +
        "Please wait."
    );

    const result = await cancelEscrow();

    if (!result.success) {
      await ctx.reply("Failed to cancel escrow: " + result.error);
      return;
    }

    completeOrder(orderId);

    await ctx.reply(
      "Order " + orderId + " cancelled. Funds refunded to buyer.\n\n" +
        "Tx Hash: " + result.txHash
    );

    // Notify seller
    try {
      await bot.api.sendMessage(
        order.sellerId,
        "Order " + orderId + " was cancelled by buyer " + order.buyerTag + ".\n" +
          "Funds have been refunded."
      );
    } catch (err) {
      console.log("Could not DM seller:", err.message);
    }
  });
}
