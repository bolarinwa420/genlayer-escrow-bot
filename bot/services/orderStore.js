// In-memory order management for the escrow marketplace
// Orders are lost on bot restart — fine for demo purposes

const orders = new Map();
const userExplorerLinks = new Map(); // userId -> explorer link

let activeOnChainOrderId = null; // only one order on-chain at a time

// Generate a short random order ID like "ORD-A7X3"
function generateOrderId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/1/I to avoid confusion
  let id;
  do {
    id = "ORD-";
    for (let i = 0; i < 4; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (orders.has(id)); // avoid collisions
  return id;
}

// Get display name for a Telegram user
function getUserTag(ctx) {
  if (ctx.from.username) return "@" + ctx.from.username;
  return ctx.from.first_name || "User #" + ctx.from.id;
}

// ---------- Order CRUD ----------

export function createOrder({ sellerId, sellerTag, amount, deliveryTime, description }) {
  const id = generateOrderId();
  const order = {
    id,
    sellerId,
    sellerTag,
    amount,
    deliveryTime,
    description,
    status: "OPEN",        // OPEN, LOCKED, REJECTED, CANCELLED, COMPLETED
    buyerId: null,
    buyerTag: null,
    explorerLink: null,
    createdAt: new Date(),
    lockedAt: null,
  };
  orders.set(id, order);
  return order;
}

export function getOrder(orderId) {
  return orders.get(orderId.toUpperCase()) || null;
}

export function cancelOrder(orderId, userId) {
  const order = getOrder(orderId);
  if (!order) return { success: false, error: "Order not found." };
  if (order.sellerId !== userId) return { success: false, error: "Only the seller can cancel this order." };
  if (order.status !== "OPEN") return { success: false, error: "Order can only be cancelled while it's OPEN." };

  order.status = "CANCELLED";
  return { success: true, order };
}

export function lockOrder(orderId, buyerId, buyerTag) {
  const order = getOrder(orderId);
  if (!order) return { success: false, error: "Order not found." };
  if (order.status !== "OPEN") return { success: false, error: "This order is no longer available." };
  if (order.sellerId === buyerId) return { success: false, error: "You can't lock your own order." };
  if (activeOnChainOrderId) return { success: false, error: "Another order is currently active on-chain. Wait for it to complete." };

  // Check explorer link
  const link = userExplorerLinks.get(buyerId);
  if (!link) return { success: false, error: "You must paste a GenLayer explorer link in the chat before locking an order." };

  order.status = "LOCKED";
  order.buyerId = buyerId;
  order.buyerTag = buyerTag;
  order.explorerLink = link;
  order.lockedAt = new Date();
  activeOnChainOrderId = order.id;

  // Clear the used link
  userExplorerLinks.delete(buyerId);

  return { success: true, order };
}

export function rejectOrder(orderId, buyerId, buyerTag) {
  const order = getOrder(orderId);
  if (!order) return { success: false, error: "Order not found." };
  if (order.status !== "OPEN") return { success: false, error: "This order is no longer available." };

  order.status = "REJECTED";
  order.buyerId = buyerId;
  order.buyerTag = buyerTag;
  return { success: true, order };
}

export function completeOrder(orderId) {
  const order = getOrder(orderId);
  if (!order) return { success: false, error: "Order not found." };

  order.status = "COMPLETED";
  if (activeOnChainOrderId === order.id) {
    activeOnChainOrderId = null;
  }
  return { success: true, order };
}

// ---------- Explorer link storage ----------

export function setExplorerLink(userId, link) {
  userExplorerLinks.set(userId, link);
}

export function getExplorerLink(userId) {
  return userExplorerLinks.get(userId) || null;
}

// ---------- Active order tracking ----------

export function getActiveOnChainOrderId() {
  return activeOnChainOrderId;
}

// ---------- Query helpers ----------

export function getOrdersByUser(userId) {
  const result = [];
  for (const order of orders.values()) {
    if (order.sellerId === userId || order.buyerId === userId) {
      result.push(order);
    }
  }
  return result;
}

export { getUserTag };
