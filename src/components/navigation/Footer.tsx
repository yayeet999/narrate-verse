import { Facebook, Github, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: "#", label: "Facebook" },
    { icon: <Twitter className="h-5 w-5" />, href: "#", label: "Twitter" },
    { icon: <Instagram className="h-5 w-5" />, href: "#", label: "Instagram" },
    { icon: <Linkedin className="h-5 w-5" />, href: "#", label: "LinkedIn" },
    { icon: <Github className="h-5 w-5" />, href: "#", label: "Github" },
  ];

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">Narrately.ai</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Helping You Write Smarter
            </p>
            <Link
              to="/about"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
            >
              About Us
            </Link>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Quick Links
            </h3>
            <div className="flex flex-col space-y-2">
              <Link
                to="/features"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/contact"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Contact
              </Link>
              <Link
                to="/faq"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
              >
                FAQ
              </Link>
            </div>
          </div>

          {/* Column 3: Social & Legal */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                Follow us for updates
              </h3>
              <div className="flex space-x-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                    aria-label={link.label}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Link
                to="/terms"
                className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/privacy"
                className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            © {currentYear} Narrately.ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;