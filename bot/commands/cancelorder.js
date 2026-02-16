import { cancelOrder } from "../services/orderStore.js";

export function registerCancelOrderCommand(bot) {
  bot.command("cancelorder", async (ctx) => {
    const text = ctx.message.text;
    const parts = text.split(" ");

    if (parts.length < 2) {
      await ctx.reply("Usage: /cancelorder <Order ID>\nExample: /cancelorder ORD-A7X3");
      return;
    }

    const orderId = parts[1].trim().toUpperCase();
    const userId = ctx.from.id;

    const result = cancelOrder(orderId, userId);

    if (!result.success) {
      await ctx.reply(result.error);
      return;
    }

    await ctx.reply(
      "Order " + orderId + " cancelled.\n\n" +
        "You can create a new order with /createorder"
    );
  });
}
