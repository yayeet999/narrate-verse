import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { menuItems } from "@/config/navigation";

interface MobileMenuProps {
  onSignOut: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const MobileMenu = ({ onSignOut, isOpen, setIsOpen }: MobileMenuProps) => {
  const navigate = useNavigate();

  const handleNavigation = (url: string) => {
    setIsOpen(false);
    navigate(url);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4 pt-4">
          {menuItems.map((item) => (
            <Button
              key={item.title}
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => handleNavigation(item.url)}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Button>
          ))}
          <Button
            variant="ghost"
            onClick={onSignOut}
            className="w-full justify-start gap-2 mt-4 border-t border-slate-200 dark:border-slate-800 pt-4"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
};