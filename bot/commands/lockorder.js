import { lockOrder, getOrder, getUserTag } from "../services/orderStore.js";
import { fundEscrow } from "../services/genlayer.js";
import { notifyAdmin } from "../services/adminNotifier.js";

export function registerLockOrderCommand(bot) {
  bot.command("lockorder", async (ctx) => {
    const text = ctx.message.text;
    const parts = text.split(" ");

    if (parts.length < 2) {
      await ctx.reply("Usage: /lockorder <Order ID>\nExample: /lockorder ORD-A7X3");
      return;
    }

    const orderId = parts[1].trim().toUpperCase();
    const buyerId = ctx.from.id;
    const buyerTag = getUserTag(ctx);

    // lockOrder checks everything: order exists, OPEN, explorer link, no active order
    const result = lockOrder(orderId, buyerId, buyerTag);

    if (!result.success) {
      await ctx.reply(result.error);
      return;
    }

    const order = result.order;

    await ctx.reply(
      "Locking order and funding escrow with " + order.amount + " GEN...\n" +
        "Please wait while validators process the transaction."
    );

    // Fund the escrow on-chain
    const txResult = await fundEscrow(order.amount);

    if (!txResult.success) {
      // Revert the lock — set back to OPEN
      order.status = "OPEN";
      order.buyerId = null;
      order.buyerTag = null;
      order.explorerLink = null;
      order.lockedAt = null;
      await ctx.reply("Failed to fund escrow: " + txResult.error + "\n\nOrder is still open.");
      return;
    }

    // Notify buyer
    await ctx.reply(
      "Order " + order.id + " is LOCKED!\n\n" +
        "Amount: " + order.amount + " GEN (in escrow)\n" +
        "Tx Hash: " + txResult.txHash + "\n\n" +
        "=============================\n" +
        "  DELIVERY TIME: " + order.deliveryTime + "\n" +
        "=============================\n\n" +
        "Seller " + order.sellerTag + " will deliver.\n\n" +
        "After delivery:\n" +
        "/confirm " + order.id + " — Release funds to seller\n" +
        "/dispute " + order.id + " <reason> — AI arbitration"
    );

    // Notify seller via DM
    try {
      await bot.api.sendMessage(
        order.sellerId,
        "Your order " + order.id + " has been locked by " + buyerTag + "!\n\n" +
          "Amount: " + order.amount + " GEN (in escrow)\n" +
          "Delivery deadline: " + order.deliveryTime + "\n\n" +
          "Start working on delivery now."
      );
    } catch (err) {
      console.log("Could not DM seller:", err.message);
    }

    // Notify admin
    await notifyAdmin(bot, {
      orderId: order.id,
      amount: order.amount,
      sellerTag: order.sellerTag,
      description: order.description,
      buyerTag: buyerTag,
      explorerLink: order.explorerLink,
    });
  });
}
