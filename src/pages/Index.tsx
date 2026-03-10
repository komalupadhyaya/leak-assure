import { Droplets } from "lucide-react";
import SignupForm from "@/components/SignupForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-white flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-[500px]">
        {/* Brand / Logo Area */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200/50 mb-6 group hover:scale-105 transition-transform duration-300">
            <Droplets className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight lg:text-4xl mb-3">
            Leak <span className="text-blue-600">Assure</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-[320px] leading-relaxed">
            Secure your home with interior plumbing protection others deny.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"></div>

          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Complete Your Enrollment
            </h2>
            <p className="text-sm text-slate-500">
              Enter your details below to activate your protection plan.
            </p>
          </div>

          <SignupForm />
        </div>

        {/* Trust Footer */}
        <p className="text-center text-slate-400 text-xs mt-10 font-medium tracking-wide">
          TRUSTED BY HOMEOWNERS NATIONWIDE • NO HIDDEN FEES
        </p>
      </div>
    </div>
  );
};

export default Index;
