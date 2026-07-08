"use client";

import React, { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiMessageSquare } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Message sent successfully! We will get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (e) {
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-3">Contact Us</h1>
        <p className="text-text-secondary">
          Have questions about vehicle compatibility, shipping, or returns? Get in touch with our team of EV specialists.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Contact Info Cards */}
        <div className="space-y-4 md:col-span-1">
          <div className="bg-surface border border-border rounded-xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
              <FiPhone size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-text-primary text-sm">Call Support</h4>
              <p className="text-sm text-text-secondary mt-1">+91 98765 43210</p>
              <p className="text-xs text-text-muted mt-0.5">Mon - Sat, 9 AM - 6 PM</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
              <FiMail size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-text-primary text-sm">Email Inquiries</h4>
              <p className="text-sm text-text-secondary mt-1">support@scootfix.com</p>
              <p className="text-xs text-text-muted mt-0.5">Response within 24 hours</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
              <FiMapPin size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-text-primary text-sm">Headquarters</h4>
              <p className="text-sm text-text-secondary mt-1">123 Tech Park, HSR Layout,</p>
              <p className="text-sm text-text-secondary">Bengaluru, Karnataka - 560102</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-surface border border-border rounded-xl p-6 md:col-span-2">
          <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <FiMessageSquare className="text-primary" /> Send us a Message
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary uppercase">Your Name</label>
                <Input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary uppercase">Email Address</label>
                <Input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  required 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase">Subject</label>
              <Input 
                type="text" 
                value={formData.subject} 
                onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary uppercase block">Message</label>
              <textarea
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                className="w-full p-3 bg-surface border border-border rounded-md text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <Button type="submit" className="w-full h-12 shadow-glow" isLoading={isLoading}>
              Send Inquiry
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}
