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
}

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'masterplan-blueprint',
    title: 'Official Masterplan Layout (33,493 SMT)',
    url: `${import.meta.env.BASE_URL}masterplan-layout.webp`,
    alt: 'Dinanath Industrial Park Complete Masterplan Layout Blueprint',
  },
  {
    id: 'satellite-overlay',
    title: 'Satellite Real-World Layout & Corridor',
    url: `${import.meta.env.BASE_URL}masterplan-layout-satellite.webp`,
    alt: 'Dinanath Industrial Park Real-World Satellite Layout',
  },
  {
    id: 'site-photo-1',
    title: 'Industrial Park Approach & 18M Road Frontage',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80',
    alt: 'Industrial Park Wide Concrete Road Infrastructure',
  },
  {
    id: 'site-photo-2',
    title: 'Modular PEB Warehouse & Factory Plots',
    url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&q=80',
    alt: 'High-clearance pre-engineered industrial warehouse facility',
  },
  {
    id: 'site-photo-3',
    title: 'Heavy Logistics & Container Transport Yard',
    url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80',
    alt: 'Logistics cargo loading and container handling area',
  },
  {
    id: 'site-photo-4',
    title: 'Precision Manufacturing & Engineering Facility',
    url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1600&q=80',
    alt: 'Modern industrial engineering and manufacturing plant',
  },
  {
    id: 'site-photo-5',
    title: 'Park Power Grid & High-Tension Substation',
    url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1600&q=80',
    alt: 'Industrial park utility power supply and infrastructure',
  },
  {
    id: 'site-photo-6',
    title: 'NH-48 Golden Quadrilateral Express Freight Axis',
    url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1600&q=80',
    alt: 'National Highway NH-48 connectivity and transport corridor',
  },
];
