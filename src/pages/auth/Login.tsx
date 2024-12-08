import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Sign in to continue to Narrately.ai
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
            view="sign_in"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;