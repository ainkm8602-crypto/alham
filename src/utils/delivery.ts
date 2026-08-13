import { DeliverySettings, DeliveryZone } from '../types';

export interface FreeShippingInfo {
  freeDeliveryEnabled: boolean;
  threshold: number;
  isFree: boolean;
  amountNeeded: number;
  progressPercent: number;
  selectedZone: DeliveryZone | null;
}

/**
 * Single source of truth for Free Shipping threshold and calculation.
 * Takes the delivery settings, cart subtotal, and optional selected zone ID.
 */
export function calculateFreeShipping(
  deliverySettings: DeliverySettings | undefined | null,
  subtotal: number,
  selectedZoneId?: string
): FreeShippingInfo {
  const freeEnabled = deliverySettings?.freeDeliveryEnabled !== false;

  const zones: DeliveryZone[] = (deliverySettings?.zones && deliverySettings.zones.length > 0)
    ? deliverySettings.zones
    : [
        {
          id: 'z-dhaka',
          name: 'Dhaka City (Inside)',
          nameBn: 'ঢাকা সিটি (ভেতরে)',
          standardFee: 60,
          expressFee: 100,
          freeDeliveryMinAmount: 1500,
          estimatedTime: '3-4 Business Days',
          estimatedTimeBn: '২-৩ কর্মদিবস',
          active: true
        }
      ];

  const activeZones = zones.filter(z => z.active);

  // Determine selected zone or fallback to first active zone
  let selectedZone: DeliveryZone | null = null;
  if (selectedZoneId) {
    selectedZone = activeZones.find(z => z.id === selectedZoneId) || zones.find(z => z.id === selectedZoneId) || null;
  }

  if (!selectedZone && activeZones.length > 0) {
    selectedZone = activeZones[0];
  }

  // Zone's freeDeliveryMinAmount is the primary source of truth
  let threshold = 1500;
  if (selectedZone && typeof selectedZone.freeDeliveryMinAmount === 'number' && selectedZone.freeDeliveryMinAmount > 0) {
    threshold = selectedZone.freeDeliveryMinAmount;
  } else if (deliverySettings?.globalFreeDeliveryThreshold && deliverySettings.globalFreeDeliveryThreshold > 0) {
    threshold = deliverySettings.globalFreeDeliveryThreshold;
  } else if ((deliverySettings as any)?.globalFreeDeliveryMinAmount && (deliverySettings as any).globalFreeDeliveryMinAmount > 0) {
    threshold = (deliverySettings as any).globalFreeDeliveryMinAmount;
  }

  const isFree = freeEnabled && subtotal >= threshold;
  const amountNeeded = Math.max(0, threshold - subtotal);
  const progressPercent = threshold > 0 ? Math.min(100, (subtotal / threshold) * 100) : 100;

  return {
    freeDeliveryEnabled: freeEnabled,
    threshold,
    isFree,
    amountNeeded,
    progressPercent,
    selectedZone
  };
}
