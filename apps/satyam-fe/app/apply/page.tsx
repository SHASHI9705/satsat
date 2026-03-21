"use client"

import React, { useState, useCallback } from "react";
import Link from "next/link";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Upload,
  CreditCard,
  Camera,
  FileText,
  ArrowLeft,
  CheckCircle,
  Globe,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Shield,
  Banknote,
  Smartphone,
  Lock,
  XCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  name: string;
  fatherName: string;
  gender: "male" | "female" | "other" | "";
  phone: string;
  email: string;
  address: string;
  district: string;
  experience: "fresher" | "experienced" | "";
  positionApplied: string;
  jobProfileLink: string;
  acceptTerms: boolean;
  passportPhoto: string; // Added field for passport photo
  resumePdf: string; // Added field for resume PDF
  salarySlip: string;
  paid: boolean; // Added field for payment status
}

interface FilesState {
  photo: File | null;
  resume: File | null;
  salarySlip: File | null;
}

type FieldErrors = Partial<Record<keyof FormData | keyof FilesState, string>>;

// ─── Constants ────────────────────────────────────────────────────────────────
const POSITIONS = [
  { value: "branch_incharge",   label: "Branch Incharge" },
  { value: "credit_cashier",    label: "Credit / Cashier" },
  { value: "sales_vehicle",     label: "Sales Executive — Vehicle Loan" },
  { value: "sales_msme",        label: "Sales Executive — MSME Loan" },
  { value: "sales_insurance",   label: "Sales Executive — Insurance" },
  { value: "collection",        label: "Collection Executive" },
  { value: "telecalling",       label: "Telecalling (Work From Home - Female Candidates Only)" },
];

const DISTRICTS = [
  "Ajmer",
  "Alwar",
  "Banswara",
  "Baran",
  "Barmer",
  "Bharatpur",
  "Bhilwara",
  "Bikaner",
  "Bundi",
  "Chittaurgarh",
  "Churu",
  "Dausa",
  "Dhaulpur",
  "Dungarpur",
  "Ganganagar",
  "Hanumangarh",
  "Jaipur",
  "Jaisalmer",
  "Jalor",
  "Jhalawar",
  "Jhunjhunun",
  "Jodhpur",
  "Karauli",
  "Kota",
  "Nagaur",
  "Pali",
  "Pratapgarh",
  "Rajsamand",
  "Sawai Madhopur",
  "Sikar",
  "Sirohi",
  "Tonk",
  "Udaipur",
];

const PAYMENT_METHODS = [
  { id: "upi",        label: "UPI",               description: "Google Pay · PhonePe · Paytm",    Icon: Smartphone },
  { id: "card",       label: "Credit / Debit Card", description: "Visa · Mastercard · RuPay",       Icon: CreditCard },
  { id: "netbanking", label: "Net Banking",         description: "All major banks supported",        Icon: Banknote },
];

const BASE_FEE = 300;
const GST_RATE = 0;
const GST_AMT  = +(BASE_FEE * GST_RATE).toFixed(2);
const TOTAL    = +(BASE_FEE + GST_AMT).toFixed(2);

const STEPS = [
  { number: 1, title: "Personal Info",        short: "Personal",     Icon: User },
  { number: 2, title: "Professional Details", short: "Professional", Icon: Briefcase },
  { number: 3, title: "Documents Upload",     short: "Documents",    Icon: Upload },
];

// ─── Validation ───────────────────────────────────────────────────────────────
const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

