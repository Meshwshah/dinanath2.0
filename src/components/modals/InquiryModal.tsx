import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import type { PlotData } from '../../types/masterplan';
import { SITE } from '../../data/siteConfig';
import { IconX, IconWhatsApp, IconPhone, IconCheck } from '../common/Icons';

interface InquiryModalProps {
  plot: PlotData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  plot,
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const [buyerName, setBuyerName] = useState('');
  const [buyerCompany, setBuyerCompany] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !plot) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#38bdf8', '#f59e0b'],
    });

    setIsSubmitted(true);
    onSuccessToast(`Inquiry for ${plot.label} submitted! Opening WhatsApp...`);

    // Prepare WhatsApp message
    const cleanPhone = SITE.contactPhone.replace(/[^0-9]/g, '');
    let msg = `*DINANATH INDUSTRIAL PARK INQUIRY*\n\n`;
    msg += `Plot Interested: *${plot.label}* (${plot.zone} Zone)\n`;
    msg += `Area: ${plot.areaSmt.toFixed(2)} SMT / ${plot.areaSft.toFixed(2)} SFT\n`;
    msg += `Dimensions: ${plot.dimensions.label}\n`;
    msg += `Road Frontage: ${plot.roadFrontage}\n`;
    if (buyerName) msg += `Name: ${buyerName}\n`;
    if (buyerCompany) msg += `Company: ${buyerCompany}\n`;
    if (buyerPhone) msg += `Phone: ${buyerPhone}\n`;
    if (note) msg += `Message: ${note}\n`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

    setTimeout(() => {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      onClose();
      setIsSubmitted(false);
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-950/95 border border-white/15 p-6 sm:p-8 text-white shadow-2xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <IconX size={18} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Priority Booking & Inquiry
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Inquire About {plot.label}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Connect directly with developer {SITE.client} for site visit and quote.
          </p>
        </div>

        {/* Selected Plot Summary Strip */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 mb-5 flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-white">{plot.label} • {plot.zone} Zone</div>
            <div className="text-slate-400 font-mono text-[11px]">{plot.dimensions.label}</div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-cyan-400">{plot.areaSmt.toFixed(2)} SMT</div>
            <div className="font-mono text-amber-400 text-[11px]">{plot.areaSft.toFixed(2)} SFT</div>
          </div>
        </div>

        {/* Inquiry Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Your Name / Contact Person *
            </label>
            <input
              type="text"
              required
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="e.g. Ramesh Patel"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 text-white placeholder-slate-500 text-xs outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Company / Business Name
              </label>
              <input
                type="text"
                value={buyerCompany}
                onChange={(e) => setBuyerCompany(e.target.value)}
                placeholder="e.g. Patel Industries"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 text-white placeholder-slate-500 text-xs outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone / WhatsApp Number *
              </label>
              <input
                type="tel"
                required
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="+91 98..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 text-white placeholder-slate-500 text-xs outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Requirements or Site Visit Preferred Date
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Looking for chemical shed setup, want site inspection this Saturday..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 text-white placeholder-slate-500 text-xs outline-none transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitted}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitted ? (
              <>
                <IconCheck size={16} />
                <span>Opening WhatsApp Chat...</span>
              </>
            ) : (
              <>
                <IconWhatsApp size={16} />
                <span>Send WhatsApp Inquiry Now</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <a
            href={`tel:${SITE.contactPhone}`}
            className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <IconPhone size={13} />
            <span>Or speak directly: <strong>{SITE.contactPhone}</strong></span>
          </a>
        </div>
      </div>
    </div>
  );
};
