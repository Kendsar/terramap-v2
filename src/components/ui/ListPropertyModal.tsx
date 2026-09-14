'use client';

import * as Dialog from '@radix-ui/react-dialog';
import {
  X, MapPin, Tag, DollarSign, Maximize2, FileText, UploadCloud,
  Mountain, Wheat, Home, ChevronRight, ChevronLeft, Check,
  Droplets, Zap, Route, Sprout, Trees, Building2,
  BedDouble, Bath, Sofa, Flower2, Car, Image as ImageIcon,
  User, Mail, Pencil
} from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { PropertyType } from '@/types';
import { MOCK_PROPERTIES } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthContext';

interface ListPropertyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  coordinates: number[][]; // The drawn polygon boundary
  onSuccess: () => void;
}

const DEFAULT_IMAGES: Record<PropertyType, string> = {
  land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60',
  farm: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=60',
  house: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60',
};

const STEP_LABELS = ['Basics', 'Details', 'Review'] as const;

const PROPERTY_TYPES: { value: PropertyType; label: string; icon: typeof Mountain; description: string }[] = [
  { value: 'land', label: 'Land', icon: Mountain, description: 'Raw plot or vacant lot' },
  { value: 'farm', label: 'Farm', icon: Wheat, description: 'Agricultural property' },
  { value: 'house', label: 'House', icon: Home, description: 'Residential property' },
];

// ─── Area Calculation ────────────────────────────────────────────────
// Uses the Shoelace formula on geodesic-projected coordinates.
// Coordinates: [lat, lng][]
function calculatePolygonArea(coords: number[][]): { value: number; unit: 'acres' | 'sqft' | 'hectares' | 'sqm' } | null {
  if (!coords || coords.length < 3) return null;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000; // Earth radius in metres

  // Project each coord to metres relative to centroid
  const latC = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const lngC = coords.reduce((s, c) => s + c[1], 0) / coords.length;

  const projected = coords.map((c) => ({
    x: R * toRad(c[1] - lngC) * Math.cos(toRad(latC)),
    y: R * toRad(c[0] - latC),
  }));

  // Shoelace
  let area = 0;
  for (let i = 0; i < projected.length; i++) {
    const j = (i + 1) % projected.length;
    area += projected[i].x * projected[j].y;
    area -= projected[j].x * projected[i].y;
  }
  area = Math.abs(area) / 2;

  // Convert sqm to acres
  const acres = area / 4046.86;

  if (acres < 0.01) return null; // too small to be reliable
  return { value: Math.round(acres * 100) / 100, unit: 'acres' };
}

// ─── Format helpers ──────────────────────────────────────────────────
function formatPrice(value: string | number): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!n || isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

// ─── Toggle Chip (stable component, defined outside to avoid remount) ─
function ToggleChip({ label, icon: Icon, active, onToggle }: { label: string; icon: typeof Droplets; active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-all",
        active
          ? "border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 shadow-sm"
          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-500 dark:hover:border-white/20 dark:hover:text-gray-300"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      {active && <Check className="h-3 w-3 ml-auto text-emerald-500" />}
    </button>
  );
}

