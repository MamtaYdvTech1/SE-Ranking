import { describe, it, expect } from 'vitest';
import { verifyRecaptcha } from '../src/lib/recaptcha';
import { REAL_VEHICLE_IMAGES, ALL_VEHICLE_IMAGES } from '../src/components/verification/BusBicycleImageSelector';

describe('Captcha & Visual Vehicle Challenge Suite', () => {
  it('validates visual vehicle challenge tokens successfully', async () => {
    const visualToken = `visual_vehicle_verified_${Date.now()}_abc123`;
    const result = await verifyRecaptcha(visualToken);
    expect(result.success).toBe(true);
    expect(result.provider).toBe('google_recaptcha');
  });

  it('contains verified photography for Cycles, Bikes, Cars, and Buses', () => {
    // Original 8 items preserved
    expect(REAL_VEHICLE_IMAGES).toHaveLength(8);

    // Expanded dataset with all 4 categories (4 of each = 16 total)
    expect(ALL_VEHICLE_IMAGES).toHaveLength(16);

    const bicycles = ALL_VEHICLE_IMAGES.filter((img) => img.category === 'bicycle');
    const motorbikes = ALL_VEHICLE_IMAGES.filter((img) => img.category === 'motorcycle');
    const cars = ALL_VEHICLE_IMAGES.filter((img) => img.category === 'car');
    const buses = ALL_VEHICLE_IMAGES.filter((img) => img.category === 'bus');

    expect(bicycles).toHaveLength(4);
    expect(motorbikes).toHaveLength(4);
    expect(cars).toHaveLength(4);
    expect(buses).toHaveLength(4);

    ALL_VEHICLE_IMAGES.forEach((item) => {
      expect(item.src).toContain('images.unsplash.com');
      expect(item.title).toBeTruthy();
      expect(item.alt).toBeTruthy();
    });
  });

  it('rejects empty or missing captcha token', async () => {
    const result = await verifyRecaptcha('');
    expect(result.success).toBe(false);
    expect(result['error-codes']).toContain('missing-input-response');
  });
});
