import { createOrder, getUserTag } from "../services/orderStore.js";

// Track conversation state per user for step-by-step order creation
const createSessions = new Map(); // userId -> { step, data }

export function registerCreateOrderCommand(bot) {
  bot.command("createorder", async (ctx) => {
    const userId = ctx.from.id;

    // Start the creation flow
    createSessions.set(userId, {
      step: "amount",
      data: {},
    });

    await ctx.reply(
      "Let's create a new escrow order.\n\n" +
        "Step 1 of 3: How much GEN should the buyer pay?\n" +
        "(Enter a number, e.g. 100)"
    );
  });
}

// Handle replies during the creation flow
// Called from index.js for non-command messages
export function handleCreateOrderReply(ctx) {
  const userId = ctx.from.id;
  const session = createSessions.get(userId);
  if (!session) return false; // not in a create flow

  return true; // we'll handle this message
}

export async function processCreateOrderStep(ctx) {
  const userId = ctx.from.id;
  const session = createSessions.get(userId);
  if (!session) return false;

  const text = ctx.message.text.trim();

  // Let user cancel the flow
  if (text.toLowerCase() === "cancel") {
    createSessions.delete(userId);
    await ctx.reply("Order creation cancelled.");
    return true;
  }

  if (session.step === "amount") {
    const amount = Number(text);
    if (isNaN(amount) || amount <= 0) {
      await ctx.reply("That's not a valid amount. Enter a positive number (e.g. 100).");
      return true;
    }
    session.data.amount = Math.floor(amount).toString();
    session.step = "deliveryTime";
    await ctx.reply(
      "Got it — " + session.data.amount + " GEN.\n\n" +
        "Step 2 of 3: How long will delivery take?\n" +
        "(e.g. 2 days, 1 week, 48 hours)"
    );
    return true;
  }

  if (session.step === "deliveryTime") {
    if (text.length < 1 || text.length > 100) {
      await ctx.reply("Please enter a delivery time (e.g. 3 days, 1 week).");
      return true;
    }
    session.data.deliveryTime = text;
    session.step = "description";
    await ctx.reply(
      "Delivery time: " + text + "\n\n" +
        "Step 3 of 3: Describe what you're selling.\n" +
        "(e.g. Logo design for a crypto project)"
    );
    return true;
  }

  if (session.step === "description") {
    if (text.length < 3) {
      await ctx.reply("Description is too short. Tell the buyer what they're getting.");
      return true;
    }

    const sellerTag = getUserTag(ctx);
    const order = createOrder({
      sellerId: userId,
      sellerTag,
      amount: session.data.amount,
      deliveryTime: session.data.deliveryTime,
      description: text,
    });

    // Done — clear session
    createSessions.delete(userId);

    await ctx.reply(
      "Order created!\n\n" +
        "================================\n" +
        "  ORDER ID: " + order.id + "\n" +
        "================================\n\n" +
        "Amount: " + order.amount + " GEN\n" +
        "Delivery: " + order.deliveryTime + "\n" +
        "Description: " + order.description + "\n" +
        "Seller: " + order.sellerTag + "\n\n" +
        "Share this Order ID with your buyer.\n" +
        "They can view it with:\n" +
        "/vieworder " + order.id
    );
    return true;
  }

  // Unknown step — reset
  createSessions.delete(userId);
  return false;
}

// Check if user is currently in a create flow
export function isInCreateFlow(userId) {
  return createSessions.has(userId);
}
