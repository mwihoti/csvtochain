/**
 * API Route: POST /api/purchase-data
 * Handles data purchases and creates transactions on Hedera
 */

import { NextRequest, NextResponse } from 'next/server';
import { Client, AccountId, TransferTransaction, Hbar, PrivateKey } from '@hashgraph/sdk';
import { marketplaceService } from '@/lib/services/marketplace';

interface PurchaseRequest {
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  dataName: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PurchaseRequest = await request.json();

    const { listingId, buyerId, sellerId, amount, dataName } = body;

    // Validation
    if (!listingId || !buyerId || !sellerId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid purchase amount' },
        { status: 400 }
      );
    }

    // Get the listing
    const listing = marketplaceService.getListingById(listingId);
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Verify price matches
    if (listing.price !== amount) {
      return NextResponse.json(
        { error: 'Price mismatch' },
        { status: 400 }
      );
    }

    // Try to execute Hedera transaction if private key is available
    let transactionId = undefined;
    try {
      const accountId = process.env.HEDERA_ACCOUNT_ID;
      const privateKey = process.env.HEDERA_PRIVATE_KEY;

      if (accountId && privateKey) {
        const client = Client.forTestnet();
        client.setOperator(accountId, privateKey);

        // Create transfer transaction (seller receives payment from buyer)
        // In this implementation, the treasury account initiates the transfer
        // In production, the buyer would sign this transaction via their wallet
        const operatorId = AccountId.fromString(accountId);
        
        // Build transfer with HbarTransfer objects
        const transferTx = new TransferTransaction()
          .addHbarTransfer(operatorId, new Hbar(-amount))
          .addHbarTransfer(AccountId.fromString(sellerId), new Hbar(amount))
          .setMaxTransactionFee(new Hbar(2))
          .freezeWith(client);

        const signedTx = await transferTx.sign(PrivateKey.fromString(privateKey));
        const submitted = await signedTx.execute(client);
        const receipt = await submitted.getReceipt(client);

        transactionId = submitted.transactionId.toString();
        console.log(`Transaction ${transactionId} completed with status ${receipt.status}`);

        await client.close();
      }
    } catch (txError) {
      console.error('Hedera transaction error:', txError);
      // Continue with purchase even if transaction fails (use treasury account setup)
    }

    // Record the purchase
    const purchase = marketplaceService.recordPurchase(
      buyerId,
      sellerId,
      listingId,
      amount,
      transactionId
    );

    // Log purchase activity
    console.log(`Purchase recorded:`, {
      purchaseId: purchase.id,
      listing: dataName,
      buyer: buyerId,
      seller: sellerId,
      amount: `${amount} HBAR`,
      timestamp: purchase.timestamp,
      transactionId,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        purchaseId: purchase.id,
        message: `Successfully purchased "${dataName}" for ${amount} HBAR`,
        transactionId,
        purchase: {
          id: purchase.id,
          status: purchase.status,
          timestamp: purchase.timestamp,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Purchase API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process purchase' },
      { status: 500 }
    );
  }
}
