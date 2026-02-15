import { getWalletAddress } from "../services/genlayer.js";

export function registerStartCommand(bot) {
  bot.command("start", async (ctx) => {
    const walletAddress = getWalletAddress();

    await ctx.reply(
      `Welcome to the GenLayer Escrow Bot!\n\n` +
        `This bot lets you manage trustless escrow deals powered by GenLayer's AI-driven blockchain.\n\n` +
        `Bot Wallet: ${walletAddress}\n\n` +
        `COMMANDS:\n` +
        `/status - Check current escrow status\n` +
        `/fund <amount> - Deposit GEN tokens into escrow\n` +
        `/confirm - Confirm delivery (releases funds to seller)\n` +
        `/dispute <reason> - Raise an AI-arbitrated dispute\n` +
        `/cancel - Cancel escrow and get refund\n` +
        `/help - Show this help message\n\n` +
        `HOW IT WORKS:\n` +
        `1. Contract is deployed via GenLayer Studio\n` +
        `2. Buyer funds the escrow with /fund\n` +
        `3. Seller delivers the product/service\n` +
        `4. Buyer confirms with /confirm OR raises /dispute\n` +
        `5. Disputes are resolved by AI validators!\n\n` +
        `Powered by GenLayer - The Intelligence Layer of the Internet`,
      { parse_mode: undefined }
    );
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      `ESCROW BOT COMMANDS:\n\n` +
        `/status - View escrow details and current state\n` +
        `/fund <amount> - Fund escrow (amount in GEN tokens)\n` +
        `/confirm - Buyer confirms delivery, funds go to seller\n` +
        `/dispute <reason> - Open an AI-powered dispute\n` +
        `/cancel - Cancel escrow and refund (before completion)\n\n` +
        `EXAMPLE:\n` +
        `/fund 100\n` +
        `/dispute Seller did not deliver the logo design on time`
    );
  });
}
