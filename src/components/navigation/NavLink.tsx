import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface NavLinkProps {
  to: string;
  variant?: "default" | "ghost" | "outline";
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const NavLink = ({ to, variant = "ghost", className, children, disabled }: NavLinkProps) => {
  return (
    <Link to={to}>
      <Button 
        variant={variant}
        className={className}
        disabled={disabled}
      >
        {children}
      </Button>
    </Link>
  );
};

export default NavLink;