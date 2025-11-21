// Type definitions for window.ethereum (MetaMask and other EIP-1193 providers)

interface RequestArguments {
  method: string;
  params?: unknown[] | Record<string, unknown>;
}

interface EIP1193Provider {
  request(args: RequestArguments): Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

export {};
