import { getOrder, completeOrder } from "../services/orderStore.js";
import { confirmDelivery } from "../services/genlayer.js";

export function registerConfirmCommand(bot) {
  bot.command("confirm", async (ctx) => {
    const text = ctx.message.text;
    const parts = text.split(" ");

    if (parts.length < 2) {
      await ctx.reply("Usage: /confirm <Order ID>\nExample: /confirm ORD-A7X3");
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
      await ctx.reply("This order is not locked. Current status: " + order.status);
      return;
    }
    if (order.buyerId !== userId) {
      await ctx.reply("Only the buyer can confirm delivery.");
      return;
    }

    await ctx.reply(
      "Confirming delivery for order " + orderId + "...\n" +
        "This will release " + order.amount + " GEN to " + order.sellerTag + ".\n" +
        "Please wait."
    );

    const result = await confirmDelivery();

    if (!result.success) {
      await ctx.reply("Failed to confirm delivery: " + result.error);
      return;
    }

    completeOrder(orderId);

    await ctx.reply(
      "Delivery confirmed for order " + orderId + "!\n\n" +
        "Funds released to seller " + order.sellerTag + ".\n" +
        "Tx Hash: " + result.txHash + "\n\n" +
        "Deal complete. Thanks for using GenLayer Escrow!"
    );

    // Notify seller
    try {
      await bot.api.sendMessage(
        order.sellerId,
        "Order " + orderId + " — delivery confirmed by " + order.buyerTag + "!\n" +
          "Funds (" + order.amount + " GEN) released to you.\n\n" +
          "Tx Hash: " + result.txHash
      );
    } catch (err) {
      console.log("Could not DM seller:", err.message);
    }
  });
}
