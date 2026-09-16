import React, { useState, useEffect, useRef } from 'react';
import type { PlotData, PlotStatus } from '../../types/masterplan';
import { adminStore } from '../../services/adminStore';
import type { GalleryPhoto } from '../../data/galleryPhotos';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlotsUpdated?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onPlotsUpdated,
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Active Tab: 'plots' | 'gallery' | 'settings'
  const [activeTab, setActiveTab] = useState<'plots' | 'gallery' | 'settings'>('plots');

  // Plots Management state
  const [plots, setPlots] = useState<PlotData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedPlotIds, setSelectedPlotIds] = useState<string[]>([]);

  // Gallery state
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [newPhotoTitle, setNewPhotoTitle] = useState<string>('');
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [newPhotoCategory, setNewPhotoCategory] = useState<string>('Site Progress');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Settings state
  const [currentPinInput, setCurrentPinInput] = useState<string>('');
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [confirmPinInput, setConfirmPinInput] = useState<string>('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Success toast inside admin
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Sync data from adminStore
  const refreshData = () => {
    setPlots(adminStore.getPlots());
    setGalleryPhotos(adminStore.getGalleryPhotos());
    setIsAuthenticated(adminStore.isAuthenticated());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      adminStore.syncWithCloud();
      const unsubscribe = adminStore.subscribe(() => {
        refreshData();
        if (onPlotsUpdated) onPlotsUpdated();
      });
      return unsubscribe;
    }
  }, [isOpen]);

  // Handle Login
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (adminStore.login(pinInput)) {
      setIsAuthenticated(true);
      setPinError('');
      setPinInput('');
      refreshData();
      showToast('Logged in as Administrator');
    } else {
      setPinError('Invalid PIN. Please try again.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    adminStore.logout();
    setIsAuthenticated(false);
    showToast('Logged out');
  };

  // Plot Status update
  const handleStatusChange = (plotId: string, newStatus: PlotStatus) => {
    adminStore.updatePlotStatus(plotId, newStatus);
    showToast(`Plot status updated to ${newStatus.toUpperCase()}`);
    if (onPlotsUpdated) onPlotsUpdated();
  };

  // Bulk status update
  const handleBulkStatus = (status: PlotStatus) => {
    if (selectedPlotIds.length === 0) return;
    adminStore.bulkUpdatePlotStatus(selectedPlotIds, status);
    showToast(`Updated ${selectedPlotIds.length} plots to ${status.toUpperCase()}`);
    setSelectedPlotIds([]);
    if (onPlotsUpdated) onPlotsUpdated();
  };

  // Select all filtered plots
  const handleSelectAllFiltered = (filteredIds: string[]) => {
    if (selectedPlotIds.length === filteredIds.length) {
      setSelectedPlotIds([]);
    } else {
      setSelectedPlotIds(filteredIds);
    }
  };

  // File Upload handler for Gallery (uploads directly to Cloudflare R2 bucket)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 25MB for Cloudflare R2)
    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds 25MB limit. Please choose a smaller image.');
      return;
    }

    // Set local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setUploadPreview(objectUrl);

    if (!newPhotoTitle) {
      // Use clean filename without extension as default title
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setNewPhotoTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Upload directly to Cloudflare R2
    setIsUploadingPhoto(true);
    try {
      const { url } = await adminStore.uploadPhoto(file);
      setNewPhotoUrl(url);
      showToast('Photo uploaded to Cloudflare R2!');
    } catch (err: any) {
      console.warn('R2 upload failed, falling back to local encoding:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setNewPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      showToast('Uploaded with local fallback');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Add Photo to Gallery
  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl) {
      alert('Please upload an image or provide an image URL');
      return;
    }

    adminStore.addGalleryPhoto({
      title: newPhotoTitle || 'Dinanath Industrial Park Photo',
      url: newPhotoUrl,
      category: newPhotoCategory,
      description: newPhotoTitle,
    });

    setNewPhotoTitle('');
    setNewPhotoUrl('');
    setUploadPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Photo added to Gallery!');
  };

  // Delete Gallery Photo
  const handleDeletePhoto = (id: string) => {
    if (window.confirm('Delete this photo from the gallery?')) {
      adminStore.deleteGalleryPhoto(id);
      showToast('Photo removed');
    }
  };

  // Change Admin PIN
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStoredPin = adminStore.getPin();
    if (currentPinInput !== currentStoredPin) {
      setPinChangeMsg({ text: 'Current PIN is incorrect', isError: true });
      return;
    }
    if (newPinInput.length < 4) {
      setPinChangeMsg({ text: 'New PIN must be at least 4 digits', isError: true });
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinChangeMsg({ text: 'New PIN and confirmation do not match', isError: true });
      return;
    }

    adminStore.setPin(newPinInput);
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setPinChangeMsg({ text: 'Admin PIN updated successfully!', isError: false });
    showToast('PIN updated successfully');
  };

  // Export Data JSON
  const handleExportData = () => {
    const jsonStr = adminStore.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dinanath-admin-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded');
  };


  if (!isOpen) return null;

  // Filtered Plots
  const filteredPlots = plots.filter(plot => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesNum = plot.number.toString().includes(q);
      const matchesDim = plot.dimensions.label.toLowerCase().includes(q);
      if (!matchesNum && !matchesDim) return false;
    }
    if (statusFilter !== 'all' && plot.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && plot.zone.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    return true;
  });

  // Calculate status counts
  const countAvailable = plots.filter(p => p.status === 'Available').length;
  const countHold = plots.filter(p => p.status === 'On Hold').length;
  const countSold = plots.filter(p => p.status === 'Sold').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#121214] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden text-slate-100 font-sans">
        
        {/* Toast inside modal */}
        {toastMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-500 text-black font-bold text-xs rounded-full shadow-lg animate-bounce">
            ✓ {toastMsg}
          </div>
        )}

        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-[#18181b]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 font-bold">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                  Dinanath 2.0 Admin Portal
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-semibold">
                  LIVE CONTROL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Real-time plot status, photo gallery & leads management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <button
                  onClick={async () => {
                    showToast('Syncing with Cloudflare KV...');
                    await adminStore.syncWithCloud();
                    refreshData();
                    showToast('Cloud Sync Complete!');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                  title="Force Sync with Cloudflare KV"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">Cloud Synced</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 border border-white/10 text-xs font-semibold text-slate-300 transition-all active:scale-95"
                  title="Logout"
                >
                  Logout
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {!isAuthenticated ? (
          /* ========================================================
             1. PIN LOGIN SCREEN
             ======================================================== */
          <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
            <div className="w-full max-w-sm p-6 sm:p-8 rounded-2xl bg-[#1c1c20] border border-white/10 shadow-2xl text-center space-y-5">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-2xl shadow-inner">
                🔒
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Administrator Access</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter master PIN to manage plots & gallery
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value)}
                    placeholder="Enter PIN..."
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 focus:border-cyan-400 text-center text-xl font-mono tracking-widest text-white placeholder:text-slate-600 outline-none transition-all"
                  />
                  {pinError && (
                    <p className="text-xs text-rose-400 mt-1.5 font-medium">{pinError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-sm shadow-lg shadow-cyan-500/25 transition-all active:scale-98 cursor-pointer"
                >
                  Unlock Admin Dashboard
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ========================================================
             2. AUTHENTICATED ADMIN DASHBOARD
             ======================================================== */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            
            {/* Quick Stats Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-2 p-3 sm:px-6 bg-[#18181b]/50 border-b border-white/5 text-xs shrink-0">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Plots</span>
                <span className="text-base font-extrabold text-white">{plots.length}</span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-400 block text-[10px] uppercase font-semibold">Available</span>
                <span className="text-base font-extrabold text-emerald-300">{countAvailable}</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-amber-400 block text-[10px] uppercase font-semibold">On Hold</span>
                <span className="text-base font-extrabold text-amber-300">{countHold}</span>
              </div>
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-rose-400 block text-[10px] uppercase font-semibold">Sold</span>
                <span className="text-base font-extrabold text-rose-300">{countSold}</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 border-b border-white/10 bg-[#141416] shrink-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab('plots')}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'plots'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>🗺️</span>
                <span>Plots Management</span>
              </button>

              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'gallery'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>📸</span>
                <span>Gallery ({galleryPhotos.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>⚙️</span>
                <span>Settings & Cloudflare</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 bg-[#0f0f11]">
              
              {/* TAB 1: PLOTS MANAGEMENT */}
              {activeTab === 'plots' && (
                <div className="space-y-4">
                  {/* Search and Filters Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[#18181c] border border-white/5">
                    <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
                      {/* Search */}
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search plot # (e.g. 12)..."
                        className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 focus:border-cyan-400 text-xs text-white placeholder:text-slate-500 outline-none w-44"
                      />

                      {/* Status Filter */}
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300 outline-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="Available">Available ({countAvailable})</option>
                        <option value="On Hold">On Hold ({countHold})</option>
                        <option value="Sold">Sold ({countSold})</option>
                      </select>

                      {/* Category Filter */}
                      <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300 outline-none"
                      >
                        <option value="all">All Categories</option>
                        <option value="gold">Gold (6,000 - 13,000)</option>
                        <option value="platinum">Platinum (13,000 - 20,000)</option>
                        <option value="diamond">Diamond (20,000+)</option>
                      </select>
                    </div>

                    {/* Reset Button */}
                    <button
                      onClick={() => {
                        if (window.confirm('Reset all plot statuses to original masterplan defaults?')) {
                          adminStore.resetPlots();
                          showToast('Plots reset to defaults');
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 border border-white/10 text-xs font-semibold text-slate-400 transition-all"
                    >
                      Reset Defaults
                    </button>
                  </div>

                  {/* Bulk Actions (shown when items are selected) */}
                  {selectedPlotIds.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs">
                      <span className="font-semibold text-cyan-300">
                        {selectedPlotIds.length} plots selected
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Mark as:</span>
                        <button
                          onClick={() => handleBulkStatus('Available')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/40"
                        >
                          Available
                        </button>
                        <button
                          onClick={() => handleBulkStatus('On Hold')}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/40"
                        >
                          On Hold
                        </button>
                        <button
                          onClick={() => handleBulkStatus('Sold')}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold border border-rose-500/40"
                        >
                          Sold
                        </button>
                        <button
                          onClick={() => setSelectedPlotIds([])}
                          className="ml-2 text-slate-400 hover:text-white"
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Plots Table */}
                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#161619]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-[#1c1c20] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                          <th className="p-3 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={
                                filteredPlots.length > 0 &&
                                selectedPlotIds.length === filteredPlots.length
                              }
                              onChange={() =>
                                handleSelectAllFiltered(filteredPlots.map(p => p.id))
                              }
                              className="rounded border-white/20"
                            />
                          </th>
                          <th className="p-3">Plot #</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Area (SMT)</th>
                          <th className="p-3">Area (Sq.Yd)</th>
                          <th className="p-3">Dimensions</th>
                          <th className="p-3 text-right">Instant Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredPlots.map(plot => {
                          const isSelected = selectedPlotIds.includes(plot.id);
                          return (
                            <tr
                              key={plot.id}
                              className={`transition-colors ${
                                isSelected ? 'bg-cyan-500/10' : 'hover:bg-white/5'
                              }`}
                            >
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    setSelectedPlotIds(prev =>
                                      prev.includes(plot.id)
                                        ? prev.filter(id => id !== plot.id)
                                        : [...prev, plot.id]
                                    );
                                  }}
                                  className="rounded border-white/20"
                                />
                              </td>
                              <td className="p-3 font-mono font-bold text-white text-sm">
                                Plot {plot.number}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                    plot.zone === 'Gold'
                                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                      : plot.zone === 'Platinum'
                                      ? 'bg-pink-500/15 text-pink-300 border border-pink-500/30'
                                      : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                                  }`}
                                >
                                  {plot.zone}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-slate-300">{plot.areaSmt} SMT</td>
                              <td className="p-3 font-mono text-slate-300 font-bold">{Math.round(plot.areaSmt * 1.196)} Sq.Yd</td>
                              <td className="p-3 text-slate-400 font-mono text-[11px]">{plot.dimensions.label}</td>
                              <td className="p-3 text-right">
                                <div className="inline-flex items-center gap-1 p-0.5 rounded-xl bg-black/40 border border-white/10">
                                  <button
                                    onClick={() => handleStatusChange(plot.id, 'Available')}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                      plot.status === 'Available'
                                        ? 'bg-emerald-500 text-black shadow'
                                        : 'text-slate-400 hover:text-emerald-300'
                                    }`}
                                  >
                                    Available
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(plot.id, 'On Hold')}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                      plot.status === 'On Hold'
                                        ? 'bg-amber-500 text-black shadow'
                                        : 'text-slate-400 hover:text-amber-300'
                                    }`}
                                  >
                                    On Hold
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(plot.id, 'Sold')}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                      plot.status === 'Sold'
                                        ? 'bg-rose-500 text-white shadow'
                                        : 'text-slate-400 hover:text-rose-300'
                                    }`}
                                  >
                                    Sold
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: GALLERY MANAGEMENT */}
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  {/* Upload & Add Photo Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#18181c] border border-white/10 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>➕</span>
                      <span>Add New Photo to Gallery</span>
                    </h3>

                    <form onSubmit={handleAddPhoto} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* File Upload Option */}
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-slate-300">
                            Upload from Computer (JPG, PNG, WEBP)
                          </label>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-black hover:file:bg-cyan-400 cursor-pointer"
                          />
                          <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                            ☁️ Uploads directly to Cloudflare R2 cloud storage (dinanathproject3)
                          </p>
                        </div>

                        {/* Image URL Option */}
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-slate-300">
                            Or Enter Image URL
                          </label>
                          <input
                            type="url"
                            value={newPhotoUrl.startsWith('data:') ? '' : newPhotoUrl}
                            onChange={e => {
                              setNewPhotoUrl(e.target.value);
                              setUploadPreview(e.target.value);
                            }}
                            placeholder="https://example.com/site-photo.jpg"
                            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="block text-xs font-semibold text-slate-300">
                            Photo Title / Caption
                          </label>
                          <input
                            type="text"
                            value={newPhotoTitle}
                            onChange={e => setNewPhotoTitle(e.target.value)}
                            placeholder="e.g., Road work near Plot 24"
                            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-300">
                            Category
                          </label>
                          <select
                            value={newPhotoCategory}
                            onChange={e => setNewPhotoCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none"
                          >
                            <option value="Site Progress">Site Progress</option>
                            <option value="Infrastructure">Infrastructure</option>
                            <option value="Roads & Corridors">Roads & Corridors</option>
                            <option value="Masterplan & Layout">Masterplan & Layout</option>
                            <option value="Aerial & Drone">Aerial & Drone</option>
                          </select>
                        </div>
                      </div>

                      {/* Image Preview */}
                      {uploadPreview && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/10">
                          <img
                            src={uploadPreview}
                            alt="Upload preview"
                            className="w-20 h-14 object-cover rounded-lg border border-white/10"
                          />
                          <div className="text-xs">
                            <span className="font-semibold text-cyan-300">Ready to add:</span>{' '}
                            <span className="text-slate-300">{newPhotoTitle || 'Photo'}</span>
                            {isUploadingPhoto && (
                              <p className="text-[11px] text-amber-400 mt-0.5 flex items-center gap-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                Uploading to Cloudflare R2 bucket...
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <button
                          type="submit"
                          disabled={isUploadingPhoto}
                          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                          {isUploadingPhoto ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                              <span>Uploading to R2...</span>
                            </>
                          ) : (
                            <span>Add to Gallery</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Gallery Photos Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Current Gallery Photos ({galleryPhotos.length})
                      </h3>
                      {galleryPhotos.length > 0 && (
                        <button
                          onClick={() => {
                            if (window.confirm('Delete all photos and empty the gallery?')) {
                              adminStore.resetGallery();
                              showToast('Gallery emptied');
                            }
                          }}
                          className="text-xs text-rose-400 hover:underline"
                        >
                          Clear All Photos
                        </button>
                      )}
                    </div>

                    {galleryPhotos.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-black/30 border border-white/10 text-center text-slate-500 text-xs">
                        No photos in the gallery yet. Use the form above to upload site photographs.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {galleryPhotos.map(photo => (
                        <div
                          key={photo.id}
                          className="group relative rounded-2xl overflow-hidden bg-[#18181c] border border-white/10 flex flex-col shadow-md"
                        >
                          <div className="aspect-video w-full bg-black/50 overflow-hidden relative">
                            <img
                              src={photo.url}
                              alt={photo.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <button
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              title="Delete Photo"
                            >
                              🗑️
                            </button>
                          </div>
                          <div className="p-2.5 flex-1 flex flex-col justify-between text-xs">
                            <div>
                              <p className="font-semibold text-white truncate">{photo.title}</p>
                              <span className="text-[10px] text-cyan-400 font-mono">
                                {photo.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                </div>
              )}

              {/* TAB 3: SETTINGS & CLOUDFLARE */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-2xl">
                  {/* Cloudflare Deployment Status */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[#18181c] to-black border border-amber-500/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⛅</span>
                      <div>
                        <h3 className="text-sm font-bold text-white">Cloudflare Pages Deployment</h3>
                        <p className="text-xs text-amber-300/80">
                          Connected Project: <strong>dinanath-plot-viewer</strong>
                        </p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/50 border border-white/5 font-mono text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Live URL:</span>
                        <a
                          href="https://dinanath-plot-viewer.pages.dev"
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline"
                        >
                          https://dinanath-plot-viewer.pages.dev ↗
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Deploy Command:</span>
                        <span className="text-emerald-400">npm run deploy:cloudflare</span>
                      </div>
                    </div>
                  </div>

                  {/* Change Admin PIN */}
                  <div className="p-5 rounded-2xl bg-[#18181c] border border-white/10 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>🔑</span>
                      <span>Change Master Admin PIN</span>
                    </h3>

                    <form onSubmit={handleChangePin} className="space-y-3 max-w-md">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Current PIN</label>
                        <input
                          type="password"
                          value={currentPinInput}
                          onChange={e => setCurrentPinInput(e.target.value)}
                          placeholder="Current PIN..."
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">New PIN (min 4 digits)</label>
                        <input
                          type="password"
                          value={newPinInput}
                          onChange={e => setNewPinInput(e.target.value)}
                          placeholder="New PIN..."
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Confirm New PIN</label>
                        <input
                          type="password"
                          value={confirmPinInput}
                          onChange={e => setConfirmPinInput(e.target.value)}
                          placeholder="Confirm New PIN..."
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 focus:border-cyan-400 text-xs text-white outline-none"
                        />
                      </div>

                      {pinChangeMsg && (
                        <p
                          className={`text-xs font-medium ${
                            pinChangeMsg.isError ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {pinChangeMsg.text}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all active:scale-95"
                      >
                        Update PIN
                      </button>
                    </form>
                  </div>

                  {/* Backup & Restore Data */}
                  <div className="p-5 rounded-2xl bg-[#18181c] border border-white/10 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>💾</span>
                      <span>Backup & Restore Data</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Export your current plot statuses, customized notes, gallery photos, and leads into a single JSON file.
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleExportData}
                        className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold"
                      >
                        Export Backup JSON
                      </button>
                      <label className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold cursor-pointer">
                        Import Backup JSON
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = async () => {
                              const success = await adminStore.importBackupJson(reader.result as string);
                              if (success) {
                                showToast('Backup imported successfully!');
                              } else {
                                alert('Failed to parse backup JSON.');
                              }
                            };
                            reader.readAsText(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
