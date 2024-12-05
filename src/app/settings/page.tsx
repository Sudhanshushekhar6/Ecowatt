"use client";

import { AutoCompleteInput } from "@/components/onboarding/autocomplete-input"; // Import the AutoCompleteInput
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/context/auth-context";
import discomData from "@/data/electricity-providers.json";
import { auth, db } from "@/lib/firebase";
import { signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { LogOut, Settings as SettingsIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    electricityProvider: "",
    monthlyBill: "",
    hasSolarPanels: false,
    solarCapacity: "",
    installationDate: "",
    userCategory: "",
    hasBatteryStorage: false,
    storageCapacity: "",
    smartDevices: {
      thermostat: false,
      washingMachine: false,
      dishwasher: false,
      evCharger: false,
      other: "",
    },
    primaryGoal: "",
    notificationMethod: "",
    reportFrequency: "",
  });

  const [discoms, setDiscoms] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    // Handle nested smartDevices.other field
    if (name === "other") {
      setFormData((prevData) => ({
        ...prevData,
        smartDevices: {
          ...prevData.smartDevices,
          other: value,
        },
      }));
      return;
    }

    // Handle other fields
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSmartDeviceChange = (
    device: keyof typeof formData.smartDevices,
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      smartDevices: {
        ...prevData.smartDevices,
        [device]: !prevData.smartDevices[device],
      },
    }));
  };

  const handleSaveChanges = async () => {
    if (user) {
      try {
        setLoading(true);
        await updateDoc(doc(db, "users", user.uid), formData);
        toast.success("User data updated successfully");
        router.push("/dashboard");
      } catch (error) {
        console.error("Error updating user data:", error);
        toast.error("Failed to update user data. Please try again.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("You have been logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData((prevData) => ({
              ...prevData,
              ...userData,
            }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load user data. Please try again.");
        }
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    discomData.DISCOMs.forEach((discom) => {
      setDiscoms((prevDiscoms) => [...prevDiscoms, discom?.DISCOM!]);
    });
  }, []);

  if (!user) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[92vh] bg-muted">
      <main className="flex-1 py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="energy">Energy Settings</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account details here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={user.displayName || ""}
                      onChange={(e) =>
                        updateProfile(user, { displayName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email ?? ""} disabled />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="energy">
              <Card>
                <CardHeader>
                  <CardTitle>Energy Profile</CardTitle>
                  <CardDescription>
                    Manage your energy settings and solar system details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="electricityProvider">
                      Current electricity provider
                    </Label>
                    <AutoCompleteInput
                      data={discoms} // Pass the discoms data
                      className="w-full"
                      value={formData.electricityProvider}
                      setValue={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          electricityProvider: value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyBill">
                      Average monthly electricity bill ($)
                    </Label>
                    <Input
                      id="monthlyBill"
                      name="monthlyBill"
                      type="number"
                      value={formData.monthlyBill}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          monthlyBill: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userCategory">
                      Your requirement category:
                    </Label>
                    <RadioGroup
                      name="userCategory"
                      value={formData.userCategory || ""}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          userCategory: value,
                        }))
                      }
                      required
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="domestic"
                          id="category-domestic"
                        />
                        <Label htmlFor="category-domestic">Domestic</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="non_domestic"
                          id="category-non_domestic"
                        />
                        <Label htmlFor="category-non_domestic">
                          Non-Domestic
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="industry"
                          id="category-industry"
                        />
                        <Label htmlFor="category-industry">Industry</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>Do you have solar panels?</Label>
                    <RadioGroup
                      name="hasSolarPanels"
                      value={formData.hasSolarPanels.toString()}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          hasSolarPanels: value === "true",
                        }))
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="solar-yes" />
                        <Label htmlFor="solar-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="solar-no" />
                        <Label htmlFor="solar-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {formData.hasSolarPanels && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="solarCapacity">
                          Solar system capacity (kW)
                        </Label>
                        <Input
                          id="solarCapacity"
                          name="solarCapacity"
                          type="number"
                          value={formData.solarCapacity}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="installationDate">
                          Installation date
                        </Label>
                        <Input
                          id="installationDate"
                          name="installationDate"
                          type="date"
                          value={formData.installationDate}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Do you have battery storage?</Label>
                        <RadioGroup
                          name="hasBatteryStorage"
                          value={formData.hasBatteryStorage.toString()}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              hasBatteryStorage: value === "true",
                            }))
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="battery-yes" />
                            <Label htmlFor="battery-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="battery-no" />
                            <Label htmlFor="battery-no">No</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      {formData.hasBatteryStorage && (
                        <div className="space-y-2">
                          <Label htmlFor="storageCapacity">
                            Storage capacity (kWh)
                          </Label>
                          <Input
                            id="storageCapacity"
                            name="storageCapacity"
                            type="number"
                            value={formData.storageCapacity}
                            onChange={handleInputChange}
                          />
                        </div>
                      )}
                    </>
                  )}
                  <div className="space-y-2">
                    <Label>Smart devices you own:</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="thermostat"
                          checked={formData.smartDevices.thermostat}
                          onCheckedChange={() =>
                            handleSmartDeviceChange("thermostat")
                          }
                        />
                        <Label htmlFor="thermostat">Smart thermostat</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="washingMachine"
                          checked={formData.smartDevices.washingMachine}
                          onCheckedChange={() =>
                            handleSmartDeviceChange("washingMachine")
                          }
                        />
                        <Label htmlFor="washingMachine">
                          Smart washing machine
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="dishwasher"
                          checked={formData.smartDevices.dishwasher}
                          onCheckedChange={() =>
                            handleSmartDeviceChange("dishwasher")
                          }
                        />
                        <Label htmlFor="dishwasher">Smart dishwasher</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="evCharger"
                          checked={formData.smartDevices.evCharger}
                          onCheckedChange={() =>
                            handleSmartDeviceChange("evCharger")
                          }
                        />
                        <Label htmlFor="evCharger">EV charger</Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="otherDevices">
                        Other devices (please specify)
                      </Label>
                      <Input
                        id="otherDevices"
                        name="other"
                        value={formData.smartDevices.other}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Manage your notification and reporting preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select your primary energy goal:</Label>
                    <RadioGroup
                      name="primaryGoal"
                      value={formData.primaryGoal}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, primaryGoal: value }))
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="reduceBills" id="reduce-bills" />
                        <Label htmlFor="reduce-bills">
                          Reduce energy bills
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="maximizeSolar"
                          id="maximize-solar"
                        />
                        <Label htmlFor="maximize-solar">
                          Maximize use of solar energy
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="reduceCarbon"
                          id="reduce-carbon"
                        />
                        <Label htmlFor="reduce-carbon">
                          Reduce carbon footprint
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="gridStability"
                          id="grid-stability"
                        />
                        <Label htmlFor="grid-stability">
                          Optimize for grid stability
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notificationMethod">
                      Preferred notification method
                    </Label>
                    <Select
                      name="notificationMethod"
                      value={formData.notificationMethod}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          notificationMethod: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select notification method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="push">Push notification</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reportFrequency">
                      Frequency of reports
                    </Label>
                    <Select
                      name="reportFrequency"
                      value={formData.reportFrequency}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          reportFrequency: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select report frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <div className="mt-6 flex justify-between">
            <Button
              onClick={handleSaveChanges}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              <SettingsIcon className="mr-2 h-4 w-4" /> Save Changes
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-muted"
            >
              <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
