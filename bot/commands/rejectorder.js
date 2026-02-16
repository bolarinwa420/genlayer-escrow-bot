import { rejectOrder, getUserTag } from "../services/orderStore.js";

export function registerRejectOrderCommand(bot) {
  bot.command("rejectorder", async (ctx) => {
    const text = ctx.message.text;
    const parts = text.split(" ");

    if (parts.length < 2) {
      await ctx.reply("Usage: /rejectorder <Order ID>\nExample: /rejectorder ORD-A7X3");
      return;
    }

    const orderId = parts[1].trim().toUpperCase();
    const buyerId = ctx.from.id;
    const buyerTag = getUserTag(ctx);

    const result = rejectOrder(orderId, buyerId, buyerTag);

    if (!result.success) {
      await ctx.reply(result.error);
      return;
    }

    const order = result.order;

    await ctx.reply("Order " + orderId + " rejected. Deal closed.");

    // Notify seller
    try {
      await ctx.api.sendMessage(
        order.sellerId,
        "Order " + order.id + " was rejected by " + buyerTag + ".\n\n" +
          "You can create a new order with /createorder"
      );
    } catch (err) {
      console.log("Could not DM seller:", err.message);
    }
  });
}
