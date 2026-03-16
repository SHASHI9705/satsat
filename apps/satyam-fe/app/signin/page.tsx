"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Phone, User, Shield, CheckCircle, ArrowRight } from "lucide-react";

const LoginPage: React.FC = () => {
	const router = useRouter();
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [otp, setOtp] = useState("");
	const [isOtpSent, setIsOtpSent] = useState(false);
	const [error, setError] = useState("");

	const handleLogin = async () => {
		setError("");

		if (!name.trim()) {
			setError("Please enter your full name.");
			return;
		}

		if (!/^\d{10}$/.test(phone)) {
			setError("Please enter a valid 10-digit mobile number.");
			return;
		}

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login/request-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
          name,
					phone: `+91${phone}`,
				}),
			});
			if (response.ok) {
				setIsOtpSent(true);
				alert("OTP sent successfully!");
			} else {
				alert("Failed to send OTP. Please try again.");
			}
		} catch (error) {
			console.error("Error sending OTP:", error);
			alert("Failed to send OTP. Please try again.");
		}
	};

	const handleOtpConfirm = async () => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login/verify-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					phone: `+91${phone}`,
					otp,
				}),
			});
			if (response.ok) {
				alert("Login successful!");
				router.push("/");
			} else {
				alert("Invalid OTP. Please try again.");
			}
		} catch (error) {
			console.error("Error verifying OTP:", error);
			alert("Invalid OTP. Please try again.");
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
			<div
				className="absolute inset-0 opacity-5 pointer-events-none"
				style={{
					backgroundImage:
						"radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
					backgroundSize: "36px 36px",
				}}
			/>

			<div className="absolute -top-16 -left-16 w-64 h-64 bg-purple-500 rounded-full opacity-10 blur-3xl pointer-events-none" />
			<div className="absolute -bottom-12 -right-12 w-56 h-56 bg-yellow-400 rounded-full opacity-10 blur-3xl pointer-events-none" />

			<div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative z-10">
				{!isOtpSent ? (
					<>
						<div className="flex items-center gap-3 mb-7">
							<div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
								<Image
									src="/logo.png"
									alt="Satyam Careers"
									width={40}
									height={40}
									className="w-full h-full object-cover"
								/>
							</div>
							<div>
								<p className="font-semibold text-slate-900 leading-tight">
									Satyam Careers
								</p>
								<p className="text-xs text-slate-400">
									Financial Recruitment Platform
								</p>
							</div>
						</div>

						<div className="mb-6">
							<span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full mb-2">
								<span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
								Login
							</span>
							<h1 className="text-xl font-bold text-slate-900 mb-1">Welcome back</h1>
							<p className="text-sm text-slate-500">
								Enter your details to continue
							</p>
						</div>

						<div className="mb-4">
							<label className="block text-xs font-medium text-slate-500 mb-1.5">
								Full Name
							</label>
							<div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 h-12 focus-within:border-blue-500 transition-colors">
								<User size={15} className="text-slate-400 shrink-0" />
								<div className="w-px h-5 bg-slate-200 shrink-0" />
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Enter your full name"
									className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
								/>
							</div>
						</div>

						<div className="mb-5">
							<label className="block text-xs font-medium text-slate-500 mb-1.5">
								Mobile Number
							</label>
							<div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 h-12 focus-within:border-blue-500 transition-colors">
								<span className="text-lg leading-none">🇮🇳</span>
								<div className="w-px h-5 bg-slate-200 shrink-0" />
								<span className="text-sm text-slate-500 font-medium shrink-0">+91</span>
								<input
									type="tel"
									inputMode="numeric"
									maxLength={10}
									value={phone}
									onChange={(e) =>
										setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
									}
									placeholder="10-digit mobile number"
									className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
								/>
							</div>
						</div>

						{error && <p className="text-xs text-red-500 mb-3 -mt-2">{error}</p>}

						<button
							onClick={handleLogin}
							className="w-full h-12 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
						>
							<Phone size={15} />
							Login &amp; Continue
							<ArrowRight size={15} />
						</button>
					</>
				) : (
					<>
						<h1 className="text-xl font-bold text-slate-900 mb-1">Enter OTP</h1>
						<p className="text-sm text-slate-500 mb-4">
							We have sent an OTP to your mobile number.
						</p>
						<div className="mb-5">
							<label className="block text-xs font-medium text-slate-500 mb-1.5">
								OTP
							</label>
							<input
								type="text"
								value={otp}
								onChange={(e) => setOtp(e.target.value)}
								placeholder="Enter the 4-digit OTP"
								className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<button
							onClick={handleOtpConfirm}
							className="w-full h-12 rounded-xl bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
						>
							Confirm OTP
						</button>
					</>
				)}
			</div>
		</div>
	);
};

export default LoginPage;
