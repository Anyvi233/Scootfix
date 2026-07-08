"use client";

import React from "react";
import { FaWhatsapp } from "react-icons/fa";

export function WhatsAppWidget() {
  const handleClick = () => {
    const message = "Hi Scootfix EV, I would like to contact you regarding EV spare parts & chargers.";
    window.open(`https://wa.me/919744727070?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center group">
      {/* Tooltip Label */}
      <span className="hidden sm:inline-block mr-3 px-3 py-1.5 bg-surface border border-border text-text-primary text-xs font-semibold rounded-lg shadow-lg opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap">
        Chat with Us
      </span>

      {/* Floating Button */}
      <button
        onClick={handleClick}
        className="w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(37,211,102,0.4)] hover:shadow-[0_8px_30px_rgb(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 relative border border-white/10"
        aria-label="Contact us on WhatsApp"
      >
        {/* Pulsing Outer Ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none scale-105" />
        <FaWhatsapp size={28} />
      </button>
    </div>
  );
}
