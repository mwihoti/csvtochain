/**
 * MetaMask Signer for Hedera Transactions
 * 
 * Uses MetaMask's signing capability to sign Hedera transactions
 */

/**
 * Sign a transaction with MetaMask
 * 
 * @param transactionPayload Base64 encoded transaction
 * @param accountId User's Hedera account ID
 * @returns Hex encoded signature
 */
export async function signWithMetaMask(
  transactionPayload: string,
  accountId: string
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('MetaMask signer can only be used in browser');
  }

  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    // Convert transaction to message format for signing
    const message = `Sign Hedera Transaction\n\nAccount: ${accountId}\nTransaction: ${transactionPayload.substring(0, 50)}...`;

    // Request signature from MetaMask
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, accountId],
    });

    console.log('✅ Transaction signed with MetaMask');
    console.log(`   Account: ${accountId}`);

    // Return the signature (MetaMask returns with '0x' prefix)
    return signature as string;
  } catch (error: any) {
    console.error('❌ MetaMask signing failed:', error);

    if (error.code === 4001) {
      throw new Error('User rejected the signing request');
    } else if (error.code === -32603) {
      throw new Error('Internal MetaMask error');
    } else {
      throw new Error(`Failed to sign with MetaMask: ${error.message}`);
    }
  }
}

/**
 * Sign a transaction with HashPack
 * 
 * @param transactionPayload Base64 encoded transaction
 * @param accountId User's Hedera account ID
 * @returns Hex encoded signature
 */
export async function signWithHashPack(
  transactionPayload: string,
  accountId: string,
  hashConnect: any
): Promise<string> {
  if (!hashConnect) {
    throw new Error('HashConnect not initialized');
  }

  try {
    const txBytes = Buffer.from(transactionPayload, 'base64');

    // Sign the transaction with HashPack
    const request = {
      topic: hashConnect.topic,
      requestType: 'SIGN_TRANSACTION',
      transactionBody: transactionPayload,
    };

    // This would need proper HashPack SDK integration
    // For now, returning a placeholder
    throw new Error(
      'HashPack signing not yet fully implemented. Please use MetaMask.'
    );
  } catch (error: any) {
    console.error('❌ HashPack signing failed:', error);
    throw new Error(
      `Failed to sign with HashPack: ${error.message || 'Unknown error'}`
    );
  }
}

/**
 * Determine which wallet to use for signing
 */
export async function signTransaction(
  transactionPayload: string,
  accountId: string,
  walletType: 'metamask' | 'hashpack',
  hashConnect?: any
): Promise<string> {
  if (walletType === 'metamask') {
    return signWithMetaMask(transactionPayload, accountId);
  } else if (walletType === 'hashpack') {
    return signWithHashPack(transactionPayload, accountId, hashConnect);
  } else {
    throw new Error(`Unsupported wallet type: ${walletType}`);
  }
}