function validateStep(step: number, formData: FormData, files: FilesState): FieldErrors {
  const errors: FieldErrors = {};
  if (step === 1) {
    if (!formData.name.trim())       errors.name       = "Full name is required.";
    if (!formData.fatherName.trim()) errors.fatherName = "Father's name is required.";
    if (!formData.gender)            errors.gender     = "Please select your gender.";
    if (!MOBILE_RE.test(formData.phone))
      errors.phone = "Enter a valid 10-digit Indian phone number.";
    if (!EMAIL_RE.test(formData.email))
      errors.email  = "Enter a valid email address.";
    if (!formData.address.trim())    errors.address    = "Address is required.";
    if (!formData.district)          errors.district   = "Please select a district/city.";
  }
  if (step === 2) {
    if (!formData.experience) errors.experience = "Please select your experience level.";
    if (!formData.positionApplied)       errors.positionApplied       = "Please select a position.";
    if (formData.positionApplied === "telecalling" && formData.gender !== "female") {
      errors.positionApplied = "Telecalling is available only for female candidates.";
    }
  }
  if (step === 3) {
    if (!files.photo)            errors.photo       = "Passport photo is required.";
    if (!files.resume)           errors.resume      = "Resume/CV is required.";
    if (formData.experience === "experienced" && !files.salarySlip) {
      errors.salarySlip = "Last company salary slip is required for experienced candidates.";
    }
    if (!formData.acceptTerms)   errors.acceptTerms = "You must confirm that all information is accurate.";
  }
  return errors;
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
      <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
      {msg}
    </p>
  );
}

function InputWrapper({
  label, required, error, children, className = "",
}: { label: string; required?: boolean; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      <FieldError msg={error} />
    </div>
  );
}

