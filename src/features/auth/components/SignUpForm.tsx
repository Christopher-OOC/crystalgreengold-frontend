import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { StepIndicator } from "@/shared/ui/StepIndicator";
import { memberService } from "@/lib/api/services/member.service";
import { tokenStorage } from "@/lib/api/client";
import { useUIStore } from "@/lib/store/uiStore";
import type { CreateMemberRequest } from "@/lib/types/member.types";

// ─── Per-step validation ───────────────────────────────────────────────────────

const initialFormData = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
  username: "",
  sponsor: "",
  placer: "",
  leg: "LEFT",
};

function validateStep(
  step: number,
  data: typeof initialFormData,
): string | null {
  if (step === 1) {
    if (!data.firstName.trim()) return "First name is required";
    if (!data.lastName.trim()) return "Last name is required";
    if (!data.phoneNumber.trim()) return "Phone number is required";
  }
  if (step === 2) {
    if (!data.email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(data.email)) return "Enter a valid email address";
    if (!data.username.trim()) return "Username is required";
    if (data.username.length <= 3)
      return "Username must be at least 3 characters";
  }
  if (step === 3) {
    if (!data.sponsor.trim()) return "Sponsor is required";
    if (!data.placer.trim()) return "Placer is required";
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SignUpFormProps {
  onLoginClick: () => void;
  onLoginSuccess: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onLoginClick,
  onLoginSuccess,
}) => {
  const searchParams = useSearchParams();
  const { toast } = useUIStore();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  // Pre-fill from query params if available
  const sponsorParam = searchParams.get("sponsor") || "";
  const placerParam = searchParams.get("placer") || "";
  const legParam =
    (searchParams.get("leg")?.toUpperCase() as "LEFT" | "RIGHT") || "LEFT";

  const [formData, setFormData] = useState({
    ...initialFormData,
    sponsor: sponsorParam,
    placer: placerParam,
    leg: legParam,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setStepError(null);
  };

  const advanceTo = (next: number) => {
    const err = validateStep(step, formData);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    setStep(next);
  };

  const handleSignUp = async () => {
    const err = validateStep(3, formData);
    if (err) {
      setStepError(err);
      return;
    }

    setIsLoading(true);
    setStepError(null);

    try {
      // Clear any stale tokens before signing up a new user
      tokenStorage.clearTokens();

      const payload: CreateMemberRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        sponsorId: formData.sponsor.trim(),
        placementId: formData.placer.trim(),
        leg: formData.leg as "LEFT" | "RIGHT",
        address: "",
        memberType: "REGULAR_MEMBER",
      };

      await memberService.create(payload);

      toast.success(
        "Account Created!",
        "Check your email for your username and login details.",
      );

      // On success, we can redirect to login or dashboard
      // Based on App.tsx, we probably want to go to dashboard if login is automatic
      // but here we just have a button to go to login.
      // Let's use onLoginSuccess if we want them to go to dashboard
      setStep(4);
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : null;
      setStepError(
        message ??
          "Registration failed. Please check your details and try again.",
      );
      toast.error("Registration failed", message ?? "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center max-w-xs mx-auto w-full">
      <div className="mb-3 text-center md:text-left">
        <h1 className="text-lg md:text-xl font-bold text-emerald-950 dark:text-white mb-0.5">
          Create Account
        </h1>
      </div>

      <StepIndicator currentStep={step} />
      {step < 4 && (
        <p className="text-center text-[8px] font-bold text-emerald-400 uppercase tracking-[0.2em] -mt-2.5 mb-3">
          {step === 1 && "Personal Information"}
          {step === 2 && "Account Information"}
          {step === 3 && "Sponsor & Placement"}
        </p>
      )}

      <AnimatePresence mode="wait">
        {/* ── Step 1 ─────────────────────────────────────────────────────────── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="space-y-2.5"
          >
            <Input
              id="firstName"
              label="First Name"
              icon={User}
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleInputChange}
            />
            <Input
              id="lastName"
              label="Last Name"
              icon={User}
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleInputChange}
            />
            <Input
              id="phoneNumber"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              label="Phone Number"
              icon={Phone}
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />

            {stepError && <StepErrorBanner message={stepError} />}

            <Button
              onClick={() => advanceTo(2)}
              className="w-full py-2 rounded-xl text-xs flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Button>
          </motion.div>
        )}

        {/* ── Step 2 ─────────────────────────────────────────────────────────── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="space-y-2.5"
          >
            <Input
              id="email"
              label="Email Address"
              icon={Mail}
              placeholder="you@domain.com"
              value={formData.email}
              onChange={handleInputChange}
            />

            {/* Password with eye toggle */}
            <div className="w-full">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 ml-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-amber-400 transition-colors">
                  <ShieldCheck size={16} />
                </div>
                <input
                  id="username"
                  type={showPassword ? "text" : "text"}
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full bg-white/50 dark:bg-emerald-900/50 border border-emerald-100 dark:border-emerald-800 rounded-xl py-2 pl-10 pr-12 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all placeholder:text-emerald-400 dark:placeholder:text-emerald-700 text-sm text-emerald-950 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-100 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {stepError && <StepErrorBanner message={stepError} />}

            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="secondary"
                onClick={() => {
                  setStepError(null);
                  setStep(1);
                }}
                className="w-full py-2 rounded-xl text-xs"
              >
                Back
              </Button>
              <Button
                onClick={() => advanceTo(3)}
                className="w-full py-2 rounded-xl text-xs flex items-center justify-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3 ─────────────────────────────────────────────────────────── */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="space-y-2.5"
          >
            <div className="flex items-center space-x-2 text-[10px] text-amber-400 font-semibold mb-0.5">
              <button
                onClick={() => {
                  setStepError(null);
                  setStep(2);
                }}
                className="flex items-center hover:text-amber-400 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                <ArrowRight size={12} className="rotate-180 mr-1" />
                Back
              </button>
            </div>

            <Input
              id="sponsor"
              label="Sponsor"
              icon={User}
              placeholder="Enter your sponsor"
              value={formData.sponsor}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <Input
              id="placer"
              label="Placer"
              icon={User}
              placeholder="Enter your placer"
              value={formData.placer}
              onChange={handleInputChange}
              disabled={isLoading}
            />

            <div className="space-y-1">
              <label
                htmlFor="leg"
                className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 ml-1"
              >
                Leg
              </label>
              <div className="relative">
                <select
                  id="leg"
                  value={formData.leg}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full bg-white/50 dark:bg-emerald-900/50 border border-emerald-100 dark:border-emerald-800 rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all appearance-none text-emerald-950 dark:text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <option value="LEFT">LEFT</option>
                  <option value="RIGHT">RIGHT</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {stepError && <StepErrorBanner message={stepError} />}

            <Button
              onClick={handleSignUp}
              className="w-full py-2 rounded-xl text-xs flex items-center justify-center space-x-2"
              isLoading={isLoading}
            >
              <span>Create Account</span>
              {!isLoading && (
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              )}
            </Button>

            <div className="text-center pt-1">
              <p className="text-emerald-600 dark:text-emerald-400 text-[10px]">
                Already have an account?{" "}
                <button
                  onClick={onLoginClick}
                  className="text-amber-400 hover:text-amber-400 font-bold ml-1"
                >
                  Sign in
                </button>
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Step 4 — Success ────────────────────────────────────────────────── */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-3 py-6"
          >
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-xl font-bold text-emerald-950 dark:text-white">
              Welcome Aboard!
            </h2>
            <p className="text-emerald-600 dark:text-emerald-400 text-xs">
              Your account has been created successfully. Redirecting you to the
              dashboard...
            </p>
            <button
              onClick={onLoginClick}
              className="text-amber-400 hover:underline font-medium text-xs"
            >
              Go to login now
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {step < 3 && (
        <div className="mt-4 pt-3 border-t border-emerald-50 dark:border-emerald-900 text-center">
          <p className="text-emerald-600 dark:text-emerald-400 text-[10px]">
            Already have an account?{" "}
            <button
              onClick={onLoginClick}
              className="text-amber-400 hover:text-amber-400 font-bold ml-1"
            >
              Sign in
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Inline error banner ──────────────────────────────────────────────────────

function StepErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30"
    >
      <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
      <p className="text-red-600 dark:text-red-400 text-[10px] leading-relaxed">
        {message}
      </p>
    </motion.div>
  );
}

export default SignUpForm;
