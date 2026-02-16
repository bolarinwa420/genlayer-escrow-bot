import { getOrder } from "../services/orderStore.js";

export function registerDeliveredCommand(bot) {
  bot.command("delivered", async (ctx) => {
    const text = ctx.message.text;
    const parts = text.split(" ");

    if (parts.length < 2) {
      await ctx.reply("Usage: /delivered <Order ID>\nExample: /delivered ORD-A7X3");
      return;
    }

    const orderId = parts[1].trim().toUpperCase();
    const userId = ctx.from.id;
    const order = getOrder(orderId);

    if (!order) {
      await ctx.reply("Order " + orderId + " not found.");
      return;
    }
    if (order.sellerId !== userId) {
      await ctx.reply("Only the seller can mark an order as delivered.");
      return;
    }
    if (order.status !== "LOCKED") {
      await ctx.reply("This order is not locked. Current status: " + order.status);
      return;
    }

    await ctx.reply(
      "Notifying buyer that you've delivered for order " + orderId + "."
    );

    // Notify buyer
    try {
      await bot.api.sendMessage(
        order.buyerId,
        "Seller " + order.sellerTag + " says they've delivered for order " + orderId + "!\n\n" +
          "Description: " + order.description + "\n" +
          "Amount: " + order.amount + " GEN\n\n" +
          "Please review and:\n" +
          "/confirm " + orderId + " — Release funds to seller\n" +
          "/dispute " + orderId + " <reason> — Raise AI dispute"
      );
      await ctx.reply("Buyer " + order.buyerTag + " has been notified.");
    } catch (err) {
      console.log("Could not DM buyer:", err.message);
      await ctx.reply("Could not notify buyer — they may need to message the bot first.");
    }
  });
}
