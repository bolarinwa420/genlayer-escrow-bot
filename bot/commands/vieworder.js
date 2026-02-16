import { getOrder } from "../services/orderStore.js";

export function registerViewOrderCommand(bot) {
  bot.command("vieworder", async (ctx) => {
    const text = ctx.message.text;
    const parts = text.split(" ");

    if (parts.length < 2) {
      await ctx.reply("Usage: /vieworder <Order ID>\nExample: /vieworder ORD-A7X3");
      return;
    }

    const orderId = parts[1].trim().toUpperCase();
    const order = getOrder(orderId);

    if (!order) {
      await ctx.reply("Order " + orderId + " not found. Check the ID and try again.");
      return;
    }

    const statusLabel = {
      OPEN: "OPEN — Waiting for buyer",
      LOCKED: "LOCKED — Escrow funded, deal in progress",
      REJECTED: "REJECTED — Buyer declined",
      CANCELLED: "CANCELLED — Seller cancelled",
      COMPLETED: "COMPLETED — Deal finished",
    };

    let msg =
      "ORDER: " + order.id + "\n" +
      "Status: " + (statusLabel[order.status] || order.status) + "\n\n" +
      "Amount: " + order.amount + " GEN\n\n" +
      "=============================\n" +
      "  DELIVERY TIME: " + order.deliveryTime + "\n" +
      "=============================\n\n" +
      "Description: " + order.description + "\n" +
      "Seller: " + order.sellerTag + "\n";

    if (order.buyerTag) {
      msg += "Buyer: " + order.buyerTag + "\n";
    }

    if (order.status === "OPEN") {
      msg +=
        "\nTo proceed with this order:\n" +
        "1. Paste your GenLayer explorer link in this chat\n" +
        "2. Then use: /lockorder " + order.id + "\n\n" +
        "To decline: /rejectorder " + order.id;
    }

    if (order.status === "LOCKED") {
      msg +=
        "\nAfter delivery:\n" +
        "/confirm " + order.id + " — Release funds to seller\n" +
        "/dispute " + order.id + " <reason> — AI arbitration";
    }

    await ctx.reply(msg);
  });
}
