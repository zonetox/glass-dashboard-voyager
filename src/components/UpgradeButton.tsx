import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ArrowUp } from "lucide-react";

export function UpgradeButton() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Only show for authenticated users on free tier
  if (!user) return null;

  const handleUpgrade = () => {
    navigate("/upgrade");
  };

  return (
    <Button 
      onClick={handleUpgrade}
      className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90 transition-all duration-300"
    >
      <ArrowUp className="w-4 h-4 mr-2" />
      Nâng cấp lên Pro
    </Button>
  );
}