const inputCls = (hasError?: boolean) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
   focus:ring-2 focus:ring-blue-200 focus:border-blue-500
   ${hasError ? "border-red-400 bg-red-50 focus:ring-red-100" : "border-slate-200 bg-white hover:border-slate-300"}`;

const iconInputCls = (hasError?: boolean) =>
  `w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all outline-none
   focus:ring-2 focus:ring-blue-200 focus:border-blue-500
   ${hasError ? "border-red-400 bg-red-50 focus:ring-red-100" : "border-slate-200 bg-white hover:border-slate-300"}`;

// ─── Progress indicator ───────────────────────────────────────────────────────
function StepProgress({ current }: { current: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((step, idx) => {
        const done   = current > step.number;
        const active = current === step.number;
        const { Icon } = step;
        return (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${done   ? "bg-blue-600 border-blue-600 text-white"
                : active ? "bg-white border-blue-600 text-blue-600"
                         : "bg-white border-slate-200 text-slate-400"}`}>
                {done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`mt-1.5 text-xs font-medium hidden sm:block transition-colors
                ${done || active ? "text-blue-700" : "text-slate-400"}`}>
                {step.short}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all duration-300
                ${current > step.number ? "bg-blue-600" : "bg-slate-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── File upload box ──────────────────────────────────────────────────────────
function FileUploadBox({ label, Icon, accept, file, error, onChange }: {
  label: string; Icon: React.ElementType; accept: string;
  file: File | null; error?: string; onChange: (f: File) => void;
}) {
  return (
    <div className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 cursor-pointer transition-all
      ${error ? "border-red-300 bg-red-50" : file ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/50"}`}>
      <input type="file" accept={accept}
        onChange={e => e.target.files?.[0] && onChange(e.target.files[0])}
        className="absolute inset-0 opacity-0 cursor-pointer" />
      <Icon className={`w-8 h-8 mb-2 ${file ? "text-blue-500" : "text-slate-400"}`} />
      <span className="text-xs font-semibold text-slate-600 text-center mb-1">{label}</span>
      {file ? (
        <span className="text-xs text-blue-600 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          {file.name.length > 20 ? file.name.slice(0, 18) + "…" : file.name}
        </span>
      ) : (
        <span className="text-[11px] text-slate-400">Click to upload</span>
      )}
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
const colorMap: Record<string, string> = {
  blue:    "bg-blue-100 text-blue-700",
  indigo:  "bg-indigo-100 text-indigo-700",
  emerald: "bg-emerald-100 text-emerald-700",
};

function SectionHeader({ Icon, color, title }: { Icon: React.ElementType; color: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[color] ?? colorMap.blue}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-base font-semibold text-slate-800">{title}</h2>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Apply() {
  const [currentStep, setCurrentStep] = useState(1);
  const [phase, setPhase] = useState<"form" | "payment" | "success">("form");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [appId] = useState(() => "APP" + Math.floor(10000 + Math.random() * 90000));
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "", fatherName: "", gender: "", phone: "", email: "",
    address: "", district: "", experience: "", positionApplied: "",
    jobProfileLink: "", acceptTerms: false,
    passportPhoto: "", // Added field for passport photo
    resumePdf: "", // Added field for resume PDF
    salarySlip: "",
    paid: false, // Added field for payment status
  });

  const [files, setFiles] = useState<FilesState>({
    photo: null, resume: null, salarySlip: null,
  });

  const [paymentMethod, setPaymentMethod] = useState("");
  const [payErrors, setPayErrors] = useState("");

  // ── Handlers ──
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "gender" && value !== "female" && prev.positionApplied === "telecalling") {
        next.positionApplied = "";
      }
      return next;
    });
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  const handleFile = useCallback((field: keyof FilesState, file: File) => {
    setFiles(prev => ({ ...prev, [field]: file }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const advanceStep = () => {
    const errs = validateStep(currentStep, formData, files);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    if (currentStep < STEPS.length) {
      setCurrentStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setPhase("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    setErrors({});
    if (phase === "payment") { setPhase("form"); setCurrentStep(3); return; }
    setCurrentStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Use the backend's public URL from environment variables
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  if (!backendUrl) {
    console.error('Backend URL is missing. Please configure NEXT_PUBLIC_BACKEND_URL in your environment variables.');
    alert('Application cannot be submitted. Missing backend configuration.');
    return;
  }

  const isFormComplete = () => {
    const requiredFields = ["name", "fatherName", "gender", "phone", "email", "address", "district", "experience", "positionApplied", "passportPhoto", "resumePdf"];
    if (formData.experience === "experienced") requiredFields.push("salarySlip");
    return requiredFields.every(field => formData[field]);
  };

  const areFilesUploaded = () => {
    const requiredFiles = ["photo", "resume"];
    if (formData.experience === "experienced") requiredFiles.push("salarySlip");
    return requiredFiles.every(field => files[field]);
  };

  const handleSubmitApplication = async () => {
    setSubmitting(true);

    // Ensure terms are accepted before submitting
    if (!formData.acceptTerms) {
      alert('Please agree to the Terms & Conditions before submitting the application.');
      setSubmitting(false);
      return;
    }
    if (!isFormComplete()) {
      alert("Please fill in all required fields before submitting the application.");
      setSubmitting(false);
      return;
    }

    if (!areFilesUploaded()) {
      alert("Please upload the required files before submitting the application.");
      setSubmitting(false);
      return;
    }

    // Validate file types and sizes
    const validateFile = (file: File, allowedTypes: string[], maxSize: number) => {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.name}. Allowed types: ${allowedTypes.join(', ')}`);
      }
      if (file.size > maxSize) {
        throw new Error(`File too large: ${file.name}. Max size: ${maxSize / (1024 * 1024)} MB`);
      }
    };

    try {
      validateFile(files.photo!, ['image/jpeg', 'image/png'], 5 * 1024 * 1024); // 5 MB limit
      validateFile(files.resume!, ['application/pdf'], 5 * 1024 * 1024); // 5 MB limit
      if (files.salarySlip) {
        validateFile(files.salarySlip, ['application/pdf', 'image/jpeg', 'image/png'], 5 * 1024 * 1024);
      }
    } catch (validationError) {
      const errorMessage = validationError instanceof Error ? validationError.message : 'Invalid file upload.';
      alert(errorMessage);
      setSubmitting(false);
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.id;

    if (!token) {
      alert('User not authenticated. Please log in.');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('fatherName', formData.fatherName);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('district', formData.district);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('positionApplied', formData.positionApplied);
      formDataToSend.append('jobProfileLink', formData.jobProfileLink);
      formDataToSend.append('passportPhoto', files.photo!);
      formDataToSend.append('resumePdf', files.resume!);
      if (files.salarySlip) {
        formDataToSend.append('salarySlip', files.salarySlip);
      }
      formDataToSend.append('paid', 'false');

      const response = await fetch(`${backendUrl}/api/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      alert('Application submitted successfully!');
      setPhase('payment');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('An error occurred while submitting your application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY || '';

    if (!razorpayKey) {
      console.error('Razorpay key is missing. Please configure NEXT_PUBLIC_RAZORPAY_KEY in your environment variables.');
      alert('Payment cannot proceed. Missing Razorpay configuration.');
      return;
    }

    setPayErrors('');

    try {
      // Load Razorpay script
      const loadRazorpay = () => {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isRazorpayLoaded = await loadRazorpay();
      if (!isRazorpayLoaded) {
        alert('Failed to load Razorpay. Please try again.');
        return;
      }



      // Open Razorpay checkout
      const options = {
        key: razorpayKey, // Use the resolved Razorpay key
        amount: TOTAL * 100,
        currency: 'INR',
        name: 'SATYAM',
        description: 'Application Fee',
        handler: async (response: any) => {
          alert('Payment successful!');

          // Update user payment status
          try {
            const updateResponse = await fetch(`${backendUrl}/api/users/${formData.email}/payment`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
            });

            if (!updateResponse.ok) {
              throw new Error('Failed to update payment status');
            }

            setPhase('success');
          } catch (error) {
            console.error(error);
            alert('Payment succeeded, but failed to update payment status. Please contact support.');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#3399cc',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment failed:', error);
      alert('An error occurred during payment. Please try again.');
    }
  };
  

  const positionLabel = POSITIONS.find(p => p.value === formData.positionApplied)?.label ?? formData.positionApplied;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Top bar ── */}
      <header className="bg-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link href="/" className="text-lg font-bold tracking-tight">
            SATYAM
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-blue-300">
            <Shield className="w-4 h-4" />
            Secure Form
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      {phase !== "success" && (
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <p className="text-blue-300 text-sm mb-1 uppercase tracking-widest font-medium">
              {phase === "payment" ? "Step 2 of 2" : "Step 1 of 2"}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {phase === "payment" ? "Complete Payment" : "Job Application"}
            </h1>
            <p className="text-blue-200 text-base max-w-xl">
              {phase === "payment"
                ? "Your application has been received. Complete the payment to confirm your candidacy."
                : "Fill in the details below to apply. All fields marked with * are mandatory."}
            </p>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* ════════════════════ FORM PHASE ════════════════════ */}
        {phase === "form" && (
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Left: form */}
            <div className="lg:col-span-2 space-y-6">

              {/* Progress */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-5">
                <StepProgress current={currentStep} />
              </div>

              {/* ── Step 1 ── */}
              {currentStep === 1 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <SectionHeader Icon={User} color="blue" title="Personal Information" />
                  <div className="grid sm:grid-cols-2 gap-5">
                    <InputWrapper label="Full Name" required error={errors.name}>
                      <input name="name" value={formData.name} onChange={handleInput}
                        placeholder="e.g. Rahul Sharma"
                        className={inputCls(!!errors.name)} />
                    </InputWrapper>

                    <InputWrapper label="Father's Name" required error={errors.fatherName}>
                      <input name="fatherName" value={formData.fatherName} onChange={handleInput}
                        placeholder="e.g. Suresh Sharma"
                        className={inputCls(!!errors.fatherName)} />
                    </InputWrapper>

                    <InputWrapper label="Gender" required error={errors.gender}>
                      <select name="gender" value={formData.gender} onChange={handleInput}
                        className={inputCls(!!errors.gender)}>
                        <option value="">Select gender…</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </InputWrapper>

                    <InputWrapper label="phone Number" required error={errors.phone}>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="phone" value={formData.phone} onChange={handleInput}
                          placeholder="10-digit phone number" maxLength={10}
                          className={iconInputCls(!!errors.phone)} />
                      </div>
                    </InputWrapper>

                    <InputWrapper label="Email Address" required error={errors.email}>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="email" type="email" value={formData.email} onChange={handleInput}
                          placeholder="you@example.com"
                          className={iconInputCls(!!errors.email)} />
                      </div>
                    </InputWrapper>

                    <InputWrapper label="District / City" required error={errors.district}>
                      <select name="district" value={formData.district} onChange={handleInput}
                        className={inputCls(!!errors.district)}>
                        <option value="">Select a district/city…</option>
                        {DISTRICTS.map((district) => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </InputWrapper>

                    <InputWrapper label="Current Address" required error={errors.address} className="sm:col-span-2">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <textarea name="address" value={formData.address} onChange={handleInput}
                          placeholder="House No., Street, City, State, PIN"
                          rows={3}
                          className={`${iconInputCls(!!errors.address)} resize-none`} />
                      </div>
                    </InputWrapper>

                    
                  </div>
                </div>
              )}

              {/* ── Step 2 ── */}
              {currentStep === 2 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <SectionHeader Icon={Briefcase} color="indigo" title="Professional Details" />
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        Experience Level <span className="text-red-500">*</span>
                      </label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          { value: "fresher",     label: "Fresher",    sub: "0 – 1 year" },
                          { value: "experienced", label: "Experienced", sub: "2+ years" },
                        ].map(opt => (
                          <label key={opt.value}
                            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                              ${formData.experience === opt.value
                                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-400"
                                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`}>
                            <input type="radio" name="experience" value={opt.value}
                              checked={formData.experience === opt.value}
                              onChange={handleInput} className="accent-blue-600" />
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{opt.label}</p>
                              <p className="text-xs text-slate-500">{opt.sub}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      <FieldError msg={errors.experience} />
                    </div>

                    <InputWrapper label="Position Applied For" required error={errors.positionApplied}>
                      <select name="positionApplied" value={formData.positionApplied} onChange={handleInput}
                        className={inputCls(!!errors.positionApplied)}>
                        <option value="">Select a position…</option>
                        {POSITIONS.map(p => (
                          <option key={p.value} value={p.value}
                            disabled={p.value === "telecalling" && formData.gender !== "female"}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </InputWrapper>

                    {formData.positionApplied === "telecalling" && formData.gender === "female" && (
                      <p className="text-xs text-indigo-700 -mt-3">Telecalling is available only for female candidates.</p>
                    )}

                    {formData.experience === "experienced" && (
                      <p className="text-xs text-indigo-700 -mt-3">
                        Experienced applicants must upload their last company salary slip in the documents step.
                      </p>
                    )}

                    <InputWrapper label="Job Portal Profile Link">
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="jobProfileLink" value={formData.jobProfileLink} onChange={handleInput}
                          placeholder="https://linkedin.com/in/your-profile (optional)"
                          className={iconInputCls()} />
                      </div>
                    </InputWrapper>
                  </div>
                </div>
              )}

              {/* ── Step 3 ── */}
              {currentStep === 3 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <SectionHeader Icon={Upload} color="emerald" title="Upload Documents" />
                  <div className={`grid gap-4 mb-6 ${formData.experience === "experienced" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                    <FileUploadBox label="Passport Photo" Icon={Camera} accept="image/*"
                      file={files.photo} error={errors.photo}
                      onChange={f => {
                        handleFile("photo", f);
                        setFormData(prev => ({ ...prev, passportPhoto: f.name }));
                      }} />
                    <FileUploadBox label="Resume / CV (Mandatory)" Icon={FileText} accept=".pdf"
                      file={files.resume} error={errors.resume}
                      onChange={f => {
                        handleFile("resume", f);
                        setFormData(prev => ({ ...prev, resumePdf: f.name }));
                      }} />
                    {formData.experience === "experienced" && (
                      <FileUploadBox label="Last Company Salary Slip" Icon={FileText} accept=".pdf,.jpg,.jpeg,.png"
                        file={files.salarySlip} error={errors.salarySlip}
                        onChange={f => {
                          handleFile("salarySlip", f);
                          setFormData(prev => ({ ...prev, salarySlip: f.name }));
                        }} />
                    )}
                  </div>

                  <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                    <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Accepted formats: JPG, PNG for photo · PDF for resume/CV.
                      {formData.experience === "experienced" ? " Salary slip: PDF/JPG/PNG." : ""}
                      Maximum file size: <strong>5 MB</strong> per file.
                    </p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name="acceptTerms"
                      checked={formData.acceptTerms} onChange={handleInput}
                      className="mt-0.5 w-4 h-4 accent-blue-600 rounded" />
                    <span className="text-sm text-slate-600">
                      I agree to the <Link href="/terms" className="text-blue-600 underline">Terms &amp; Conditions</Link> and confirm that all information and documents provided are accurate and genuine. I understand that providing false information may lead to disqualification.
                    </span>
                  </label>
                  <FieldError msg={errors.acceptTerms} />
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                {currentStep > 1 ? (
                  <button type="button" onClick={goBack}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                ) : <div />}

                <button type="button" onClick={currentStep < 3 ? advanceStep : handleSubmitApplication}
                  disabled={submitting || (currentStep === 3 ? !formData.acceptTerms : false)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {currentStep < 3 ? (
                    <><span>Next Step</span><ChevronRight className="w-4 h-4" /></>
                  ) : (
                    <>
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <><CheckCircle className="w-4 h-4" /><span>Submit Application</span></>
                      )}
                    </>
                  )}
                </button>

              </div>
            </div>

            {/* ── Sidebar ── */}
            <aside className="space-y-5">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sticky top-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wide">
                  Application Summary
                </h3>
                <ul className="space-y-3">
                  {[
                    { label: "Personal Info",       done: !!(formData.name && formData.email && formData.phone) },
                    { label: "Professional Details", done: !!(formData.experience && formData.positionApplied) },
                    { label: "Documents",            done: formData.experience === "experienced" ? !!(files.photo && files.resume && files.salarySlip) : !!(files.photo && files.resume) },
                  ].map(item => (
                    <li key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{item.label}</span>
                      {item.done
                        ? <CheckCircle className="w-4 h-4 text-green-500" />
                        : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                    </li>
                  ))}
                </ul>
                <hr className="my-4 border-slate-100" />

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <Lock className="w-3.5 h-3.5" />
                  Your data is encrypted &amp; secure.
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ════════════════════ PAYMENT PHASE ════════════════════ */}
        {phase === "payment" && (
          <div className="max-w-2xl mx-auto space-y-6">

            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-900">Application Received</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Summary</h3>
              <dl className="space-y-2 text-sm">
                {[
                  { label: "Applicant Name", value: formData.name },
                  { label: "Position",       value: positionLabel },
                  { label: "Experience",     value: formData.experience === "fresher" ? "Fresher (0–1 yr)" : "Experienced (2+ yrs)" },
                  { label: "Contact",        value: formData.phone },
                ].map(r => (
                  <div key={r.label} className="flex justify-between">
                    <dt className="text-slate-500">{r.label}</dt>
                    <dd className="font-medium text-slate-800">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <form onSubmit={(event) => handlePayment(event)} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-700" />
                </div>
                <h3 className="font-semibold text-slate-800">Select Payment Method</h3>
              </div>

              <div className="space-y-3">
                {PAYMENT_METHODS.map(({ id, label, description, Icon }) => (
                  <label key={id}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all
                      ${paymentMethod === id
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-400"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`}>
                    <input type="radio" name="paymentMethod" value={id}
                      checked={paymentMethod === id}
                      onChange={e => { setPaymentMethod(e.target.value); setPayErrors(""); }}
                      className="accent-blue-600" />
                    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{label}</p>
                      <p className="text-xs text-slate-500">{description}</p>
                    </div>
                  </label>
                ))}
              </div>

              {payErrors && (
                <p className="flex items-center gap-1.5 text-xs text-red-600">
                  <XCircle className="w-3.5 h-3.5" /> {payErrors}
                </p>
              )}

              <button type="submit"
                className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm mt-1">
                <Lock className="w-4 h-4" />
                Pay ₹{TOTAL.toFixed(2)} Securely
              </button>

              <p className="text-center text-xs text-slate-400">
                256-bit SSL encrypted · You'll receive a confirmation email after payment.
              </p>
            </form>

            <button type="button" onClick={goBack}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-700 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Edit application
            </button>
          </div>
        )}

        {/* ════════════════════ SUCCESS PHASE ════════════════════ */}
        {phase === "success" && (
          <div className="max-w-xl mx-auto text-center py-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Payment Successful!</h2>
            <p className="text-slate-500 text-base mb-2">
              Thank you, <strong>{formData.name}</strong>. Your application is confirmed.
            </p>


            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-0 text-left mb-8">
              <h3 className="font-semibold text-blue-900 mb-3 text-sm">What happens next?</h3>
              <ul className="space-y-2.5 text-sm text-blue-800">
                {[
                  "Our recruitment team will review your application within 48 hours.",
                  "Shortlisted candidates will receive interview details via email.",
                  "Keep your original documents ready for verification.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/"
                className="px-7 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors text-sm">
                Return to Home
              </Link>
              <button onClick={() => window.print()}
                className="px-7 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition-colors text-sm">
                Print Receipt
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

