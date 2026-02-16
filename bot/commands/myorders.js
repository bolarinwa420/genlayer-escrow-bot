import { getOrdersByUser } from "../services/orderStore.js";

export function registerMyOrdersCommand(bot) {
  bot.command("myorders", async (ctx) => {
    const userId = ctx.from.id;
    const orders = getOrdersByUser(userId);

    if (orders.length === 0) {
      await ctx.reply("You have no orders yet.\n\nSellers: /createorder\nBuyers: /vieworder <ID>");
      return;
    }

    let msg = "YOUR ORDERS:\n\n";

    for (const order of orders) {
      const role = order.sellerId === userId ? "SELLER" : "BUYER";
      msg +=
        order.id + " [" + order.status + "] — " + role + "\n" +
        "  " + order.amount + " GEN | " + order.description + "\n\n";
    }

    msg += "Use /vieworder <ID> for details.";

    await ctx.reply(msg);
  });
}
