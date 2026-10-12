'use client';

import React, { useState, useId, useMemo } from 'react';
import { Check, RotateCcw, ShieldCheck, Bus, Bike, Car, AlertCircle } from 'lucide-react';

export interface VehicleImageItem {
  id: string;
  category: 'bus' | 'bicycle' | 'car' | 'motorcycle';
  title: string;
  description: string;
  src: string;
  alt: string;
}

// Base 8 items for test suite backward compatibility
export const REAL_VEHICLE_IMAGES: VehicleImageItem[] = [
  {
    id: 'bus-1',
    category: 'bus',
    title: 'Red Double-Decker Bus',
    description: 'Iconic London red double-decker transit bus on city street',
    src: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
    alt: 'Red double-decker public bus on a paved city road',
  },
  {
    id: 'bike-1',
    category: 'bicycle',
    title: 'Urban Road Bicycle',
    description: 'High-performance lightweight drop-bar road racing bike',
    src: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80',
    alt: 'Sport road bicycle parked outdoors with slim aerodynamic frame',
  },
  {
    id: 'bus-2',
    category: 'bus',
    title: 'City Transit Bus',
    description: 'Modern low-floor municipal public transit bus',
    src: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80',
    alt: 'Modern city transit bus driving along a street',
  },
  {
    id: 'bike-2',
    category: 'bicycle',
    title: 'Vintage Commuter Bike',
    description: 'Classic steel-frame city bicycle with leather saddle',
    src: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=600&auto=format&fit=crop&q=80',
    alt: 'Vintage European style bicycle resting against a wall',
  },
  {
    id: 'bus-3',
    category: 'bus',
    title: 'Long-Distance Coach',
    description: 'Aerodynamic intercity passenger touring coach',
    src: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=600&auto=format&fit=crop&q=80',
    alt: 'Large highway travel coach bus parked in terminal',
  },
  {
    id: 'bike-3',
    category: 'bicycle',
    title: 'Trail Mountain Bike',
    description: 'Full-suspension all-terrain mountain bike for trail riding',
    src: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600&auto=format&fit=crop&q=80',
    alt: 'Mountain bike equipped with knobby tires parked in natural setting',
  },
  {
    id: 'bus-4',
    category: 'bus',
    title: 'Yellow School Bus',
    description: 'Standard North American yellow passenger school bus',
    src: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
    alt: 'Traditional yellow school bus parked on a clean street',
  },
  {
    id: 'bike-4',
    category: 'bicycle',
    title: 'City Cruiser Bicycle',
    description: 'Comfortable upright cruiser bicycle with front basket',
    src: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=600&auto=format&fit=crop&q=80',
    alt: 'City commuter bicycle parked beside an urban sidewalk',
  },
];

// Additional genuine licensed Unsplash photos for Cars and Motorcycles/Bikes
export const EXTENDED_VEHICLE_IMAGES: VehicleImageItem[] = [
  {
    id: 'car-1',
    category: 'car',
    title: 'Modern Sports Coupe',
    description: 'Aerodynamic performance sports car parked on coastal road',
    src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
    alt: 'High-performance sports coupe on an open scenic road',
  },
  {
    id: 'car-2',
    category: 'car',
    title: 'Classic Vintage Muscle Car',
    description: 'Restored vibrant yellow vintage American classic car',
    src: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80',
    alt: 'Classic vintage yellow car parked curbside in the city',
  },
  {
    id: 'car-3',
    category: 'car',
    title: 'Urban Compact Hatchback',
    description: 'Modern red commuter automobile parked on urban street',
    src: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
    alt: 'Compact red city car parked outdoors in daylight',
  },
  {
    id: 'car-4',
    category: 'car',
    title: 'All-Terrain Luxury SUV',
    description: 'Four-wheel drive adventure sport utility vehicle',
    src: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&auto=format&fit=crop&q=80',
    alt: 'Silver luxury SUV parked in picturesque mountain background',
  },
  {
    id: 'motorcycle-1',
    category: 'motorcycle',
    title: 'High-Speed Sports Motorbike',
    description: 'Full-fairing racing motorcycle on open tarmac',
    src: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
    alt: 'Performance sports motorbike parked on scenic asphalt',
  },
  {
    id: 'motorcycle-2',
    category: 'motorcycle',
    title: 'Classic Highway Cruiser Bike',
    description: 'Custom cruiser motorcycle with chrome exhaust pipes',
    src: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
    alt: 'Black cruiser motorbike parked against an urban wall',
  },
  {
    id: 'motorcycle-3',
    category: 'motorcycle',
    title: 'Retro Urban Scooter',
    description: 'Pastel teal city motor scooter parked by sidewalk',
    src: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80',
    alt: 'Classic vintage scooter bike beside an urban café',
  },
  {
    id: 'motorcycle-4',
    category: 'motorcycle',
    title: 'Adventure Dual-Sport Motorbike',
    description: 'All-terrain adventure touring motorbike on dirt trail',
    src: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600&auto=format&fit=crop&q=80',
    alt: 'Adventure dual-sport motorcycle parked on outdoor landscape',
  },
];

