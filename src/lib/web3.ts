// utils/web3.ts
import contractABI from "@/data/contract-abi.json";
import { UserData } from "@/types/user";
import Web3 from "web3";
import { AbiItem, toWei } from "web3-utils";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

declare global {
  interface Window {
    ethereum: any; // You can replace 'any' with a more specific type if available
  }
}

export class EnergyTradingService {
  private web3: any;
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
        if (accounts.length > 0) {
          this.currentAccount = accounts[0];
        } else {
          this.currentAccount = null; // Handle account disconnection
        }
      });
    }
  }

  async connectWallet(): Promise<string[]> {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      this.currentAccount = accounts[0]; // Set the current account
      return accounts;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  }

  async changeWallet(): Promise<string | null> {
    console.log("Changing wallet");
    const accounts = await this.connectWallet();
    this.currentAccount = accounts[0]; // Update the current account
    return this.currentAccount;
  }

  async registerUser(userData: UserData): Promise<void> {
    const accounts = await this.connectWallet();
    await this.contract.methods
      .registerUser(
        userData.hasSolarPanels,
        userData.hasBatteryStorage,
        toWei(userData.solarCapacity.toString(), "ether"),
        toWei(userData.storageCapacity.toString(), "ether"),
      )
      .send({ from: accounts[0] });
  }

  async createEnergyOffer(amount: number, pricePerUnit: number): Promise<void> {
    const accounts = await this.connectWallet();

    await this.contract.methods
      .createEnergyOffer(
        toWei(amount.toString(), "ether"),
        toWei(pricePerUnit.toString(), "ether"),
      )
      .send({ from: accounts[0] });
  }

  async purchaseEnergy(
    offerId: number,
    amount: number,
    totalPrice: number,
  ): Promise<void> {
    const accounts = await this.connectWallet();
    await this.contract.methods
      .purchaseEnergy(offerId, toWei(amount.toString(), "ether"))
      .send({
        from: accounts[0],
        value: toWei(totalPrice.toString(), "ether"),
      });
  }

  async getUserBalance(address: string): Promise<number> {
    const balance = await this.contract.methods.getUserBalance(address).call();
    return parseFloat(this.web3.utils.fromWei(balance, "ether"));
  }

  async getActiveOffers(): Promise<any[]> {
    const activeOfferIds = await this.contract.methods.getActiveOffers().call();
    const offers = await Promise.all(
      activeOfferIds.map(async (id: number) => {
        const offer = await this.contract.methods.energyOffers(id).call();
        return {
          id,
          seller: offer.seller,
          amount: this.web3.utils.fromWei(offer.amount, "ether"),
          pricePerUnit: this.web3.utils.fromWei(offer.pricePerUnit, "ether"),
          timestamp: new Date(parseInt(offer.timestamp) * 1000),
          isActive: offer.isActive,
        };
      }),
    );
    return offers;
  }
}

export const energyTradingService = new EnergyTradingService();
