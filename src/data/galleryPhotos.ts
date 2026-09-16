/**
 * Dinanath Industrial Park - Gallery Photos Data
 *
 * ADMIN INSTRUCTIONS:
 * To add a new photo to the gallery:
 * Simply add a new object to the GALLERY_PHOTOS array below:
 * {
 *   id: 'unique-id',
 *   title: 'Photo Title',
 *   url: 'path-to-image-or-url',
 *   alt: 'Description for accessibility'
 * }
 * Photos can be local paths (e.g. `${import.meta.env.BASE_URL}your-photo.jpg`)
 * or direct image URLs (e.g. from cloud storage, AWS S3, Cloudinary, etc.).
 */

export interface GalleryPhoto {
  id: string;
  title: string;
  url: string;
  alt?: string;
  date?: string;
  category?: string;
  description?: string;
}

// Empty by default - only real photos uploaded by Admin will appear
export const GALLERY_PHOTOS: GalleryPhoto[] = [];

