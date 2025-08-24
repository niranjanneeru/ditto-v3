import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  MessageSquare,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import * as XLSX from "xlsx";

import { Header } from "@components";
import { APP_ROUTES } from "@constants";

interface LeadData {
  name: string;
  email: string;
  phone?: string;
}

interface UploadStep {
  xlsxFile: File | null;
  leads: LeadData[];
}

interface MessageStep {
  message: string;
  channel: "whatsapp" | "email" | "sms";
}

type Step = "upload" | "message" | "confirmation";

export const ImportLeads: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [uploadStep, setUploadStep] = useState<UploadStep>({
    xlsxFile: null,
    leads: [],
  });
  const [messageStep, setMessageStep] = useState<MessageStep>({
    message: "",
    channel: "whatsapp",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to test API endpoints when channel is selected
  const testChannelEndpoint = async (channel: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/leads/${channel}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            content: "",
          }),
        },
      );

      if (response.ok) {
        console.log(`✅ ${channel.toUpperCase()} endpoint test successful`);
      } else {
        console.log(
          `❌ ${channel.toUpperCase()} endpoint test failed: ${response.status}`,
        );
      }
    } catch (error) {
      console.error(`Error testing ${channel} endpoint:`, error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      (file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.name.endsWith(".xlsx"))
    ) {
      setUploadStep((prev) => ({ ...prev, xlsxFile: file }));
    }
  };

  const processXLSX = async () => {
    if (!uploadStep.xlsxFile) return;

    setIsProcessing(true);

    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append("file", uploadStep.xlsxFile);

      // Make API call to bulk-insert endpoint
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/leads/bulk-insert`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Bulk insert result:", result);

      // Process the XLSX file locally for preview
      const arrayBuffer = await uploadStep.xlsxFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const leads: LeadData[] = jsonData
        .slice(1) // Skip header row
        .filter((row: any) => row && row.length >= 2)
        .map((row: any) => ({
          name: String(row[0] || "").trim(),
          email: String(row[1] || "").trim(),
          phone: row[2] ? String(row[2]).trim() : "",
        }))
        .filter((lead) => lead.name && lead.email);

      setUploadStep((prev) => ({ ...prev, leads }));
      setCurrentStep("message");
    } catch (error) {
      console.error("Error processing CSV:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);

    try {
      // Determine the correct API endpoint based on the selected channel
      let endpoint = "";
      switch (messageStep.channel) {
        case "sms":
          endpoint = "sms";
          break;
        case "whatsapp":
          endpoint = "whatsapp";
          break;
        case "email":
          endpoint = "email";
          break;
        default:
          endpoint = "sms";
      }

      // Make API call to the specific channel endpoint
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/leads/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            content: messageStep.message,
            leads: uploadStep.leads,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Send ${messageStep.channel} messages result:`, result);

      setCurrentStep("confirmation");
    } catch (error) {
      console.error("Error sending messages:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsProcessing(false);
    }
  };

  const renderUploadStep = () => (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-10 h-10 text-gray-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Import Leads
        </h2>
        <p className="text-gray-600">
          Upload a XLSX file containing your leads information
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 hover:border-gray-400 transition-colors">
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileUpload}
          className="hidden"
          id="xlsx-upload"
        />
        <label
          htmlFor="xlsx-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <FileText className="w-12 h-12 text-gray-400 mb-4" />
          <span className="text-gray-600 mb-2">
            {uploadStep.xlsxFile
              ? uploadStep.xlsxFile.name
              : "Click to select XLSX file"}
          </span>
          <span className="text-sm text-gray-500">
            {uploadStep.xlsxFile ? "File selected" : "or drag and drop"}
          </span>
        </label>
      </div>

      {uploadStep.xlsxFile && (
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-medium text-gray-900 mb-2">File Details:</h3>
            <p className="text-sm text-gray-600">
              Name: {uploadStep.xlsxFile.name}
            </p>
            <p className="text-sm text-gray-600">
              Size: {(uploadStep.xlsxFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
      )}

      <button
        onClick={processXLSX}
        disabled={!uploadStep.xlsxFile || isProcessing}
        className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? "Processing..." : "Process XLSX"}
      </button>
    </div>
  );

  const renderMessageStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-10 h-10 text-gray-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Compose Message
        </h2>
        <p className="text-gray-600">
          {uploadStep.leads.length} leads will receive your message
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Content
          </label>
          <textarea
            value={messageStep.message}
            onChange={(e) =>
              setMessageStep((prev) => ({ ...prev, message: e.target.value }))
            }
            placeholder="Enter your message here..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Channel
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "whatsapp", label: "WhatsApp", icon: "💬" },
              { value: "email", label: "Email", icon: "📧" },
              { value: "sms", label: "SMS", icon: "📱" },
            ].map((channel) => (
              <button
                key={channel.value}
                onClick={() => {
                  setMessageStep((prev) => ({
                    ...prev,
                    channel: channel.value as any,
                  }));
                  // Test the API endpoint when channel is selected
                  testChannelEndpoint(channel.value);
                }}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  messageStep.channel === channel.value
                    ? "border-black bg-black text-white"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                <div className="text-2xl mb-2">{channel.icon}</div>
                <div className="text-sm font-medium">{channel.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={() => setCurrentStep("upload")}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={!messageStep.message.trim() || isProcessing}
            className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? "Sending..." : "Send Messages"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Sent Successfully
        </h2>
        <p className="text-gray-600">
          Your message has been sent to {uploadStep.leads.length} leads via{" "}
          {messageStep.channel}
        </p>
      </div>

      <button
        onClick={() => navigate(APP_ROUTES.HOME)}
        className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        Return to Home
      </button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "upload":
        return renderUploadStep();
      case "message":
        return renderMessageStep();
      case "confirmation":
        return renderConfirmationStep();
      default:
        return renderUploadStep();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          {currentStep !== "confirmation" && (
            <button
              onClick={() => navigate(APP_ROUTES.HOME)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          )}

          {/* Step Content */}
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};