export function ListPropertyModal({ isOpen, onOpenChange, coordinates, onSuccess }: ListPropertyModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [editingSeller, setEditingSeller] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'land' as PropertyType,
    price: '',
    size: '',
    sizeUnit: 'acres' as 'acres' | 'sqft' | 'hectares' | 'sqm',
    placement: '',
    description: '',
    ownerName: user?.displayName || user?.email || '',
    contact: user?.email || '',
    image: '',
  });

  // Type-specific optional details
  const [typeDetails, setTypeDetails] = useState({
    // Land
    waterAccess: false,
    electricity: false,
    roadAccess: false,
    agriculturalUse: false,
    // Farm
    irrigation: false,
    farmElectricity: false,
    numberOfTrees: '',
    buildings: false,
    farmRoadAccess: false,
    // House
    bedrooms: '',
    bathrooms: '',
    furnished: false,
    garden: false,
    parking: false,
  });

  // Calculate area from polygon
  const calculatedArea = useMemo(() => calculatePolygonArea(coordinates), [coordinates]);

  // Sync calculated area into formData on first open
  useEffect(() => {
    if (isOpen && calculatedArea && !formData.size) {
      setFormData(prev => ({
        ...prev,
        size: String(calculatedArea.value),
        sizeUnit: calculatedArea.unit,
      }));
    }
  }, [isOpen, calculatedArea]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user && isOpen) {
      setFormData(prev => ({
        ...prev,
        ownerName: prev.ownerName || user.displayName || user.email || '',
        contact: prev.contact || user.email || '',
      }));
    }
  }, [user, isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setStepErrors([]);
      setEditingSeller(false);
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'land',
      price: '',
      size: '',
      sizeUnit: 'acres',
      placement: '',
      description: '',
      ownerName: '',
      contact: '',
      image: '',
    });
    setTypeDetails({
      waterAccess: false, electricity: false, roadAccess: false, agriculturalUse: false,
      irrigation: false, farmElectricity: false, numberOfTrees: '', buildings: false, farmRoadAccess: false,
      bedrooms: '', bathrooms: '', furnished: false, garden: false, parking: false,
    });
    setCurrentStep(1);
    setStepErrors([]);
    setEditingSeller(false);
  };

  // ─── Build features array from type-specific details ─────────────
  const buildFeatures = useCallback((): string[] => {
    const features: string[] = [];
    if (formData.type === 'land') {
      if (typeDetails.waterAccess) features.push('Water Access');
      if (typeDetails.electricity) features.push('Electricity');
      if (typeDetails.roadAccess) features.push('Road Access');
      if (typeDetails.agriculturalUse) features.push('Agricultural Use');
    } else if (formData.type === 'farm') {
      if (typeDetails.irrigation) features.push('Water/Irrigation');
      if (typeDetails.farmElectricity) features.push('Electricity');
      if (typeDetails.numberOfTrees) features.push(`${typeDetails.numberOfTrees} Trees`);
      if (typeDetails.buildings) features.push('Buildings/Structures');
      if (typeDetails.farmRoadAccess) features.push('Road Access');
    } else if (formData.type === 'house') {
      if (typeDetails.bedrooms) features.push(`${typeDetails.bedrooms} Bedrooms`);
      if (typeDetails.bathrooms) features.push(`${typeDetails.bathrooms} Bathrooms`);
      if (typeDetails.furnished) features.push('Furnished');
      if (typeDetails.garden) features.push('Garden');
      if (typeDetails.parking) features.push('Parking');
    }
    return features;
  }, [formData.type, typeDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const image = formData.image.trim() || DEFAULT_IMAGES[formData.type];

      const newProperty = {
        id: `prop-${Date.now()}`,
        title: formData.title,
        type: formData.type,
        price: Number(formData.price),
        size: Number(formData.size),
        sizeUnit: formData.sizeUnit,
        placement: formData.placement,
        description: formData.description,
        ownerName: formData.ownerName,
        contact: formData.contact,
        image,
        coordinates: coordinates,
        features: buildFeatures(),
        zoning: 'Unspecified'
      };
      MOCK_PROPERTIES.push(newProperty as any);

      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding property: ", error);
      alert("Failed to add property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Validation ────────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const errors: string[] = [];
    if (!formData.title.trim()) errors.push('Property title is required');
    if (!formData.price || Number(formData.price) <= 0) errors.push('A valid price is required');
    if (!formData.placement.trim()) errors.push('Location is required');
    if (!formData.size || Number(formData.size) <= 0) errors.push('Size is required');
    setStepErrors(errors);
    return errors.length === 0;
  };

  const validateStep2 = (): boolean => {
    // Description and image are optional in step 2
    setStepErrors([]);
    return true;
  };

  const goNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setStepErrors([]);
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const goBack = () => {
    setStepErrors([]);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const updateField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  const updateDetail = <K extends keyof typeof typeDetails>(key: K, value: (typeof typeDetails)[K]) =>
    setTypeDetails(prev => ({ ...prev, [key]: value }));

  // ─── Shared styles ─────────────────────────────────────────────────
  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus:bg-white/10 transition-all px-4 py-3 text-sm";

  // ─── Progress Indicator ────────────────────────────────────────────
  const ProgressBar = () => (
    <div className="flex items-center justify-center gap-1 px-6 py-4 border-b border-slate-100 dark:border-white/5 shrink-0">
      {STEP_LABELS.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        return (
          <div key={label} className="flex items-center">
            <button
              type="button"
              onClick={() => { if (isCompleted) setCurrentStep(stepNum); }}
              className={cn(
                "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                isActive && "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
                isCompleted && "text-emerald-500 cursor-pointer hover:bg-emerald-500/5",
                !isActive && !isCompleted && "text-slate-400 dark:text-gray-600"
              )}
              disabled={!isCompleted}
            >
              <span className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all",
                isActive && "bg-emerald-500 text-white shadow-md shadow-emerald-500/30",
                isCompleted && "bg-emerald-500 text-white",
                !isActive && !isCompleted && "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-gray-500"
              )}>
                {isCompleted ? <Check className="h-3 w-3" /> : stepNum}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
            {idx < STEP_LABELS.length - 1 && (
              <ChevronRight className={cn(
                "h-3.5 w-3.5 mx-1",
                stepNum < currentStep ? "text-emerald-400" : "text-slate-300 dark:text-gray-700"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );

  // ─── Validation Errors Banner ──────────────────────────────────────
  const ErrorBanner = () => stepErrors.length > 0 ? (
    <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10 p-3 mb-1">
      {stepErrors.map((err, i) => (
        <p key={i} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-red-400 shrink-0" />
          {err}
        </p>
      ))}
    </div>
  ) : null;



  // ─── STEP 1: Property Basics ───────────────────────────────────────
  const Step1 = () => (
    <div className="flex flex-col gap-5">
      {/* Boundary confirmation */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
          <MapPin className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Boundary Captured</h4>
          <p className="text-xs text-slate-500 dark:text-gray-400">{coordinates.length} points mapped{calculatedArea ? ` · ~${calculatedArea.value} acres` : ''}</p>
        </div>
        <Check className="h-5 w-5 text-emerald-500 shrink-0" />
      </div>

      {ErrorBanner()}

      {/* Property Type Cards */}
      <div>
        <label className="text-xs font-semibold text-slate-700 dark:text-gray-400 mb-2.5 block">
          What type of property is this?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {PROPERTY_TYPES.map(({ value, label, icon: Icon, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => updateField('type', value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all text-center",
                formData.type === value
                  ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/10 dark:bg-emerald-500/10 dark:border-emerald-500"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                formData.type === value
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-gray-400"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-sm font-semibold",
                formData.type === value
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-slate-700 dark:text-gray-300"
              )}>{label}</span>
              <span className="text-[10px] text-slate-400 dark:text-gray-600 leading-tight">{description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-semibold text-slate-700 dark:text-gray-400 mb-1.5 block">
          Property Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={e => updateField('title', e.target.value)}
          className={inputClass}
          placeholder="e.g. Sunset Valley Farm"
          autoFocus
        />
      </div>

      {/* Price + Location row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
            <DollarSign className="h-3 w-3" /> Price (USD)
          </label>
          <input
            type="number"
            min="1"
            value={formData.price}
            onChange={e => updateField('price', e.target.value)}
            className={inputClass}
            placeholder="e.g. 450,000"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
            <MapPin className="h-3 w-3" /> Location
          </label>
          <input
            type="text"
            value={formData.placement}
            onChange={e => updateField('placement', e.target.value)}
            className={inputClass}
            placeholder="e.g. Austin, TX"
          />
        </div>
      </div>

      {/* Size row */}
      <div>
        <label className="text-xs font-semibold text-slate-700 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
          <Maximize2 className="h-3 w-3" /> Property Size
          {calculatedArea && (
            <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400 ml-1">
              (auto-calculated from boundary)
            </span>
          )}
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={formData.size}
            onChange={e => updateField('size', e.target.value)}
            className={cn(inputClass, "flex-1")}
            placeholder="e.g. 10.5"
          />
          <select
            value={formData.sizeUnit}
            onChange={e => updateField('sizeUnit', e.target.value as any)}
            className={cn(inputClass, "w-[110px]")}
          >
            <option value="acres">Acres</option>
            <option value="sqft">SqFt</option>
            <option value="sqm">Sqm</option>
            <option value="hectares">Ha</option>
          </select>
        </div>
      </div>
    </div>
  );

  // ─── STEP 2: Property Details ──────────────────────────────────────
  const Step2 = () => (
    <div className="flex flex-col gap-5">
      {/* Description */}
      <div>
        <label className="text-xs font-semibold text-slate-700 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
          <FileText className="h-3 w-3" /> Description
          <span className="text-slate-400 dark:text-gray-600 font-normal">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={e => updateField('description', e.target.value)}
          className={cn(inputClass, "resize-none")}
          placeholder="Describe the property — soil type, water access, views, structures, road access…"
        />
      </div>

      {/* Cover Image */}
      <div>
        <label className="text-xs font-semibold text-slate-700 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
          <ImageIcon className="h-3 w-3" /> Cover Image
          <span className="text-slate-400 dark:text-gray-600 font-normal">(optional)</span>
        </label>
        {/* Dropzone-style area */}
        <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500/30 transition-colors p-4">
          {formData.image ? (
            <div className="flex items-center gap-3">
              <div className="h-16 w-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-white/10 shrink-0">
                <img
                  src={formData.image}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{formData.image}</p>
                <button
                  type="button"
                  onClick={() => updateField('image', '')}
                  className="text-[11px] text-red-500 hover:text-red-600 mt-1 font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <UploadCloud className="h-8 w-8 text-slate-300 dark:text-gray-600" />
              <p className="text-xs text-slate-400 dark:text-gray-500 text-center">
                Paste an image URL below, or leave empty for default
              </p>
              <input
                type="url"
                value={formData.image}
                onChange={e => updateField('image', e.target.value)}
                className={cn(inputClass, "mt-1 text-center")}
                placeholder="https://..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Type-Specific Fields */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-gray-400">
            {formData.type === 'land' ? 'Land' : formData.type === 'farm' ? 'Farm' : 'House'} Details
          </span>
          <span className="text-[10px] text-slate-400 dark:text-gray-600">(optional)</span>
        </div>

        {formData.type === 'land' && (
          <div className="grid grid-cols-2 gap-2">
            <ToggleChip label="Water Access" icon={Droplets} active={typeDetails.waterAccess} onToggle={() => updateDetail('waterAccess', !typeDetails.waterAccess)} />
            <ToggleChip label="Electricity" icon={Zap} active={typeDetails.electricity} onToggle={() => updateDetail('electricity', !typeDetails.electricity)} />
            <ToggleChip label="Road Access" icon={Route} active={typeDetails.roadAccess} onToggle={() => updateDetail('roadAccess', !typeDetails.roadAccess)} />
            <ToggleChip label="Agricultural Use" icon={Sprout} active={typeDetails.agriculturalUse} onToggle={() => updateDetail('agriculturalUse', !typeDetails.agriculturalUse)} />
          </div>
        )}

        {formData.type === 'farm' && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <ToggleChip label="Water / Irrigation" icon={Droplets} active={typeDetails.irrigation} onToggle={() => updateDetail('irrigation', !typeDetails.irrigation)} />
              <ToggleChip label="Electricity" icon={Zap} active={typeDetails.farmElectricity} onToggle={() => updateDetail('farmElectricity', !typeDetails.farmElectricity)} />
              <ToggleChip label="Buildings" icon={Building2} active={typeDetails.buildings} onToggle={() => updateDetail('buildings', !typeDetails.buildings)} />
              <ToggleChip label="Road Access" icon={Route} active={typeDetails.farmRoadAccess} onToggle={() => updateDetail('farmRoadAccess', !typeDetails.farmRoadAccess)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                <Trees className="h-3 w-3" /> Number of Trees
              </label>
              <input
                type="number"
                min="0"
                value={typeDetails.numberOfTrees}
                onChange={e => updateDetail('numberOfTrees', e.target.value)}
                className={inputClass}
                placeholder="e.g. 200"
              />
            </div>
          </div>
        )}

        {formData.type === 'house' && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <BedDouble className="h-3 w-3" /> Bedrooms
                </label>
                <input
                  type="number"
                  min="0"
                  value={typeDetails.bedrooms}
                  onChange={e => updateDetail('bedrooms', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 3"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <Bath className="h-3 w-3" /> Bathrooms
                </label>
                <input
                  type="number"
                  min="0"
                  value={typeDetails.bathrooms}
                  onChange={e => updateDetail('bathrooms', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 2"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <ToggleChip label="Furnished" icon={Sofa} active={typeDetails.furnished} onToggle={() => updateDetail('furnished', !typeDetails.furnished)} />
              <ToggleChip label="Garden" icon={Flower2} active={typeDetails.garden} onToggle={() => updateDetail('garden', !typeDetails.garden)} />
              <ToggleChip label="Parking" icon={Car} active={typeDetails.parking} onToggle={() => updateDetail('parking', !typeDetails.parking)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ─── STEP 3: Review & Publish ──────────────────────────────────────
  const Step3 = () => {
    const features = buildFeatures();
    const coverImage = formData.image.trim() || DEFAULT_IMAGES[formData.type];
    const typeConfig = PROPERTY_TYPES.find(t => t.value === formData.type)!;
    const TypeIcon = typeConfig.icon;

    return (
      <div className="flex flex-col gap-4">
        {/* Hero card */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
          <div className="h-36 bg-slate-100 dark:bg-white/5 relative">
            <img src={coverImage} alt="Cover" className="h-full w-full object-cover" />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5">
              <TypeIcon className="h-3.5 w-3.5" />
              {typeConfig.label}
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-gray-100">{formData.title || 'Untitled Property'}</h3>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500 dark:text-gray-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-base">
                {formatPrice(formData.price)}
              </span>
              <span className="text-slate-300 dark:text-gray-700">·</span>
              <span>{formData.size} {formData.sizeUnit}</span>
              <span className="text-slate-300 dark:text-gray-700">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {formData.placement || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {formData.description && (
          <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-4">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-gray-500 mb-1.5 uppercase tracking-wider">Description</h4>
            <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">{formData.description}</p>
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-4">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-gray-500 mb-2.5 uppercase tracking-wider">Features</h4>
            <div className="flex flex-wrap gap-2">
              {features.map(f => (
                <span key={f} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1 text-xs font-medium">
                  <Check className="h-3 w-3" />
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Boundary info */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 p-4 flex items-center gap-3">
          <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Boundary</h4>
            <p className="text-[11px] text-slate-500 dark:text-gray-500">{coordinates.length} points mapped</p>
          </div>
        </div>

        {/* Seller info */}
        <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-gray-500 uppercase tracking-wider">Seller</h4>
            <button
              type="button"
              onClick={() => setEditingSeller(!editingSeller)}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
            >
              <Pencil className="h-3 w-3" />
              {editingSeller ? 'Done' : 'Edit'}
            </button>
          </div>
          {editingSeller ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-gray-500 mb-1 block">Name</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={e => updateField('ownerName', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-gray-500 mb-1 block">Email / Phone</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={e => updateField('contact', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-gray-100 truncate">
                  {formData.ownerName || '—'}
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-400 truncate flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {formData.contact || '—'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Footer CTAs ───────────────────────────────────────────────────
  const Footer = () => (
    <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-white/5 shrink-0 bg-white/80 dark:bg-[#15181e]/80 backdrop-blur-sm">
      {currentStep === 1 ? (
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="flex-1 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-gray-400 dark:hover:bg-white/5 py-3 text-sm font-semibold transition-colors"
        >
          Cancel
        </button>
      ) : (
        <button
          type="button"
          onClick={goBack}
          className="flex items-center justify-center gap-1.5 flex-1 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-gray-400 dark:hover:bg-white/5 py-3 text-sm font-semibold transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
      )}

      {currentStep < 3 ? (
        <button
          type="button"
          onClick={goNext}
          className="flex items-center justify-center gap-1.5 flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/30 active:scale-[0.98]"
        >
          Continue
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-1.5 flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Publishing…
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Publish Listing
            </>
          )}
        </button>
      )}
    </div>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[2000] flex max-h-[85vh] w-full max-w-[600px] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-[#15181e] dark:text-gray-100 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 shrink-0">
            <Dialog.Title className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-gray-100">
              <MapPin className="h-5 w-5 text-emerald-500" />
              List Property
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {/* Progress */}
          {ProgressBar()}

          {/* Form body */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {currentStep === 1 && Step1()}
              {currentStep === 2 && Step2()}
              {currentStep === 3 && Step3()}
            </div>

            {/* Footer */}
            {Footer()}
          </form>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
