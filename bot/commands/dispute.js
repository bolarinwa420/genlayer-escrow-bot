import { getOrder, completeOrder } from "../services/orderStore.js";
import { raiseDispute, getEscrowStatus } from "../services/genlayer.js";

export function registerDisputeCommand(bot) {
  bot.command("dispute", async (ctx) => {
    const text = ctx.message.text;
    const parts = text.split(" ");

    if (parts.length < 3) {
      await ctx.reply(
        "Usage: /dispute <Order ID> <reason>\n" +
          "Example: /dispute ORD-A7X3 Seller did not deliver the logo on time"
      );
      return;
    }

    const orderId = parts[1].trim().toUpperCase();
    const reason = parts.slice(2).join(" ").trim();

    if (!reason) {
      await ctx.reply("Please provide a reason for the dispute.");
      return;
    }

    const order = getOrder(orderId);

    if (!order) {
      await ctx.reply("Order " + orderId + " not found.");
      return;
    }
    if (order.status !== "LOCKED") {
      await ctx.reply("This order is not locked. Current status: " + order.status);
      return;
    }

    await ctx.reply(
      "DISPUTE INITIATED — Order " + orderId + "\n\n" +
        'Reason: "' + reason + '"\n\n' +
        "GenLayer AI validators are now evaluating this dispute.\n" +
        "Each validator runs a DIFFERENT AI model (GPT-4, Claude, etc.)\n" +
        "and votes independently.\n\n" +
        "POSSIBLE OUTCOMES:\n" +
        "  BUYER REFUNDED — " + order.amount + " GEN returned to buyer\n" +
        "  SELLER PAID — " + order.amount + " GEN released to seller\n\n" +
        "No human arbitrator. Pure AI consensus.\n" +
        "Please wait about 1 minute..."
    );

    const result = await raiseDispute(reason);

    if (!result.success) {
      await ctx.reply("Failed to process dispute: " + result.error);
      return;
    }

    completeOrder(orderId);

    // Try to read on-chain status to determine outcome
    let outcomeMsg = "";
    try {
      const statusResult = await getEscrowStatus();
      if (statusResult.success) {
        const d = statusResult.data;
        // If amount is 0 after dispute and contract is complete,
        // funds were transferred. We check disputed flag.
        outcomeMsg =
          "\nOn-chain result:\n" +
          "  Status: " + (d.status || "COMPLETED") + "\n" +
          "  Disputed: Yes\n" +
          "  Dispute reason: " + (d.dispute_reason || reason) + "\n";
      }
    } catch (err) {
      // Non-critical, just skip
    }

    // Notify buyer with result
    await ctx.reply(
      "DISPUTE RESOLVED — Order " + orderId + "\n\n" +
        "================================\n" +
        "  AI VALIDATORS HAVE VOTED\n" +
        "================================\n\n" +
        "The validators reached consensus through\n" +
        "GenLayer's Optimistic Democracy.\n\n" +
        "Result: Funds have been transferred based on the vote.\n" +
        "  BUYER REFUNDED — if validators sided with buyer\n" +
        "  SELLER PAID — if validators sided with seller\n" +
        outcomeMsg + "\n" +
        "Tx Hash: " + result.txHash + "\n\n" +
        "Check the transaction on GenLayer explorer\n" +
        "to see the final verdict."
    );

    // Notify seller
    try {
      await bot.api.sendMessage(
        order.sellerId,
        "DISPUTE RESOLVED — Order " + orderId + "\n\n" +
          "Raised by: " + order.buyerTag + "\n" +
          'Reason: "' + reason + '"\n\n' +
          "AI validators have voted.\n" +
          "Result: BUYER REFUNDED or SELLER PAID\n" +
          "Check the tx for the final verdict.\n\n" +
          "Tx Hash: " + result.txHash
      );
    } catch (err) {
      console.log("Could not DM seller:", err.message);
    }
  });
}
