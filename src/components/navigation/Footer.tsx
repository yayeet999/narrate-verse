import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-row flex-wrap justify-between gap-4">
          {/* Column 1: Company Info */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">Narrately.ai</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Helping You Write Smarter
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Quick Links
            </h3>
            <div className="flex flex-col space-y-1">
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
            </div>
          </div>

          {/* Column 3: Legal Links */}
          <div className="flex flex-col space-y-2">
            <div className="flex flex-col space-y-1">
              <Link
                to="/terms"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            © {currentYear} Narrately.ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;