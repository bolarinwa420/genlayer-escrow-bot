import { getEscrowStatus } from "../services/genlayer.js";

export function registerStatusCommand(bot) {
  bot.command("status", async (ctx) => {
    await ctx.reply("Fetching escrow status from GenLayer...");

    const result = await getEscrowStatus();

    if (!result.success) {
      await ctx.reply(`Failed to fetch status: ${result.error}`);
      return;
    }

    const d = result.data;
    const statusEmoji = {
      CREATED: "NEW",
      FUNDED: "FUNDED",
      DISPUTED: "DISPUTED",
      COMPLETED: "DONE",
    };

    const label = statusEmoji[d.status] || d.status;

    await ctx.reply(
      `ESCROW STATUS: [${label}]\n\n` +
        `Buyer: ${d.buyer || "N/A"}\n` +
        `Seller: ${d.seller || "N/A"}\n` +
        `Amount: ${d.amount || "0"} GEN\n` +
        `Description: ${d.description || "N/A"}\n` +
        `Disputed: ${d.disputed === "True" ? "Yes" : "No"}\n` +
        (d.dispute_reason
          ? `Dispute Reason: ${d.dispute_reason}\n`
          : "")
    );
  });
}
