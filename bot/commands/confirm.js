import { confirmDelivery } from "../services/genlayer.js";

export function registerConfirmCommand(bot) {
  bot.command("confirm", async (ctx) => {
    await ctx.reply(
      "Confirming delivery...\n" +
        "This will release funds to the seller. Please wait."
    );

    const result = await confirmDelivery();

    if (result.success) {
      await ctx.reply(
        `Delivery confirmed! Funds released to seller.\n\n` +
          `Tx Hash: ${result.txHash}\n\n` +
          `The escrow is now complete. Thank you for using GenLayer Escrow Bot!`
      );
    } else {
      await ctx.reply(`Failed to confirm delivery: ${result.error}`);
    }
  });
}
