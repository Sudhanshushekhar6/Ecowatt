"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { energyTradingService } from "@/lib/web3";
import { UserData } from "@/types/user";
import { doc, getDoc } from "firebase/firestore";
import {
  Coins,
  Loader2,
  PlusCircle,
  ShoppingCart,
  User,
  WalletIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface UserDetails {
  isRegistered: boolean;
  userId: string;
  name: string;
  email: string;
  registeredAt: number;
}

export default function Trading() {
  const [activeOffers, setActiveOffers] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mintAmount, setMintAmount] = useState("");
  const [userWallet, setUserWallet] = useState("");
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isWalletVisible, setIsWalletVisible] = useState(false);
  const { user } = useAuthContext();
  const [userFirebaseData, setUserFirebaseData] = useState<UserData | null>(
    null,
  );

  useEffect(() => {
    const initializeData = async () => {
      try {
        if (!user) return;

        const accounts = await energyTradingService.connectWallet();
        const userDocRef = doc(db, "users", user.uid);
        const userFirebaseData = await getDoc(userDocRef);

        setUserWallet(accounts[0]);
        setUserFirebaseData(userFirebaseData.data() as UserData);

        if (accounts[0]) {
          await checkAndRegisterUser(accounts[0]);
          await loadUserDetails(accounts[0]);
        }

        await loadOffers();
        await loadUserBalance();
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };

    initializeData();
  }, [user, userWallet]);

  const loadUserDetails = async (walletAddress: string) => {
    try {
      const details = await energyTradingService.getUserDetails(walletAddress);
      setUserDetails(details);
    } catch (error) {
      console.error("Error loading user details:", error);
    }
  };

  const checkAndRegisterUser = async (walletAddress: string) => {
    if (!user || !userWallet) return;

    try {
      const userInfo = await energyTradingService.getUserDetails(walletAddress);

      if (userInfo.isRegistered) {
        return;
      }

      if (user && user.displayName && user.email) {
        setIsLoading(true);

        try {
          await energyTradingService.registerUser({
            userId: user.uid,
            name: user.displayName,
            email: user.email,
          });

          // Reload user details after registration
          await loadUserDetails(walletAddress);
        } catch (error) {
          console.error("Error registering user in smart contract:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.error("No user data found in Firestore");
      }
    } catch (error) {
      console.error("Error checking/registering user:", error);
    }
  };

  const loadOffers = async () => {
    try {
      const offers = await energyTradingService.getActiveOffers();
      setActiveOffers(offers as any);
    } catch (error) {
      console.error("Error loading offers:", error);
    }
  };

  const loadUserBalance = async () => {
    try {
      const accounts = await energyTradingService.connectWallet();
      const balance = await energyTradingService.getUserBalance(accounts[0]);
      setUserBalance(Number(balance));
    } catch (error) {
      console.error("Error loading balance:", error);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await energyTradingService.createEnergyOffer(
        parseFloat(amount),
        parseFloat(price),
      );
      await loadOffers();
      setAmount("");
      setPrice("");
    } catch (error) {
      console.error("Error creating offer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeWallet = async () => {
    setIsLoading(true);
    try {
      const newWallet = await energyTradingService.changeWallet();
      if (newWallet) {
        setUserWallet(newWallet);
        await loadUserDetails(newWallet);
        await loadUserBalance();
      }
    } catch (error) {
      console.error("Error changing wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await energyTradingService.mintEnergyTokens(parseFloat(mintAmount));
      await loadUserBalance();
      setMintAmount("");
    } catch (error) {
      console.error("Error minting tokens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Ecowatt Market</h1>
            <p className="text-sm text-muted-foreground">
              Got too much Solar Power? Want to sell it? Ecowatt Market is the
              place for you! List your solar power for sale and make a profit.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleChangeWallet}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <WalletIcon className="mr-2 h-4 w-4" />
            )}
            Change Wallet
          </Button>
        </div>

        {userDetails && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                User Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Wallet Address
                  </p>
                  <p
                    className="font-medium cursor-pointer"
                    onClick={() => setIsWalletVisible(!isWalletVisible)}
                  >
                    {isWalletVisible
                      ? userWallet
                      : "*".repeat(userWallet.length)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{userDetails.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{userDetails.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered On</p>
                  <p className="font-medium">
                    {new Date(
                      userDetails.registeredAt * 1000,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Alert>
            <AlertDescription className="text-lg">
              Your Current Battery Level:{" "}
              <span className="font-bold">
                {userFirebaseData
                  ? Number(userFirebaseData.currentBatteryPower)
                  : "-"}{" "}
                kW
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                {userFirebaseData &&
                Number(userFirebaseData.currentBatteryPower) ===
                  Number(userFirebaseData.storageCapacity)
                  ? "(Full)"
                  : ""}
              </span>
            </AlertDescription>
          </Alert>
          <Alert>
            <AlertDescription className="text-lg">
              Your Energy Balance:{" "}
              <span className="font-bold">{userBalance} ET</span>
              <span className="text-sm text-muted-foreground ml-2">
                (Energy Tokens)
              </span>
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Card className="w-full md:w-1/2">
            <CardHeader>
              <CardTitle>Mint Energy Tokens</CardTitle>
              <CardDescription>
                Convert your ETH to energy tokens. Rate: 0.001 ETH per token
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMintTokens} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mintAmount">Amount to Mint (kWh)</Label>
                  <Input
                    id="mintAmount"
                    type="number"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    placeholder="Enter amount to mint"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Cost: {(parseFloat(mintAmount) || 0) * 0.001} ETH
                  </p>
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Coins className="mr-2 h-4 w-4" />
                  )}
                  Mint Tokens
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="w-full md:w-1/2">
            <CardHeader>
              <CardTitle>Create New Offer</CardTitle>
              <CardDescription>
                List your energy for sale on the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOffer} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (kWh)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per kWh (ET)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Enter price"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                  )}
                  Create Offer
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        <div>
          <h2 className="text-2xl font-semibold mb-4">Active Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOffers.map((offer: any) => (
              <Card key={offer.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {offer.amount} kWh Available
                  </CardTitle>
                  <CardDescription>
                    Seller: {offer.seller.slice(0, 6)}...
                    {offer.seller.slice(-4)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Price: {offer.pricePerUnit} ET/kWh
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Cost: {offer.pricePerUnit * offer.amount} ET
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Posted: {offer.timestamp.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => {
                      energyTradingService.purchaseEnergy(offer.id, 2);
                    }}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Purchase Energy
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
