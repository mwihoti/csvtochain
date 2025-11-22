/**
 * Client-Side Hedera Transaction Service
 * 
 * Handles building and submitting transactions that are signed by the user's wallet
 * Supports both MetaMask and HashPack
 */

import {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  Transaction,
  AccountId,
  TokenId,
  Hbar,
  TopicMessageSubmitTransaction,
  TopicId,
  LedgerId,
  PrivateKey,
} from '@hashgraph/sdk';

interface HederaTransaction {
  transaction: string; // Base64 encoded transaction
  fee: string; // Fee in HBAR
}

/**
 * Build a TokenMint transaction for client-side signing
 */
export async function buildMintTransaction(
  tokenId: string,
  metadataBytes: Buffer,
  network: 'testnet' | 'mainnet' | 'previewnet' = 'testnet'
): Promise<HederaTransaction> {
  // Create a client instance for transaction building
  const client = Client.forTestnet();

  try {
    const tx = new TokenMintTransaction()
      .setTokenId(TokenId.fromString(tokenId))
      .addMetadata(metadataBytes)
      .setMaxTransactionFee(new Hbar(20));

    // Convert to bytes for signing
    const txBytes = tx.toBytes();
    const txBase64 = Buffer.from(txBytes).toString('base64');

    return {
      transaction: txBase64,
      fee: '20',
    };
  } finally {
    client.close();
  }
}

/**
 * Sign and submit a transaction using MetaMask's signing capability
 * Note: This requires a Hedera-enabled MetaMask or a relay service
 */
export async function signAndSubmitWithMetaMask(
  transaction: HederaTransaction,
  userAccountId: string
): Promise<any> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // For production, you would use a relay service or Hedera's JSON-RPC
    // This is a placeholder for the actual implementation
    const sig = await window.ethereum.request({
      method: 'personal_sign',
      params: [transaction.transaction, userAccountId],
    });

    return {
      signature: sig,
      accountId: userAccountId,
    };
  } catch (error) {
    throw new Error(`Failed to sign transaction: ${error}`);
  }
}

/**
 * Create a dataset NFT collection token on Hedera
 * This is typically done once and reused for all datasets
 */
export async function createDatasetCollection(
  ownerAccountId: string,
  name: string = 'CSV Datasets',
  symbol: string = 'CSV',
  network: 'testnet' | 'mainnet' | 'previewnet' = 'testnet'
): Promise<HederaTransaction> {
  const client = Client.forTestnet();

  try {
    const ownerKey = PrivateKey.generateECDSA();
    
    const tx = new TokenCreateTransaction()
      .setTokenName(name)
      .setTokenSymbol(symbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(1000000)
      .setTreasuryAccountId(AccountId.fromString(ownerAccountId))
      .setAdminKey(ownerKey)
      .setFreezeKey(ownerKey)
      .setWipeKey(ownerKey)
      .setSupplyKey(ownerKey)
      .setMaxTransactionFee(new Hbar(30));

    const txBytes = tx.toBytes();
    const txBase64 = Buffer.from(txBytes).toString('base64');

    return {
      transaction: txBase64,
      fee: '30',
    };
  } finally {
    client.close();
  }
}

/**
 * Submit a hash to Hedera Consensus Service for immutable audit trail
 */
export async function submitHashToHCS(
  topicId: string,
  dataHash: string,
  network: 'testnet' | 'mainnet' | 'previewnet' = 'testnet'
): Promise<HederaTransaction> {
  const client = Client.forTestnet();

  try {
    const tx = new TopicMessageSubmitTransaction()
      .setTopicId(TopicId.fromString(topicId))
      .setMessage(dataHash)
      .setMaxTransactionFee(new Hbar(2));

    const txBytes = tx.toBytes();
    const txBase64 = Buffer.from(txBytes).toString('base64');

    return {
      transaction: txBase64,
      fee: '2',
    };
  } finally {
    client.close();
  }
}
