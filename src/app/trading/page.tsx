'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { energyTradingService } from '@/lib/web3';
import { Loader2, PlusCircle, ShoppingCart, WalletIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function Trading() {
    const [activeOffers, setActiveOffers] = useState([]);
    const [userBalance, setUserBalance] = useState(0);
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        loadOffers();
        loadUserBalance();
    }, []);
    
    const loadOffers = async () => {
        try {
            const offers = await energyTradingService.getActiveOffers();
            setActiveOffers(offers as any);
        } catch (error) {
            console.error('Error loading offers:', error);
        }
    };
    
    const loadUserBalance = async () => {
        try {
            const accounts = await energyTradingService.connectWallet();
            const balance = await energyTradingService.getUserBalance(accounts[0]);
            setUserBalance(balance);
        } catch (error) {
            console.error('Error loading balance:', error);
        }
    };
    
    const handleCreateOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await energyTradingService.createEnergyOffer(
                parseFloat(amount),
                parseFloat(price)
            );
            await loadOffers();
            setAmount('');
            setPrice('');
        } catch (error) {
            console.error('Error creating offer:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeWallet = async () => {
        setIsLoading(true);
        try {
            await energyTradingService.changeWallet();
            await loadUserBalance();
        } catch (error) {
            console.error('Error changing wallet:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                    <h1 className="text-3xl font-bold">Prabhwatt Market</h1>
                    <p className='text-sm text-muted-foreground'>
                        Got too much Solar Power? Want to sell it? Prabhwatt Market is the place for you! List your solar power for sale and make a profit.
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

                <Alert>
                    <AlertDescription className="text-lg">
                        Your Energy Balance: <span className="font-bold">{userBalance} kWh</span>
                    </AlertDescription>
                </Alert>

                <Card>
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
                                    <Label htmlFor="price">Price per kWh (ETH)</Label>
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
                            <Button 
                                type="submit" 
                                disabled={isLoading}
                            >
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
                                        Seller: {offer.seller.slice(0, 6)}...{offer.seller.slice(-4)}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Price: {offer.pricePerUnit} ETH/kWh
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Posted: {offer.timestamp.toLocaleString()}
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button 
                                        className="w-full"
                                        onClick={() => energyTradingService.purchaseEnergy(
                                            offer.id,
                                            offer.amount,
                                            offer.amount * offer.pricePerUnit
                                        )}
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