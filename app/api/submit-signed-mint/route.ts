/**
 * API Route: POST /api/submit-signed-mint
 * 
 * Submits a user-signed mint transaction to Hedera
 * 
 * Request:
 * {
 *   transactionPayload: string (base64, frozen transaction),
 *   signature: string (hex encoded signature from user wallet),
 *   ownerAccountId: string,
 *   metadata: CSVMetadata
 * }
 * 
 * Response:
 * {
 *   tokenId: string,
 *   serialNumber: number,
 *   transactionId: string,
 *   transactionHash: string,
 *   explorerUrl: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  Client,
  Transaction,
  TransactionResponse,
  PrivateKey,
  AccountId,
} from '@hashgraph/sdk';
import { CSVMetadata } from '@/lib/services/csv-processor';

interface SignedMintRequest {
  transactionPayload: string; // Base64 encoded frozen transaction
  signature: string; // Hex encoded signature
  ownerAccountId: string;
  metadata: CSVMetadata;
  tokenId?: string; // Optional: token ID from prepare response
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SignedMintRequest;
    const { transactionPayload, signature, ownerAccountId, metadata, tokenId: providedTokenId } = body;

    if (!transactionPayload || !ownerAccountId || !metadata) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get environment variables
    const network = (process.env.HEDERA_NETWORK || 'testnet') as
      | 'testnet'
      | 'mainnet'
      | 'previewnet';
    const accountId = process.env.HEDERA_ACCOUNT_ID;
    const privateKey = process.env.HEDERA_PRIVATE_KEY;

    if (!accountId || !privateKey) {
      return NextResponse.json(
        { error: 'Server not configured for transaction submission' },
        { status: 500 }
      );
    }

    // Initialize client
    const client =
      network === 'mainnet'
        ? Client.forMainnet()
        : network === 'previewnet'
        ? Client.forPreviewnet()
        : Client.forTestnet();

    try {
      // Set operator for transaction submission (the treasury account)
      // Parse private key - try different formats
      let operatorKey;
      
      console.log('🔑 Parsing private key...');
      
      try {
        // Try generic format first (auto-detects ECDSA vs ED25519)
        operatorKey = PrivateKey.fromString(privateKey);
        console.log('   ✅ Parsed as: Generic (auto-detected)');
      } catch (e1: any) {
        console.log('   ℹ️  Generic parse failed, trying ED25519...');
        try {
          operatorKey = PrivateKey.fromStringED25519(privateKey);
          console.log('   ✅ Parsed as: ED25519');
        } catch (e2: any) {
          console.log('   ℹ️  ED25519 parse failed, trying ECDSA...');
          try {
            operatorKey = PrivateKey.fromStringECDSA(privateKey);
            console.log('   ✅ Parsed as: ECDSA');
          } catch (e3: any) {
            throw new Error(`Could not parse private key in any format: ${e3.message}`);
          }
        }
      }

      const operatorAccountId = AccountId.fromString(accountId);
      client.setOperator(operatorAccountId, operatorKey);

      console.log('🔐 Submitting user-signed mint transaction...');
      console.log(`   Treasury: ${operatorAccountId}`);
      console.log(`   Owner: ${ownerAccountId}`);
      console.log(`   File: ${metadata.fileName}`);

      // Decode the transaction from base64
      console.log('   Decoding transaction from base64...');
      const txBytes = Buffer.from(transactionPayload, 'base64');
      const decodedTx = Transaction.fromBytes(txBytes);

      // IMPORTANT: Do NOT re-freeze after deserialization!
      // The transaction was already frozen in prepare-mint with a valid transactionId
      // Re-freezing would generate a NEW transactionId and invalidate the signature
      
      // Verify transaction details
      console.log(`   Transaction type: ${decodedTx.constructor.name}`);
      console.log(`   Transaction ID: ${decodedTx.transactionId?.toString() || 'not yet set'}`);
      console.log(`   Transaction ready to sign`);
      
      // Sign with backend (treasury) to pay for transaction
      console.log('   Signing transaction with treasury key...');
      decodedTx.sign(operatorKey);
      console.log('   Transaction signed successfully');

      // Execute the transaction
      console.log('   Executing transaction on Hedera network...');
      const txResponse = await decodedTx.execute(client);
      console.log(`   ✅ Transaction ID: ${txResponse.transactionId}`);

      // Get the receipt
      const receipt = await txResponse.getReceipt(client);

      if (receipt.status.toString() !== 'SUCCESS') {
        throw new Error(
          `Transaction failed with status: ${receipt.status.toString()}`
        );
      }

      // Extract serial number from receipt
      const serialNumber = receipt.serials[0]?.toNumber() || 0;
      
      // Get token ID from the provided value or environment
      const collectionTokenId = providedTokenId || process.env.NEXT_PUBLIC_DATASET_TOKEN_ID || 'unknown';

      const explorerUrl = `https://hashscan.io/${network === 'mainnet' ? '' : 'testnet/'}tx/${txResponse.transactionId}`;

      console.log('✅ Mint transaction successful!');
      console.log(`   Token ID: ${collectionTokenId}`);
      console.log(`   Serial: #${serialNumber}`);
      console.log(`   Explorer: ${explorerUrl}`);

      return NextResponse.json({
        success: true,
        tokenId: collectionTokenId,
        serialNumber,
        transactionId: txResponse.transactionId.toString(),
        transactionHash: txResponse.transactionId.toString(),
        explorerUrl,
        ownerAccountId,
        metadata: {
          fileName: metadata.fileName,
          rowCount: metadata.rowCount,
          hash: metadata.hash,
        },
      });
    } finally {
      client.close();
    }
  } catch (error: any) {
    console.error('❌ Error submitting signed transaction:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to submit transaction',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
