import { config } from "../config.js";

export async function notifyAdmin(bot, { orderId, amount, sellerTag, description, buyerTag, explorerLink }) {
  if (!config.adminChatId) {
    console.log("ADMIN_CHAT_ID not set — skipping admin notification");
    return;
  }

  const message =
    "NEW ORDER LOCKED\n\n" +
    "Order ID: " + orderId + "\n" +
    "Amount: " + amount + " GEN\n" +
    "Seller: " + sellerTag + "\n" +
    "Buyer: " + buyerTag + "\n" +
    "Description: " + description + "\n\n" +
    "Explorer Link:\n" + explorerLink;

  try {
    await bot.api.sendMessage(config.adminChatId, message);
  } catch (err) {
    console.error("Failed to notify admin:", err.message);
  }
}
