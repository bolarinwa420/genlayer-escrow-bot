import { raiseDispute } from "../services/genlayer.js";

export function registerDisputeCommand(bot) {
  bot.command("dispute", async (ctx) => {
    const text = ctx.message.text;
    const reason = text.replace(/^\/dispute\s*/, "").trim();

    if (!reason) {
      await ctx.reply(
        "Please provide a reason for the dispute.\n\n" +
          "Usage: /dispute <reason>\n" +
          "Example: /dispute Seller did not deliver the logo design on time"
      );
      return;
    }

    await ctx.reply(
      `Raising dispute with GenLayer AI validators...\n\n` +
        `Reason: "${reason}"\n\n` +
        `GenLayer validators (each running a different AI model) will now\n` +
        `evaluate this dispute and vote on the outcome.\n` +
        `This may take a minute - AI consensus in action!`
    );

    const result = await raiseDispute(reason);

    if (result.success) {
      await ctx.reply(
        `Dispute resolved by AI validators!\n\n` +
          `Tx Hash: ${result.txHash}\n\n` +
          `The validators have reached consensus on the outcome.\n` +
          `Use /status to see the final result.`
      );
    } else {
      await ctx.reply(`Failed to process dispute: ${result.error}`);
    }
  });
}
