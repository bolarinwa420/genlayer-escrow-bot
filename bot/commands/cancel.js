import { cancelEscrow } from "../services/genlayer.js";

export function registerCancelCommand(bot) {
  bot.command("cancel", async (ctx) => {
    await ctx.reply(
      "Cancelling escrow and initiating refund...\nPlease wait."
    );

    const result = await cancelEscrow();

    if (result.success) {
      await ctx.reply(
        `Escrow cancelled! Funds refunded to buyer.\n\n` +
          `Tx Hash: ${result.txHash}\n\n` +
          `The escrow is now closed.`
      );
    } else {
      await ctx.reply(`Failed to cancel escrow: ${result.error}`);
    }
  });
}
