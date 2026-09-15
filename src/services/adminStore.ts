import type { PlotData, PlotStatus } from '../types/masterplan';
import { PLOTS_DATA } from '../data/plotsData';
import { GALLERY_PHOTOS, type GalleryPhoto } from '../data/galleryPhotos';

export interface PlotOverride {
  status?: PlotStatus;
  pricePerSqYd?: number;
  notes?: string;
  customBuyer?: string;
  updatedAt?: string;
}

export interface StoredInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  plotNumber?: string;
  message?: string;
  date: string;
}

const STORAGE_KEYS = {
  PLOTS_OVERRIDES: 'dinanath_plots_overrides',
  GALLERY_PHOTOS: 'dinanath_gallery_photos',
  INQUIRIES: 'dinanath_inquiries',
  ADMIN_PIN: 'dinanath_admin_pin',
  ADMIN_SESSION: 'dinanath_admin_session',
};

const DEFAULT_PIN = '2026';

// Event for syncing across tabs/components
const CHANGE_EVENT = 'dinanath_store_change';

function emitChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }
}

export const adminStore = {
  subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(CHANGE_EVENT, callback);
    return () => window.removeEventListener(CHANGE_EVENT, callback);
  },

  // --- AUTHENTICATION ---
  getPin(): string {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || DEFAULT_PIN;
  },

  setPin(newPin: string): boolean {
    if (!newPin || newPin.trim().length < 4) return false;
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, newPin.trim());
    return true;
  },

  login(pin: string): boolean {
    const currentPin = this.getPin();
    if (pin.trim() === currentPin) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
      return true;
    }
    return false;
  },

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  },

  isAuthenticated(): boolean {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
  },

  // --- PLOTS MANAGEMENT ---
  getPlotOverrides(): Record<string, PlotOverride> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PLOTS_OVERRIDES);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  getPlots(): PlotData[] {
    const overrides = this.getPlotOverrides();
    return PLOTS_DATA.map(plot => {
      const override = overrides[plot.id];
      if (!override) return plot;
      return {
        ...plot,
        status: override.status ?? plot.status,
        notes: override.notes ?? (plot as any).notes,
        pricePerSqYd: override.pricePerSqYd ?? (plot as any).pricePerSqYd,
      };
    });
  },

  updatePlotStatus(plotId: string, status: PlotStatus): void {
    const overrides = this.getPlotOverrides();
    overrides[plotId] = {
      ...(overrides[plotId] || {}),
      status,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.PLOTS_OVERRIDES, JSON.stringify(overrides));
    emitChange();
  },

  updatePlotDetails(plotId: string, updates: Partial<PlotOverride>): void {
    const overrides = this.getPlotOverrides();
    overrides[plotId] = {
      ...(overrides[plotId] || {}),
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.PLOTS_OVERRIDES, JSON.stringify(overrides));
    emitChange();
  },

  bulkUpdatePlotStatus(plotIds: string[], status: PlotStatus): void {
    const overrides = this.getPlotOverrides();
    const now = new Date().toISOString();
    plotIds.forEach(id => {
      overrides[id] = {
        ...(overrides[id] || {}),
        status,
        updatedAt: now,
      };
    });
    localStorage.setItem(STORAGE_KEYS.PLOTS_OVERRIDES, JSON.stringify(overrides));
    emitChange();
  },

  resetPlots(): void {
    localStorage.removeItem(STORAGE_KEYS.PLOTS_OVERRIDES);
    emitChange();
  },

  // --- GALLERY MANAGEMENT ---
  getGalleryPhotos(): GalleryPhoto[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.GALLERY_PHOTOS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return GALLERY_PHOTOS;
  },

  addGalleryPhoto(photo: Omit<GalleryPhoto, 'id'>): GalleryPhoto {
    const photos = [...this.getGalleryPhotos()];
    const newPhoto: GalleryPhoto = {
      id: `custom-photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...photo,
    };
    photos.unshift(newPhoto);
    localStorage.setItem(STORAGE_KEYS.GALLERY_PHOTOS, JSON.stringify(photos));
    emitChange();
    return newPhoto;
  },

  deleteGalleryPhoto(id: string): void {
    const photos = this.getGalleryPhotos().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.GALLERY_PHOTOS, JSON.stringify(photos));
    emitChange();
  },

  resetGallery(): void {
    localStorage.removeItem(STORAGE_KEYS.GALLERY_PHOTOS);
    emitChange();
  },

  // --- INQUIRIES & LEADS ---
  getInquiries(): StoredInquiry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  addInquiry(inquiry: Omit<StoredInquiry, 'id' | 'date'>): StoredInquiry {
    const list = this.getInquiries();
    const newInquiry: StoredInquiry = {
      id: `inq-${Date.now()}`,
      date: new Date().toLocaleString(),
      ...inquiry,
    };
    list.unshift(newInquiry);
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(list));
    emitChange();
    return newInquiry;
  },

  clearInquiries(): void {
    localStorage.removeItem(STORAGE_KEYS.INQUIRIES);
    emitChange();
  },

  // --- BACKUP & RESTORE ---
  exportBackupJson(): string {
    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        plotsOverrides: this.getPlotOverrides(),
        galleryPhotos: this.getGalleryPhotos(),
        inquiries: this.getInquiries(),
      },
      null,
      2
    );
  },

  importBackupJson(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.plotsOverrides) {
        localStorage.setItem(STORAGE_KEYS.PLOTS_OVERRIDES, JSON.stringify(data.plotsOverrides));
      }
      if (data.galleryPhotos && Array.isArray(data.galleryPhotos)) {
        localStorage.setItem(STORAGE_KEYS.GALLERY_PHOTOS, JSON.stringify(data.galleryPhotos));
      }
      if (data.inquiries && Array.isArray(data.inquiries)) {
        localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(data.inquiries));
      }
      emitChange();
      return true;
    } catch {
      return false;
    }
  },
};
