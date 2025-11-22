import { NextRequest, NextResponse } from 'next/server';
import {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenId,
  Hbar,
  AccountId,
  PrivateKey,
  TransactionId,
} from '@hashgraph/sdk';
import { CSVMetadata } from '@/lib/services/csv-processor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metadata, ownerAccountId } = body as {
      metadata: CSVMetadata;
      ownerAccountId: string;
    };

    if (!metadata || !ownerAccountId) {
      return NextResponse.json(
        { error: 'Missing metadata or ownerAccountId' },
        { status: 400 }
      );
    }

    // Validate ownerAccountId format
    try {
      AccountId.fromString(ownerAccountId);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid account ID format' },
        { status: 400 }
      );
    }

    // Get network and treasury account
    const network = (process.env.HEDERA_NETWORK || 'testnet') as
      | 'testnet'
      | 'mainnet'
      | 'previewnet';
    const treasuryAccountId = process.env.HEDERA_ACCOUNT_ID;
    const treasuryPrivateKey = process.env.HEDERA_PRIVATE_KEY;

    if (!treasuryAccountId || !treasuryPrivateKey) {
      return NextResponse.json(
        { error: 'Treasury account not configured' },
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
      // Parse the treasury private key
      let operatorKey;
      try {
        operatorKey = PrivateKey.fromString(treasuryPrivateKey);
      } catch (e1: any) {
        try {
          operatorKey = PrivateKey.fromStringED25519(treasuryPrivateKey);
        } catch (e2: any) {
          operatorKey = PrivateKey.fromStringECDSA(treasuryPrivateKey);
        }
      }

      const operatorAccountId = AccountId.fromString(treasuryAccountId);

      // NOTE: We do NOT set operator here because we're preparing an UNSIGNED transaction
      // The operator will be set in submit-signed-mint when executing
      // Setting it here would include treasury in the transaction hash

      let tokenId: string;

      // Check if we have a pre-existing collection token
      const collectionTokenId = process.env.NEXT_PUBLIC_DATASET_TOKEN_ID;

      if (!collectionTokenId) {
        console.error('❌ No collection token ID configured');
        return NextResponse.json(
          {
            error: 'Collection token not configured. Please create it first.',
            instructions: 'Run: npm run create-token',
          },
          { status: 500 }
        );
      }

      tokenId = collectionTokenId;
      console.log('✅ Using collection token:', tokenId);

      // Create minimal metadata (Hedera 100 byte limit)
      const minimalMetadata = {
        h: metadata.hash.substring(0, 12),
        r: metadata.rowCount,
        c: metadata.columns.length,
      };

      const metadataBytes = Buffer.from(JSON.stringify(minimalMetadata));

      if (metadataBytes.length > 100) {
        return NextResponse.json(
          { error: 'Metadata exceeds 100 byte limit' },
          { status: 400 }
        );
      }

      // Build unsigned mint transaction for backend to execute
      const mintTx = new TokenMintTransaction()
        .setTokenId(TokenId.fromString(tokenId))
        .addMetadata(metadataBytes)
        .setTransactionMemo(`CSV: ${metadata.fileName}`)
        .setMaxTransactionFee(new Hbar(20));

      // Set the payer explicitly to the treasury account
      // This tells the transaction who will pay, without auto-signing
      mintTx.setTransactionId(
        TransactionId.generate(operatorAccountId)
      );

      // Freeze the transaction to generate signatures structure
      // We do NOT set an operator here - this just prepares the transaction
      console.log('   Freezing transaction without operator...');
      const frozenTx = await mintTx.freezeWith(client);
      const txBytes = frozenTx.toBytes();
      const txPayload = Buffer.from(txBytes).toString('base64');

      console.log('✅ Unsigned mint transaction prepared');
      console.log(`   Token ID: ${tokenId}`);
      console.log(`   File: ${metadata.fileName}`);
      console.log(`   Owner: ${ownerAccountId}`);
      console.log(`   Payload size: ${txPayload.length} chars`);

      return NextResponse.json({
        success: true,
        transactionPayload: txPayload,
        tokenId,
        ownerAccountId,
        metadata: {
          fileName: metadata.fileName,
          rowCount: metadata.rowCount,
          hash: metadata.hash.substring(0, 16),
        },
        instructions: 'Send this transaction to backend for execution',
      });
    } finally {
      client.close();
    }
  } catch (error: any) {
    console.error('❌ Error preparing mint transaction:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to prepare mint transaction',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