export const ALL_VEHICLE_IMAGES: VehicleImageItem[] = [
  ...REAL_VEHICLE_IMAGES,
  ...EXTENDED_VEHICLE_IMAGES,
];

export type VehicleCategoryTarget = 'bus' | 'bicycle' | 'car' | 'motorcycle' | 'cycle' | 'bike';

export interface BusBicycleImageSelectorProps {
  targetCategory?: VehicleCategoryTarget;
  onSelectionChange?: (selectedIds: string[], isCorrect: boolean, token?: string) => void;
  className?: string;
  onSuccessToken?: (token: string) => void;
}

export function BusBicycleImageSelector({
  targetCategory = 'bicycle',
  onSelectionChange,
  className = '',
  onSuccessToken,
}: BusBicycleImageSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{ status: 'idle' | 'success' | 'incomplete'; message: string }>({
    status: 'idle',
    message: '',
  });
  const headingId = useId();

  // Normalize category name
  const normalizedCategory: 'bus' | 'bicycle' | 'car' | 'motorcycle' = useMemo(() => {
    if (targetCategory === 'cycle') return 'bicycle';
    if (targetCategory === 'bike') return 'motorcycle';
    return targetCategory as 'bus' | 'bicycle' | 'car' | 'motorcycle';
  }, [targetCategory]);

  const displayCategoryLabel = useMemo(() => {
    switch (normalizedCategory) {
      case 'bicycle':
        return 'Cycles / Bicycles';
      case 'motorcycle':
        return 'Bikes / Motorcycles';
      case 'car':
        return 'Cars';
      case 'bus':
        return 'Buses';
      default:
        return 'Vehicles';
    }
  }, [normalizedCategory]);

  // Select 8 items for the visual challenge: 4 target items + 4 distractor items
  const challengeImages = useMemo(() => {
    const targets = ALL_VEHICLE_IMAGES.filter((img) => img.category === normalizedCategory);
    const nonTargets = ALL_VEHICLE_IMAGES.filter((img) => img.category !== normalizedCategory);

    // Pick 4 distractors (prefer distinct categories)
    const distractors = nonTargets.slice(0, 4);
    const combined = [...targets, ...distractors];

    // Interleave stably for deterministic layout
    return combined.sort((a, b) => a.id.localeCompare(b.id));
  }, [normalizedCategory]);

  const targetCount = challengeImages.filter((img) => img.category === normalizedCategory).length;

  const generateVerificationToken = () => {
    return `visual_vehicle_verified_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);

    const selectedArray = Array.from(next);
    const targetItems = challengeImages.filter((img) => img.category === normalizedCategory);
    const nonTargetSelected = selectedArray.some((sId) => {
      const itm = challengeImages.find((i) => i.id === sId);
      return itm?.category !== normalizedCategory;
    });
    const allTargetSelected = targetItems.every((itm) => next.has(itm.id));
    const isCorrect = allTargetSelected && !nonTargetSelected && selectedArray.length === targetCount;

    const token = isCorrect ? generateVerificationToken() : undefined;

    if (onSelectionChange) {
      onSelectionChange(selectedArray, isCorrect, token);
    }
    if (isCorrect && token && onSuccessToken) {
      onSuccessToken(token);
    }

    if (isCorrect) {
      setFeedback({
        status: 'success',
        message: `Verified! You identified all ${targetCount} ${displayCategoryLabel} accurately.`,
      });
    } else {
      setFeedback({
        status: 'idle',
        message: '',
      });
    }
  };

  const handleReset = () => {
    setSelectedIds(new Set());
    setFeedback({ status: 'idle', message: '' });
    if (onSelectionChange) {
      onSelectionChange([], false);
    }
  };

  const handleValidate = () => {
    const selectedArray = Array.from(selectedIds);
    const targetItems = challengeImages.filter((img) => img.category === normalizedCategory);
    const nonTargetSelected = selectedArray.some((sId) => {
      const itm = challengeImages.find((i) => i.id === sId);
      return itm?.category !== normalizedCategory;
    });
    const allTargetSelected = targetItems.every((itm) => selectedIds.has(itm.id));
    const isCorrect = allTargetSelected && !nonTargetSelected && selectedArray.length === targetCount;

    if (isCorrect) {
      const token = generateVerificationToken();
      setFeedback({
        status: 'success',
        message: `Verification Successful! All ${targetCount} ${displayCategoryLabel} correctly selected.`,
      });
      if (onSelectionChange) {
        onSelectionChange(selectedArray, true, token);
      }
      if (onSuccessToken) {
        onSuccessToken(token);
      }
    } else {
      setFeedback({
        status: 'incomplete',
        message: `Please select all ${displayCategoryLabel} (${selectedIds.size} of ${targetCount} selected so far).`,
      });
    }
  };

  const renderCategoryIcon = () => {
    switch (normalizedCategory) {
      case 'bus':
        return <Bus className="w-5 h-5" />;
      case 'car':
        return <Car className="w-5 h-5" />;
      case 'motorcycle':
      case 'bicycle':
      default:
        return <Bike className="w-5 h-5" />;
    }
  };

  return (
    <div
      className={`w-full max-w-2xl bg-white border border-gray-200 rounded-2xl p-5 shadow-sm ${className}`}
      role="region"
      aria-labelledby={headingId}
    >
      {/* Header and selection instructions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#FAF8FF] text-[#7C3AED]">
              {renderCategoryIcon()}
            </span>
            <h3 id={headingId} className="text-base font-bold text-gray-900 tracking-tight">
              Visual Challenge: Select all <span className="text-[#7C3AED]">{displayCategoryLabel}</span>
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Click on each photo featuring a {displayCategoryLabel.toLowerCase()}. Genuine high-resolution photographs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-[#7C3AED] rounded-full border border-purple-100">
            {selectedIds.size} / {targetCount} selected
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Reset selection"
            aria-label="Reset selection"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Responsive Grid: 2 columns mobile, 4 columns tablet & desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-5">
        {challengeImages.map((item) => {
          const isSelected = selectedIds.has(item.id);
          return (
            <div
              key={item.id}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => toggleSelect(item.id)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  toggleSelect(item.id);
                }
              }}
              className={`group relative rounded-xl overflow-hidden cursor-pointer select-none border-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] ${
                isSelected
                  ? 'border-[#7C3AED] ring-2 ring-purple-300 shadow-md scale-[0.98]'
                  : 'border-transparent hover:border-gray-300 hover:shadow-xs'
              }`}
            >
              {/* Image Container with aspect ratio */}
              <div className="relative aspect-4/3 w-full bg-gray-100 overflow-hidden">
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                    isSelected ? 'brightness-[0.92]' : ''
                  }`}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                {/* Selection Checkmark Badge */}
                <div
                  className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#7C3AED] text-white shadow-md scale-100'
                      : 'bg-black/35 text-white/50 backdrop-blur-xs group-hover:bg-black/50'
                  }`}
                  aria-hidden="true"
                >
                  <Check className={`w-3.5 h-3.5 ${isSelected ? 'stroke-[3]' : 'opacity-70'}`} />
                </div>

                {/* Category label badge */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white tracking-wide uppercase">
                  {item.category}
                </div>
              </div>

              {/* Title and metadata */}
              <div className="p-2 bg-gray-50 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-800 truncate">{item.title}</p>
                <p className="text-[10px] text-gray-500 truncate">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action footer & validation state */}
      <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-gray-600 flex items-center gap-2">
          {feedback.status === 'success' && (
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {feedback.message}
            </span>
          )}
          {feedback.status === 'incomplete' && (
            <span className="flex items-center gap-1.5 text-amber-700 font-medium bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              {feedback.message}
            </span>
          )}
          {feedback.status === 'idle' && (
            <span className="text-gray-500 text-[11px]">
              Select all {displayCategoryLabel} photos above and click Confirm to verify.
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleValidate}
            className="w-full sm:w-auto px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}
