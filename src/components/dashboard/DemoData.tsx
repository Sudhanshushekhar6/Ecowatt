import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { toast } from "sonner";

const DemoDataButton = ({
  onLoadDemoData,
  className = "",
}: {
  onLoadDemoData: (data: string) => void;
  className?: string;
}) => {
  const handleDemoDataClick = async () => {
    try {
      const response = await fetch("/energy-data.csv");
      const csvText = await response.text();
      onLoadDemoData(csvText);

      toast.success("Demo data loaded successfully", {
        description:
          "You can now explore Ecowatt's features with sample data",
      });
    } catch (error) {
      console.error("Error loading demo data:", error);
      toast.error("Failed to load demo data", {
        description: "Please try again or upload your own CSV file",
      });
    }
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <p className="text-sm text-muted-foreground">
        Want to try Ecowatt with some demo data?
      </p>
      <Button variant="outline" className="gap-2" onClick={handleDemoDataClick}>
        <Lightbulb className="w-4 h-4" />
        Load Demo Data
      </Button>
    </div>
  );
};

export default DemoDataButton;
