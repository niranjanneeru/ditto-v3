import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { AllyLogo, Close } from "@assets";
import type { LoginPopupProps } from "@types";

export const LoginPopup: React.FC<LoginPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onSendOtpTrigger,
}) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isOtp, setIsOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const generateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await onSendOtpTrigger(email);
    if (response?.data) {
      setIsOtp(true);
      setResendCountdown(10);
    }
  };

  const handleSubmitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length === 4) {
      onSubmit({ otp: otpString, email });
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 3) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    if (resendCountdown === 0) {
      setResendCountdown(10);
      // Here you would typically call an API to resend the code
    }
  };

  const handleBackToEmail = () => {
    setIsOtp(false);
    setOtp(["", "", "", ""]);
    setResendCountdown(0);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderEmailInput = () => {
    return (
      <motion.div
        className="bg-white rounded-lg p-4 sm:p-6 md:p-8 max-w-sm sm:max-w-md w-full shadow-xl relative"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close warning"
        >
          <img src={Close} alt="close" className="w-6 h-6" />
        </button>

        {/* Header with Logo */}
        <div className="flex items-center mb-4 sm:mb-6">
          <img className="h-8 sm:h-10 md:h-[40px] w-auto" src={AllyLogo} alt="Ally Learn Logo" />
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-replay text-gray-900 mb-6 sm:mb-8">
          Login to start simulation
        </h1>

        {/* Form */}
        <form onSubmit={generateOtp} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 text-black bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 sm:py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
          >
            Next
          </button>
        </form>

        {/* Terms Footer */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            By tapping next, you agree to Ally&apos;s{" "}
            <a href="#" className="text-blue-600 underline hover:text-blue-700">
              Terms & Conditions
            </a>{" "}
            and acknowledge{" "}
            <a
              href="https://helloally.ai/privacy-policy"
              className="text-blue-600 underline hover:text-blue-700"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </motion.div>
    );
  };

  const renderOtpInput = () => {
    return (
      <motion.div
        className="bg-white rounded-lg p-4 sm:p-6 md:p-8 max-w-sm sm:max-w-md w-full shadow-xl relative"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Back Button */}
        <button
          onClick={handleBackToEmail}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          aria-label="Go back"
        >
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Header with Logo */}
        <div className="flex items-center mb-4 sm:mb-6 pt-8">
          <img className="h-8 sm:h-10 md:h-[40px] w-auto" src={AllyLogo} alt="Ally Learn Logo" />
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-replay text-gray-900 mb-2 sm:mb-3">
          Verify your email address
        </h1>

        {/* Instructions */}
        <p className="text-sm sm:text-base text-gray-700 mb-6 sm:mb-8">
          Enter the code sent to <span className="font-semibold text-gray-900">{email}</span>
        </p>

        {/* OTP Input Fields */}
        <div className="flex justify-start gap-5 mb-6 sm:mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => {
                otpInputRefs.current[index] = el;
              }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(index, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(index, e)}
              className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-black"
              placeholder="-"
            />
          ))}
        </div>

        {/* Resend Code */}
        <div className="text-left mb-6 sm:mb-8">
          <span className="text-sm sm:text-base text-gray-700">Didn&apos;receive the code? </span>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendCountdown > 0}
            className={`text-sm sm:text-base ${
              resendCountdown > 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:text-blue-700 underline"
            }`}
          >
            Resend {resendCountdown > 0 && `(${resendCountdown}s)`}
          </button>
        </div>

        {/* Verify Button */}
        <form onSubmit={handleSubmitOtp}>
          <button
            type="submit"
            disabled={otp.join("").length !== 4}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
          >
            Verify
          </button>
        </form>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {isOtp ? renderOtpInput() : renderEmailInput()}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
