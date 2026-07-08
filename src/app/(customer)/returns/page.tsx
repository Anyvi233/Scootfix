"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiCornerUpLeft, FiCheckCircle, FiFileText } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-hot-toast";

const RETURN_REASONS = [
  "Defective or does not work",
  "Incompatible with my vehicle",
  "Incorrect item received",
  "Item damaged in transit",
  "No longer needed / changed mind",
];

function ReturnsForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryOrderId = searchParams.get("orderId") || "";
  const queryItem = searchParams.get("item") || "";

  const [orderId, setOrderId] = useState(queryOrderId);
  const [itemName, setItemName] = useState(queryItem);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !itemName || !reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API submit
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
      toast.success("Return request submitted!");
    } catch (e) {
      toast.error("Failed to submit return request");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 text-success">
          <FiCheckCircle size={44} />
        </div>
        <h1 className="text-3xl font-display font-bold text-text-primary mb-3">Return Request Filed</h1>
        <p className="text-text-secondary mb-8">
          Your request has been registered. Our support team will review it and send a return shipping label to your email within 24-48 hours.
        </p>
        <Button onClick={() => router.push("/orders")} className="w-full">
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-xl">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-2 flex items-center gap-2">
        <FiCornerUpLeft className="text-primary" /> Request a Return
      </h1>
      <p className="text-text-secondary mb-8">
        ScootFix offers hassle-free 10-day returns on all unused EV spare parts and accessories.
      </p>

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-6">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary uppercase">Order ID</label>
          <Input 
            type="text" 
            placeholder="SF-XXXXXX" 
            value={orderId} 
            onChange={(e) => setOrderId(e.target.value)} 
            required 
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary uppercase">Item Name</label>
          <Input 
            type="text" 
            placeholder="e.g. Brake Pads Set" 
            value={itemName} 
            onChange={(e) => setItemName(e.target.value)} 
            required 
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary uppercase block">Reason for Return</label>
          <select 
            value={reason} 
            onChange={(e) => setReason(e.target.value)}
            className="w-full h-11 px-3 bg-surface border border-border rounded-md text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          >
            <option value="" disabled>Select a reason...</option>
            {RETURN_REASONS.map((r, i) => (
              <option key={i} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary uppercase block">Additional Comments (Optional)</label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Please provide any details that can help us verify the issue..."
            className="w-full p-3 bg-surface border border-border rounded-md text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 shadow-glow" 
          isLoading={isLoading}
        >
          Submit Return Request
        </Button>
      </form>
    </div>
  );
}

export default function ReturnsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-text-secondary mt-4">Loading return form...</p>
      </div>
    }>
      <ReturnsForm />
    </Suspense>
  );
}
