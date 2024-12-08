import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthChangeEvent } from "@supabase/supabase-js";

const Signup = () => {
  const navigate = useNavigate();
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      console.log("Auth event:", event);
      if (event === 'SIGNED_IN') {  // Changed from SIGNED_UP to SIGNED_IN
        setShowVerification(true);
      } else if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (showVerification) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Check your email
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              We've sent you an email with a verification link. Please check your inbox and click the link to verify your account.
            </p>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">
              Didn't receive the email? Check your spam folder or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Join Narrately.ai and start creating amazing content
          </p>
        </div>
        <div className="mt-8 bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#0EA5E9',
                    brandAccent: '#0284C7',
                    inputBackground: 'white',
                    inputText: 'black',
                    inputBorder: '#E2E8F0',
                    inputBorderFocus: '#0EA5E9',
                    inputBorderHover: '#CBD5E1',
                  },
                  space: {
                    buttonPadding: '12px 16px',
                    inputPadding: '12px 16px',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '6px',
                    buttonBorderRadius: '6px',
                    inputBorderRadius: '6px',
                  },
                },
              },
              className: {
                container: 'space-y-4',
                button: 'bg-primary hover:bg-primary/90 text-white w-full',
                input: 'w-full border-slate-200 dark:border-slate-700',
                label: 'text-sm font-medium text-slate-700 dark:text-slate-200',
                message: 'text-sm text-red-600 dark:text-red-400',
              },
            }}
            providers={["google", "apple"]}
            redirectTo={`${window.location.origin}/dashboard`}
            view="sign_up"
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;