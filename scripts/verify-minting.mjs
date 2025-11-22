#!/usr/bin/env node

/**
 * Verify that the minting system is fully configured
 * 
 * Usage:
 *   node scripts/verify-minting.mjs
 */

import * as dotenv from "dotenv";
import { existsSync, readFileSync } from "fs";

dotenv.config({ path: ".env.local" });

console.log("✅ Minting System Verification\n");
console.log("Checking required configuration...\n");

const checks = [
  {
    name: "Account ID",
    env: "HEDERA_ACCOUNT_ID",
    required: true,
    validate: (val) => /^0\.0\.\d+$/.test(val),
  },
  {
    name: "Private Key",
    env: "HEDERA_PRIVATE_KEY",
    required: true,
    validate: (val) => val && val.length > 50,
  },
  {
    name: "Network",
    env: "HEDERA_NETWORK",
    required: true,
    validate: (val) => ["testnet", "mainnet", "previewnet"].includes(val),
  },
  {
    name: "Dataset Token ID",
    env: "NEXT_PUBLIC_DATASET_TOKEN_ID",
    required: true,
    validate: (val) => /^0\.0\.\d+$/.test(val),
  },
  {
    name: "Treasury Account",
    env: "NEXT_PUBLIC_TREASURY_ACCOUNT",
    required: false,
    validate: (val) => /^0\.0\.\d+$/.test(val),
  },
];

let allPassed = true;

for (const check of checks) {
  const value = process.env[check.env];
  const hasValue = !!value;
  const isValid = hasValue && check.validate(value);

  const status = isValid ? "✅" : hasValue ? "⚠️ " : "❌";
  const message = isValid
    ? "Configured"
    : hasValue
    ? "Invalid format"
    : "Missing";

  console.log(`${status} ${check.name}`);
  console.log(`   ${check.env}: ${hasValue ? value : "(not set)"}`);
  console.log(`   ${message}\n`);

  if (check.required && !isValid) {
    allPassed = false;
  }
}

console.log("=".repeat(60));

if (allPassed) {
  console.log("\n✅ All checks passed! You're ready to mint.\n");
  console.log("Next steps:");
  console.log("  1. Restart dev server: npm run dev");
  console.log("  2. Go to http://localhost:3000/tokenized-data");
  console.log("  3. Upload a CSV file");
  console.log("  4. Click 'Mint Dataset NFT on Hedera'");
  console.log("  5. Check token gallery at /token-gallery\n");
} else {
  console.log("\n❌ Some checks failed. Please fix the above issues.\n");
  console.log("Configuration file: .env.local\n");
  process.exit(1);
}
