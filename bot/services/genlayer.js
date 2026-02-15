import { createClient, createAccount } from "genlayer-js";
import { config } from "../config.js";

// Create account - use private key if available, otherwise generate one
let account;
if (config.privateKey && config.privateKey !== "0xyour_private_key_here") {
  account = createAccount(config.privateKey);
} else {
  account = createAccount();
}

// Create client with custom endpoint
const client = createClient({
  account,
  endpoint: config.rpcEndpoint,
});

/**
 * Read the current escrow status
 */
export async function getEscrowStatus() {
  try {
    const result = await client.readContract({
      address: config.contractAddress,
      functionName: "get_status",
      args: [],
    });

    // Parse the pipe-delimited status string
    const fields = String(result).split("|");
    const status = {};
    for (const field of fields) {
      const [key, ...valueParts] = field.split(":");
      status[key] = valueParts.join(":");
    }
    return { success: true, data: status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Fund the escrow with GEN tokens
 * @param {string|number} amount - Amount in wei
 */
export async function fundEscrow(amount) {
  try {
    const txHash = await client.writeContract({
      address: config.contractAddress,
      functionName: "fund_escrow",
      args: [Number(amount)],
      value: 0n,
    });

    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      retries: 60,
      interval: 3000,
    });

    return { success: true, txHash, receipt };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Buyer confirms delivery - releases funds to seller
 */
export async function confirmDelivery() {
  try {
    const txHash = await client.writeContract({
      address: config.contractAddress,
      functionName: "confirm_delivery",
      args: [],
      value: 0n,
    });

    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      retries: 60,
      interval: 3000,
    });

    return { success: true, txHash, receipt };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Raise a dispute - AI validators will arbitrate
 * @param {string} reason - Reason for the dispute
 */
export async function raiseDispute(reason) {
  try {
    const txHash = await client.writeContract({
      address: config.contractAddress,
      functionName: "raise_dispute",
      args: [reason],
      value: 0n,
    });

    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      retries: 120,
      interval: 5000,
    });

    return { success: true, txHash, receipt };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Cancel the escrow and refund buyer
 */
export async function cancelEscrow() {
  try {
    const txHash = await client.writeContract({
      address: config.contractAddress,
      functionName: "cancel_escrow",
      args: [],
      value: 0n,
    });

    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      retries: 60,
      interval: 3000,
    });

    return { success: true, txHash, receipt };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get the contract schema (available methods)
 */
export async function getContractSchema() {
  try {
    const schema = await client.getContractSchema({
      address: config.contractAddress,
    });
    return { success: true, data: schema };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get the bot operator's wallet address
 */
export function getWalletAddress() {
  return account.address;
}
