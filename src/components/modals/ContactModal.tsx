import React, { useState } from 'react';
import { SITE, whatsappInquiryUrl } from '../../data/siteConfig';
import { IconX, IconWhatsApp, IconPhone, IconCheck } from '../common/Icons';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(SITE.contactPhone.replace(/\s+/g, ''));
    setCopied(true);
    onSuccessToast?.('Phone number copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCall = () => {
    window.location.href = `tel:${SITE.contactPhone.replace(/\s+/g, '')}`;
  };

  const handleWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = SITE.contactPhone.replace(/[^0-9]/g, '');
    let text = `Hello, I am interested in purchasing a plot at Dinanath Industrial Park. Please share the available plot sizes, pricing, location details, amenities, and payment options. I would also like to know the site visit availability.`;

    const details: string[] = [];
    if (name.trim()) details.push(`Name: ${name.trim()}`);
    if (phone.trim()) details.push(`Phone: ${phone.trim()}`);
    if (message.trim()) details.push(`Additional Note: ${message.trim()}`);

    if (details.length > 0) {
      text += `\n\n*Buyer Details:*\n` + details.join('\n');
    }

    text += `\n\nThank you.`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-[#181818] border border-white/15 p-6 sm:p-8 text-white shadow-2xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <IconX size={18} />
        </button>

        <div className="flex items-start justify-between gap-3 mb-6 pr-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Direct Developer Access
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Contact Developer
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Get in touch directly with Maitri Developers for site visits, brochures, pricing, and bookings.
            </p>
          </div>
          <div className="h-12 w-auto px-2 py-1 rounded-xl bg-white shadow-md border border-white/20 shrink-0 flex items-center justify-center">
            <img src={`${import.meta.env.BASE_URL}maitri-logo.png`} alt="Maitri Developers" className="h-full w-auto object-contain" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#242424] to-[#1c1c1c] border border-white/10 mb-5">
          <div className="text-[11px] text-slate-400 font-medium mb-1">Official Sales & Inquiry Line</div>
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-black font-mono tracking-wide text-white">
              {SITE.contactPhone}
            </span>
            <button
              onClick={handleCopyPhone}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              {copied ? <IconCheck size={14} className="text-emerald-400" /> : null}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={handleCall}
              className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
            >
              <IconPhone size={16} />
              <span>Call Now</span>
            </button>
            <a
              href={whatsappInquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <IconWhatsApp size={16} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <form onSubmit={handleWhatsApp} className="space-y-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-medium">Your Name</label>
            <input
              type="text"
              placeholder="e.g. Ketan Shah"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-medium">Phone Number</label>
            <input
              type="tel"
              placeholder="+91 6354 045 409"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-medium">Message / Requirement</label>
            <textarea
              rows={2}
              placeholder="Interested in plot sizes, pricing, and site visit timing..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
          >
            <IconWhatsApp size={16} />
            <span>Send WhatsApp Message</span>
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Site: Dinanath Industrial Park, Manglej–Kashipura Road, Near Inland Atomize Metal Powder LLP, Manglej, Karjan, Gujarat 391243
          </p>
        </div>
      </div>
    </div>
  );
};
