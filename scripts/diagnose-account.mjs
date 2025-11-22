#!/usr/bin/env node

/**
 * Script to diagnose Hedera account and key issues
 * 
 * Usage:
 *   node scripts/diagnose-account.mjs
 */

import { PrivateKey, Client, AccountId } from "@hashgraph/sdk";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const ACCOUNT_ID = process.env.HEDERA_ACCOUNT_ID;
const PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY;
const NETWORK = process.env.HEDERA_NETWORK || "testnet";

console.log("🔍 Hedera Account Diagnostics\n");
console.log(`Network: ${NETWORK}`);
console.log(`Account ID: ${ACCOUNT_ID}`);
console.log(`Private Key: ${PRIVATE_KEY?.substring(0, 20)}...`);

if (!ACCOUNT_ID || !PRIVATE_KEY) {
  console.error("\n❌ Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY");
  process.exit(1);
}

try {
  // Try to parse the account ID
  const accountId = AccountId.fromString(ACCOUNT_ID);
  console.log(`\n✅ Account ID format: Valid (${accountId.toString()})`);
} catch (e) {
  console.error(`\n❌ Account ID format: Invalid`);
  console.error(`   Error: ${e.message}`);
  process.exit(1);
}

// Try different key formats
let keyType = "unknown";
let parsedKey = null;

console.log("\n🔑 Testing key formats:\n");

// Test ECDSA
try {
  parsedKey = PrivateKey.fromStringECDSA(PRIVATE_KEY);
  keyType = "ECDSA";
  console.log(`✅ ECDSA format: Valid`);
  console.log(`   Public Key (hex): ${parsedKey.publicKey.toStringRaw()}`);
} catch (e) {
  console.log(`❌ ECDSA format: Invalid (${e.message})`);
}

// Test ED25519
try {
  parsedKey = PrivateKey.fromStringED25519(PRIVATE_KEY);
  keyType = "ED25519";
  console.log(`✅ ED25519 format: Valid`);
  console.log(`   Public Key (hex): ${parsedKey.publicKey.toStringRaw()}`);
} catch (e) {
  console.log(`❌ ED25519 format: Invalid (${e.message})`);
}

// Test generic format
try {
  parsedKey = PrivateKey.fromString(PRIVATE_KEY);
  keyType = "Generic";
  console.log(`✅ Generic format: Valid`);
  console.log(`   Type detected: ${parsedKey.publicKey.toStringRaw()}`);
} catch (e) {
  console.log(`❌ Generic format: Invalid (${e.message})`);
}

if (!parsedKey) {
  console.error("\n❌ Could not parse private key in any format!");
  console.error("\nYour key format appears to be: " + PRIVATE_KEY.substring(0, 10));
  console.error("\nExpected formats:");
  console.error("  - ECDSA: 302e020100... (DER encoded)");
  console.error("  - ED25519: 302a020100... (DER encoded)");
  console.error("  - Raw hex: 48 character hex string");
  process.exit(1);
}

console.log("\n" + "=".repeat(60));
console.log("🔗 Testing Account Connection\n");

// Initialize client and test connection
const client =
  NETWORK === "mainnet"
    ? Client.forMainnet()
    : NETWORK === "previewnet"
    ? Client.forPreviewnet()
    : Client.forTestnet();

try {
  client.setOperator(ACCOUNT_ID, parsedKey);
  console.log(`✅ Operator set successfully`);
  console.log(`   Account: ${ACCOUNT_ID}`);
  console.log(`   Key type: ${keyType}`);

  // Try to get account info
  const { AccountInfoQuery } = await import("@hashgraph/sdk");
  const info = await new AccountInfoQuery()
    .setAccountId(ACCOUNT_ID)
    .execute(client);

  console.log(`\n✅ Account found on network:`);
  console.log(`   Balance: ${info.balance.toString()} tℏ`);
  console.log(`   Key count: ${info.key?.toStringRaw().length || 0} bytes`);
  console.log(`   Account created: ${info.accountMemo}`);

  if (info.balance.toTinybars() < 50000000) {
    console.warn(`\n⚠️  Warning: Low balance! Need 50+ HBAR`);
    console.warn(`   Current: ${(info.balance.toTinybars() / 100000000).toFixed(2)} HBAR`);
    console.warn(`   Required: ~50 HBAR for token creation`);
  }

  console.log(`\n✅ All checks passed! Your account is configured correctly.`);
} catch (error) {
  console.error(`\n❌ Connection failed: ${error.message}`);
  console.error("\nThis could mean:");
  console.error("  1. Private key doesn't match the account ID");
  console.error("  2. Account doesn't exist on the network");
  console.error("  3. Network connectivity issue");
  console.error("  4. Key is in wrong format");
} finally {
  client.close();
}
