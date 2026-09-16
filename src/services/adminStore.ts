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

const STORAGE_KEYS = {
  PLOTS_OVERRIDES: 'dinanath_plots_overrides',
  GALLERY_PHOTOS: 'dinanath_gallery_photos',
  ADMIN_PIN: 'dinanath_admin_pin',
  ADMIN_SESSION: 'dinanath_admin_session',
  LAST_SYNC: 'dinanath_last_sync',
};

const DEFAULT_PIN = '2026';
const CHANGE_EVENT = 'dinanath_store_change';
const API_BASE = 'https://dinanath-api.dinanath.workers.dev';

function emitChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }
}

function mergeWithDefaultPhotos(photos: GalleryPhoto[]): GalleryPhoto[] {
  const list = [...photos];
  for (const def of GALLERY_PHOTOS) {
    if (!list.some(p => p.id === def.id || p.url === def.url)) {
      list.push(def);
    }
  }
  return list;
}

// In-memory cache for fast synchronous access
let cachedOverrides: Record<string, PlotOverride> | null = null;
let cachedGallery: GalleryPhoto[] | null = null;
let isSyncing = false;
let syncStatus: 'synced' | 'syncing' | 'offline' = 'synced';

export const adminStore = {
  subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(CHANGE_EVENT, callback);
    return () => window.removeEventListener(CHANGE_EVENT, callback);
  },

  getSyncStatus(): 'synced' | 'syncing' | 'offline' {
    return syncStatus;
  },

  // --- CLOUD SYNC (Cross-Device Cloudflare KV) ---
  async syncWithCloud(): Promise<boolean> {
    if (typeof window === 'undefined' || isSyncing) return false;
    isSyncing = true;
    syncStatus = 'syncing';
    emitChange();

    try {
      const res = await fetch(`${API_BASE}/api/sync`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      let hasChanges = false;

      // Sync Plots Overrides
      if (data.plotsOverrides && typeof data.plotsOverrides === 'object') {
        const localOverridesStr = localStorage.getItem(STORAGE_KEYS.PLOTS_OVERRIDES) || '{}';
        const serverOverridesStr = JSON.stringify(data.plotsOverrides);
        if (localOverridesStr !== serverOverridesStr) {
          localStorage.setItem(STORAGE_KEYS.PLOTS_OVERRIDES, serverOverridesStr);
          cachedOverrides = data.plotsOverrides;
          hasChanges = true;
        }
      }

      // Sync Gallery Photos
      if (Array.isArray(data.galleryPhotos) && data.galleryPhotos.length > 0) {
        const merged = mergeWithDefaultPhotos(data.galleryPhotos);
        const localGalleryStr = localStorage.getItem(STORAGE_KEYS.GALLERY_PHOTOS) || '[]';
        const serverGalleryStr = JSON.stringify(merged);
        if (localGalleryStr !== serverGalleryStr) {
          localStorage.setItem(STORAGE_KEYS.GALLERY_PHOTOS, serverGalleryStr);
          cachedGallery = merged;
          hasChanges = true;
        }
      }

      syncStatus = 'synced';
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());

      if (hasChanges) {
        emitChange();
      }
      return true;
    } catch (err) {
      console.warn('[Cloud Sync] Offline or failed to reach Cloudflare KV:', err);
      syncStatus = 'offline';
      emitChange();
      return false;
    } finally {
      isSyncing = false;
    }
  },

  // --- AUTHENTICATION ---
  getPin(): string {
    if (typeof window === 'undefined') return DEFAULT_PIN;
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
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
  },

  // --- PLOTS MANAGEMENT ---
  getPlotOverrides(): Record<string, PlotOverride> {
    if (cachedOverrides !== null) return cachedOverrides;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PLOTS_OVERRIDES);
      cachedOverrides = raw ? JSON.parse(raw) : {};
      return cachedOverrides || {};
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

  async updatePlotStatus(plotId: string, status: PlotStatus): Promise<void> {
    const overrides = { ...this.getPlotOverrides() };
    overrides[plotId] = {
      ...(overrides[plotId] || {}),
      status,
      updatedAt: new Date().toISOString(),
    };
    cachedOverrides = overrides;
    localStorage.setItem(STORAGE_KEYS.PLOTS_OVERRIDES, JSON.stringify(overrides));
    emitChange();

    // Push immediately to Cloudflare KV for cross-device persistence
    try {
      await fetch(`${API_BASE}/api/plots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plotId, status }),
      });
      syncStatus = 'synced';
    } catch (err) {
      console.error('[Cloudflare KV] Failed to sync plot status:', err);
      syncStatus = 'offline';
    }
    emitChange();
  },

  async bulkUpdatePlotStatus(plotIds: string[], status: PlotStatus): Promise<void> {
    const overrides = { ...this.getPlotOverrides() };
    const now = new Date().toISOString();
    plotIds.forEach(id => {
      overrides[id] = {
        ...(overrides[id] || {}),
        status,
        updatedAt: now,
      };
    });
    cachedOverrides = overrides;
    localStorage.setItem(STORAGE_KEYS.PLOTS_OVERRIDES, JSON.stringify(overrides));
    emitChange();

    // Push to Cloudflare KV
    try {
      await fetch(`${API_BASE}/api/plots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulkUpdates: plotIds.map(id => ({ plotId: id, status })),
        }),
      });
      syncStatus = 'synced';
    } catch (err) {
      console.error('[Cloudflare KV] Failed to bulk sync:', err);
      syncStatus = 'offline';
    }
    emitChange();
  },

  async resetPlots(): Promise<void> {
    cachedOverrides = {};
    localStorage.removeItem(STORAGE_KEYS.PLOTS_OVERRIDES);
    emitChange();

    try {
      await fetch(`${API_BASE}/api/plots/reset`, { method: 'POST' });
      syncStatus = 'synced';
    } catch (err) {
      console.error('[Cloudflare KV] Failed to reset plots:', err);
    }
    emitChange();
  },

  // --- GALLERY MANAGEMENT ---
  getGalleryPhotos(): GalleryPhoto[] {
    if (cachedGallery !== null) return cachedGallery;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.GALLERY_PHOTOS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = mergeWithDefaultPhotos(parsed);
          cachedGallery = merged;
          return merged;
        }
      }
    } catch {}
    cachedGallery = GALLERY_PHOTOS;
    return GALLERY_PHOTOS;
  },

  // Upload image directly to Cloudflare R2 bucket
  async uploadPhoto(file: File): Promise<{ url: string; key: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }

    const data = await res.json();
    if (!data.success || !data.url) {
      throw new Error(data.error || 'Failed to upload photo to Cloudflare R2');
    }

    return { url: data.url, key: data.key };
  },

  async addGalleryPhoto(photo: Omit<GalleryPhoto, 'id'>): Promise<GalleryPhoto> {
    const photos = [...this.getGalleryPhotos()];
    const newPhoto: GalleryPhoto = {
      id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...photo,
    };
    photos.unshift(newPhoto);
    cachedGallery = photos;
    localStorage.setItem(STORAGE_KEYS.GALLERY_PHOTOS, JSON.stringify(photos));
    emitChange();

    // Push to Cloudflare KV
    try {
      await fetch(`${API_BASE}/api/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', photo: newPhoto }),
      });
      syncStatus = 'synced';
    } catch (err) {
      console.error('[Cloudflare KV] Failed to sync new photo:', err);
      syncStatus = 'offline';
    }
    emitChange();
    return newPhoto;
  },

  async deleteGalleryPhoto(id: string): Promise<void> {
    const photos = this.getGalleryPhotos().filter(p => p.id !== id);
    cachedGallery = photos;
    localStorage.setItem(STORAGE_KEYS.GALLERY_PHOTOS, JSON.stringify(photos));
    emitChange();

    try {
      await fetch(`${API_BASE}/api/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', photoId: id }),
      });
      syncStatus = 'synced';
    } catch (err) {
      console.error('[Cloudflare KV] Failed to delete photo on cloud:', err);
      syncStatus = 'offline';
    }
    emitChange();
  },

  async resetGallery(): Promise<void> {
    cachedGallery = GALLERY_PHOTOS;
    localStorage.removeItem(STORAGE_KEYS.GALLERY_PHOTOS);
    emitChange();

    try {
      await fetch(`${API_BASE}/api/gallery/reset`, { method: 'POST' });
      syncStatus = 'synced';
    } catch (err) {
      console.error('[Cloudflare KV] Failed to reset gallery on cloud:', err);
    }
    emitChange();
  },

  // --- BACKUP & RESTORE ---
  exportBackupJson(): string {
    return JSON.stringify(
      {
        version: 2,
        exportedAt: new Date().toISOString(),
        plotsOverrides: this.getPlotOverrides(),
        galleryPhotos: this.getGalleryPhotos(),
      },
      null,
      2
    );
  },

  async importBackupJson(jsonStr: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonStr);
      if (data.plotsOverrides) {
        cachedOverrides = data.plotsOverrides;
        localStorage.setItem(STORAGE_KEYS.PLOTS_OVERRIDES, JSON.stringify(data.plotsOverrides));
        await fetch(`${API_BASE}/api/plots`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ overrides: data.plotsOverrides }),
        });
      }
      if (data.galleryPhotos && Array.isArray(data.galleryPhotos)) {
        cachedGallery = data.galleryPhotos;
        localStorage.setItem(STORAGE_KEYS.GALLERY_PHOTOS, JSON.stringify(data.galleryPhotos));
        await fetch(`${API_BASE}/api/gallery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photos: data.galleryPhotos }),
        });
      }
      emitChange();
      return true;
    } catch {
      return false;
    }
  },
};

// Automatic initial sync & background polling across all devices
if (typeof window !== 'undefined') {
  // Sync immediately when page loads
  adminStore.syncWithCloud();

  // Re-sync when user tabs back or unlocks their mobile screen
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      adminStore.syncWithCloud();
    }
  });

  window.addEventListener('focus', () => {
    adminStore.syncWithCloud();
  });

  // Background polling every 12 seconds for seamless live cross-device sync
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      adminStore.syncWithCloud();
    }
  }, 12000);
}
