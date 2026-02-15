import { fundEscrow } from "../services/genlayer.js";

export function registerFundCommand(bot) {
  bot.command("fund", async (ctx) => {
    const text = ctx.message.text;
    const parts = text.split(" ");

    if (parts.length < 2) {
      await ctx.reply(
        "Please specify an amount.\n\nUsage: /fund <amount>\nExample: /fund 100"
      );
      return;
    }

    const amount = parts[1].trim();

    if (isNaN(amount) || Number(amount) <= 0) {
      await ctx.reply("Invalid amount. Please enter a positive number.");
      return;
    }

    // Use raw value (GenLayer doesn't use wei conversion)
    const amountRaw = BigInt(Math.floor(Number(amount))).toString();

    await ctx.reply(
      `Funding escrow with ${amount} GEN...\n` +
        `This may take a moment while validators process the transaction.`
    );

    const result = await fundEscrow(amountRaw);

    if (result.success) {
      await ctx.reply(
        `Escrow funded successfully!\n\n` +
          `Amount: ${amount} GEN\n` +
          `Tx Hash: ${result.txHash}\n\n` +
          `The seller can now deliver the product/service.\n` +
          `Use /confirm when satisfied, or /dispute if there's a problem.`
      );
    } else {
      await ctx.reply(`Failed to fund escrow: ${result.error}`);
    }
  });
}
