// lib/web3.ts
import contractABI from "@/data/contract-abi.json";
import { UserData } from "@/types/user";
import Web3 from "web3";
import { AbiItem, fromWei, toWei } from "web3-utils";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

// Custom error types matching the smart contract
export enum EnergyTradingError {
  Unauthorized = "Unauthorized",
  ContractIsPaused = "ContractIsPaused",
  AlreadyRegistered = "AlreadyRegistered",
  NotRegistered = "NotRegistered",
  InsufficientPayment = "InsufficientPayment",
  InsufficientBalance = "InsufficientBalance",
  InactiveOffer = "InactiveOffer",
  InsufficientEnergy = "InsufficientEnergy",
  InvalidAddress = "InvalidAddress",
}

// Types for the contract responses
export interface EnergyOffer {
  id: number;
  seller: string;
  amount: string;
  pricePerUnit: string;
  timestamp: Date;
  isActive: boolean;
}

export interface UserInfo {
  energyTokenBalance: string;
  solarCapacity: string;
  storageCapacity: string;
  hasSolarPanels: boolean;
  hasBatteryStorage: boolean;
  isRegistered: boolean;
}

declare global {
  interface Window {
    ethereum: any;
  }
}

export class EnergyTradingService {
  private web3: Web3 | null;
  private contract: any;
  private currentAccount: string | null = null;

  constructor() {
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      this.web3 = new Web3(window.ethereum);
      this.contract = new this.web3.eth.Contract(
        contractABI as AbiItem[],
        contractAddress,
      );

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        this.currentAccount = accounts.length > 0 ? accounts[0] : null;
      });

      // Listen for chain changes
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    } else {
      console.error("Web3 provider not found");
      this.web3 = null;
      this.contract = null;
    }
  }

  async connectWallet(): Promise<string[]> {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      this.currentAccount = accounts[0];
      return accounts;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw this.handleError(error);
    }
  }

  async changeWallet(): Promise<string | null> {
    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      this.currentAccount = accounts[0];
      return this.currentAccount;
    } catch (error) {
      console.error("Error changing wallet:", error);
      throw this.handleError(error);
    }
  }

  async registerUser(userData: UserData): Promise<void> {
    try {
      const accounts = await this.connectWallet();

      // Convert capacities to wei (now using uint96)
      const solarCapacityWei = toWei(
        userData.solarCapacity.toString(),
        "ether",
      );
      const storageCapacityWei = toWei(
        userData.storageCapacity.toString(),
        "ether",
      );

      await this.contract.methods
        .registerUser(
          userData.hasSolarPanels,
          userData.hasBatteryStorage,
          solarCapacityWei,
          storageCapacityWei,
        )
        .send({ from: accounts[0] });
    } catch (error) {
      console.error("Error registering user:", error);
      throw this.handleError(error);
    }
  }

  async getUserInfo(address: string): Promise<UserInfo> {
    try {
      const result = await this.contract.methods.getUserInfo(address).call();

      return {
        energyTokenBalance: fromWei(result.energyTokenBalance, "ether"),
        solarCapacity: fromWei(result.solarCapacity, "ether"),
        storageCapacity: fromWei(result.storageCapacity, "ether"),
        hasSolarPanels: result.hasSolarPanels,
        hasBatteryStorage: result.hasBatteryStorage,
        isRegistered: result.isRegistered,
      };
    } catch (error) {
      console.error("Error getting user info:", error);
      throw this.handleError(error);
    }
  }

  async createEnergyOffer(amount: number, pricePerUnit: number): Promise<void> {
    try {
      const accounts = await this.connectWallet();

      // Convert to wei (now using uint96)
      const amountWei = toWei(amount.toString(), "ether");
      const priceWei = toWei(pricePerUnit.toString(), "ether");

      await this.contract.methods
        .createEnergyOffer(amountWei, priceWei)
        .send({ from: accounts[0] });
    } catch (error) {
      console.error("Error creating energy offer:", error);
      throw this.handleError(error);
    }
  }

  async purchaseEnergy(
    offerId: number,
    amount: number,
    totalPrice: number,
  ): Promise<void> {
    try {
      const accounts = await this.connectWallet();

      // Convert to wei (now using uint96 for amount)
      const amountWei = toWei(amount.toString(), "ether");
      const totalPriceWei = toWei(totalPrice.toString(), "ether");

      await this.contract.methods.purchaseEnergy(offerId, amountWei).send({
        from: accounts[0],
        value: totalPriceWei,
      });
    } catch (error) {
      console.error("Error purchasing energy:", error);
      throw this.handleError(error);
    }
  }

  async getUserBalance(address: string): Promise<string> {
    try {
      const balance = await this.contract.methods
        .getUserBalance(address)
        .call();

      return balance.toString();
    } catch (error) {
      console.error("Error getting user balance:", error);
      throw this.handleError(error);
    }
  }

  async mintEnergyTokens(amount: number): Promise<void> {
    try {
      const accounts = await this.connectWallet();

      const tokenAmount = Math.floor(amount).toString();

      const paymentRequired = Math.floor(amount) * 0.001;
      const paymentInWei = toWei(paymentRequired.toString(), "ether");

      await this.contract.methods.mintEnergyTokens(tokenAmount).send({
        from: accounts[0],
        value: paymentInWei,
      });
    } catch (error) {
      console.error("Error minting energy tokens:", error);
      throw this.handleError(error);
    }
  }

  async getActiveOffers(): Promise<EnergyOffer[]> {
    try {
      const activeOfferIds = await this.contract.methods
        .getActiveOffers()
        .call();
      const offers = await Promise.all(
        activeOfferIds.map(async (id: number) => {
          const offer = await this.contract.methods.energyOffers(id).call();
          return {
            id,
            seller: offer.seller,
            amount: fromWei(offer.amount, "ether"),
            pricePerUnit: fromWei(offer.pricePerUnit, "ether"),
            timestamp: new Date(parseInt(offer.timestamp) * 1000),
            isActive: offer.isActive,
          };
        }),
      );
      return offers;
    } catch (error) {
      console.error("Error getting active offers:", error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    // Check if it's a custom contract error
    if (error.message.includes("execution reverted")) {
      for (const errorType of Object.values(EnergyTradingError)) {
        if (error.message.includes(errorType)) {
          return new Error(errorType);
        }
      }
    }
    return error;
  }
}

export const energyTradingService = new EnergyTradingService();
