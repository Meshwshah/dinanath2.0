import type { SiteInfo } from '../types/masterplan';

export const SITE: SiteInfo = {
  name: 'DINANATH INDUSTRIAL PARK',
  client: 'Ketanbhai Shukla',
  projectType: 'Industrial Plotting',
  detail: 'Layout Plan & Masterplan Development',
  architect: 'arya associates',
  engineer: 'Nitin Kapadi',
  contactPhone: '+91 6354 045 409',
  contactEmail: 'nitinkapadi@yahoo.com',
  officeAddress: '301, Silver Coin Complex, Nr. Cow Circle, Akota, Vadodara - 390020',
  location: 'Manglej, Karjan, Vadodara, Gujarat',
  village: 'Manglej',
  taluka: 'Karjan',
  district: 'Vadodara',
  state: 'Gujarat',
  lat: 22.101294,
  lng: 73.172889,
  totalAreaSmt: 33493.72,
  totalAreaSft: 360526.40,
  totalPlots: 69,
  commonPlot01Smt: 1965.79,
  commonPlot02Smt: 1003.96,
  naliyaSetbackSmt: 592.25,
  treePlantationWidthMt: 1.22,
  roads: {
    naliyaRoadMt: 18.00,
    crossOverRoadMt: 17.50,
    internalMajorRoadMt: 12.00,
    internalMinorRoadMt: 9.00,
  },
};

export function googleMapsDirectionsUrl(): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${SITE.lat},${SITE.lng}`;
}

export function whatsappInquiryUrl(plotNumber?: number | string, areaSft?: number): string {
  const cleanPhone = SITE.contactPhone.replace(/[^0-9]/g, '');
  let message = `Hello, I am interested in purchasing a plot at Dinanath Industrial Park. Please share the available plot sizes, pricing, location details, amenities, and payment options. I would also like to know the site visit availability.\n\nThank you.`;
  if (plotNumber) {
    message = `Hello, I am interested in purchasing Plot #${plotNumber}${areaSft ? ` (${areaSft.toLocaleString()} Sq.Ft.)` : ''} at Dinanath Industrial Park. Please share the pricing, location details, amenities, payment options, and site visit availability.\n\nThank you.`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
