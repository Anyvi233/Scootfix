"use client";

import React, { useState } from "react";
import { FiPlus, FiMinus, FiHelpCircle } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

const MOCK_FAQS = [
  {
    question: "How do I verify if a part is compatible with my EV model?",
    answer: "Every product page includes a 'Compatibility' tab detailing specific brands, models, and model years. You can also filter our catalog by choosing your specific electric scooter on the Shop page sidebar."
  },
  {
    question: "Do you supply official OEM parts?",
    answer: "Yes! We list both OEM (Original Equipment Manufacturer) genuine spare parts and premium aftermarket components. Products are clearly tagged with badges designating their source so you can buy with confidence."
  },
  {
    question: "What is your return policy?",
    answer: "ScootFix offers a 10-day return policy on all unused products in their original packaging. If you accidentally ordered the wrong part or are not satisfied, you can request a return from your account's order page."
  },
  {
    question: "How long does shipping take?",
    answer: "Most orders are processed within 24 hours. Transit times vary from 2 to 5 business days depending on your location. We ship across India from our primary warehouse in Bengaluru."
  },
  {
    question: "What warranty do you offer on lithium-ion batteries?",
    answer: "Our PowerCore batteries carry a 3-year manufacturer warranty covering capacity degradation and BMS malfunctions. Check the specific warranty information listed on each battery page for details."
  }
];

function FaqItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-border rounded-xl bg-surface overflow-hidden transition-colors">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left p-5 focus:outline-none"
      >
        <span className="font-semibold text-text-primary text-base pr-4">{question}</span>
        {isOpen ? <FiMinus className="text-primary shrink-0" size={18} /> : <FiPlus className="text-primary shrink-0" size={18} />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="p-5 pt-0 border-t border-border/50 text-sm text-text-secondary leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-3xl">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-3 flex items-center justify-center gap-2">
          <FiHelpCircle className="text-primary" /> Frequently Asked Questions
        </h1>
        <p className="text-text-secondary">
          Find fast answers to common questions about parts procurement, compatibility, orders, and shipping rules.
        </p>
      </div>

      <div className="space-y-4">
        {MOCK_FAQS.map((faq, index) => (
          <FaqItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </div>
  );
}
