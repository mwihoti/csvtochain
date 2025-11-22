#!/usr/bin/env node

/**
 * Script to create the NFT collection token for CSV datasets
 * 
 * Usage:
 *   node scripts/create-dataset-token.mjs
 * 
 * This creates a reusable NFT collection that can be used for all CSV mints.
 * Once created, add the token ID to .env.local as NEXT_PUBLIC_DATASET_TOKEN_ID
 */

import {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
  AccountId,
  PrivateKey,
} from "@hashgraph/sdk";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const NETWORK = process.env.HEDERA_NETWORK || "testnet";
const ACCOUNT_ID = process.env.HEDERA_ACCOUNT_ID;
const PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY;

if (!ACCOUNT_ID || !PRIVATE_KEY) {
  console.error("❌ Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in .env.local");
  console.error("   Please set these environment variables first.");
  process.exit(1);
}

console.log(`🔧 Creating NFT Collection Token`);
console.log(`   Network: ${NETWORK}`);
console.log(`   Account: ${ACCOUNT_ID}`);

// Initialize client
const client =
  NETWORK === "mainnet"
    ? Client.forMainnet()
    : NETWORK === "previewnet"
    ? Client.forPreviewnet()
    : Client.forTestnet();

try {
  // Parse private key - try different formats
  let operatorKey;
  
  console.log("🔑 Parsing private key...");
  
  try {
    // Try generic format first (auto-detects ECDSA vs ED25519)
    operatorKey = PrivateKey.fromString(PRIVATE_KEY);
    console.log("   ✅ Parsed as: Generic (auto-detected)");
  } catch (e1) {
    console.log("   ℹ️  Generic parse failed, trying ED25519...");
    try {
      operatorKey = PrivateKey.fromStringED25519(PRIVATE_KEY);
      console.log("   ✅ Parsed as: ED25519");
    } catch (e2) {
      console.log("   ℹ️  ED25519 parse failed, trying ECDSA...");
      try {
        operatorKey = PrivateKey.fromStringECDSA(PRIVATE_KEY);
        console.log("   ✅ Parsed as: ECDSA");
      } catch (e3) {
        throw new Error(`Could not parse private key in any format: ${e3.message}`);
      }
    }
  }

  const operatorAccountId = AccountId.fromString(ACCOUNT_ID);
  client.setOperator(operatorAccountId, operatorKey);

  // Create NFT collection token
  console.log("\n📝 Building token creation transaction...");

  const transaction = new TokenCreateTransaction()
    .setTokenName("CSV Datasets")
    .setTokenSymbol("CSVDATA")
    .setTokenType(TokenType.NonFungibleUnique)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(1000000)
    .setTreasuryAccountId(operatorAccountId)
    .setAdminKey(operatorKey)
    .setSupplyKey(operatorKey)
    .setFreezeKey(operatorKey)
    .setWipeKey(operatorKey)
    .setMaxTransactionFee(new Hbar(50));

  console.log("⏳ Submitting transaction to Hedera...");
  const response = await transaction.execute(client);

  console.log("\n⏳ Waiting for receipt...");
  const receipt = await response.getReceipt(client);

  if (!receipt.tokenId) {
    throw new Error("No token ID in receipt");
  }

  const tokenId = receipt.tokenId.toString();

  console.log("\n✅ Token created successfully!");
  console.log(`\n📌 Token ID: ${tokenId}`);
  console.log(`\n📋 Add this to your .env.local:\n`);
  console.log(`NEXT_PUBLIC_DATASET_TOKEN_ID=${tokenId}`);
  console.log(`\n🔗 View on HashScan:`);
  console.log(
    `https://hashscan.io/${NETWORK === "mainnet" ? "" : "testnet/"}token/${tokenId}`
  );

  client.close();
  process.exit(0);
} catch (error) {
  console.error("\n❌ Error creating token:", error.message);
  console.error("\nDebugging info:");
  console.error("- Check that HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY are correct");
  console.error("- Verify account has sufficient HBAR balance (minimum 50 HBAR for fee)");
  console.error("- Try using ED25519 key format if ECDSA fails");
  console.error("\nFull error:");
  console.error(error);
  client.close();
  process.exit(1);
}
