import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { APP_ROUTES, LOCAL_STORAGE_KEYS } from "@constants";
import { Avatar } from "@assets";
import { LoginPopup, ProfilePopup } from "@components";
import { sendOtp, verifyOtp, logout } from "@api";

interface HeaderProps {
  isShowProfile?: boolean;
  disableIconClick?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isShowProfile = true,
  disableIconClick = false,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [openLoginPopup, setOpenLoginPopup] = useState(false);
  const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  const userName = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_NAME) || "";
  const navigate = useNavigate();

  const openProfilePopup = () => {
    if (accessToken) {
      setIsProfileOpen(true);
    } else {
      setOpenLoginPopup(true);
    }
  };

  const handleLogout = async () => {
    const response = await logout();
    if (response?.data) {
      toast.success("Logged out successfully");
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_NAME);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ROOM_DATA);
      setIsProfileOpen(false);
      navigate(APP_ROUTES.HOME);
    } else {
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleOtpGeneration = async (email: string) => {
    const response = await sendOtp({ email });
    if (!response?.data) {
      const errorMessage = response?.error?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
    }
    return response;
  };

  const handleLogin = async ({ email, otp }: { email: string; otp: string }) => {
    const response = await verifyOtp({ email, otp });

    console.log({ response });
    if (response?.data) {
      setOpenLoginPopup(false);
      // onLoginSuccess();
    } else {
      const errorMessage = response?.error?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="relative w-full pt-[76px] sm:pt-[98px]">
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 flex flex-row items-center justify-between w-full sm:p-[24px] p-[12px] border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center gap-8">
          <div
            onClick={() => !disableIconClick && navigate(APP_ROUTES.HOME)}
            className="sm:pl-[16px] pl-[6px] cursor-pointer group"
            aria-level={1}
          >
            <span className="text-2xl font-bold text-gray-900 group-hover:text-black transition-all duration-300">
              SalesAI
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-gray-900 font-medium border-b-2 border-black pb-1 relative group">
              Dashboard
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-black transform scale-x-100 transition-transform duration-300"></div>
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium relative group transition-colors duration-200">
              Campaigns
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium relative group transition-colors duration-200">
              Analytics
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </a>
          </nav>
        </div>
        {isShowProfile && (
          <div className="flex items-center gap-4">
            <button className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 relative group">
              <span className="text-xl group-hover:scale-110 transition-transform duration-200 inline-block">🔔</span>
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </button>
            <div 
              onClick={openProfilePopup} 
              className="justify-end cursor-pointer hover:scale-105 transition-transform duration-200 rounded-full overflow-hidden border-2 border-transparent hover:border-gray-300"
            >
              <img src={Avatar} alt="user avatar" className="sm:h-[44px] h-[38px] w-auto" />
            </div>
          </div>
        )}
      </div>
      {isProfileOpen && (
        <ProfilePopup
          userName={userName}
          onLogout={handleLogout}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
      <LoginPopup
        isOpen={openLoginPopup}
        onSubmit={handleLogin}
        onSendOtpTrigger={handleOtpGeneration}
        onClose={() => setOpenLoginPopup(false)}
      />
    </div>
  );
};
