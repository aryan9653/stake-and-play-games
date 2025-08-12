import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if MetaMask is installed
    setIsMetaMaskInstalled(typeof window.ethereum !== 'undefined');

    // Check if already connected
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
          }
        })
        .catch((error: any) => {
          console.error('Error checking accounts:', error);
        });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null);
          setIsConnected(false);
        } else {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners?.('accountsChanged');
        window.ethereum.removeAllListeners?.('chainChanged');
      }
    };
  }, []);

  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive",
      });
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setLoading(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        toast({
          title: "Wallet Connected! 🦊",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    account,
    isConnected,
    isMetaMaskInstalled,
    loading,
    connectWallet,
    disconnectWallet,
    formatAddress,
  };
};