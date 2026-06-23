// components/CreateBrandModal.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { createBrandSchema, type CreateBrandFormValues } from '../utils/validators';
import { PlacesAutocomplete } from './PlacesAutocomplete';
import { useGetAllCategoriesQuery } from '@/lib/features/categories/categoriesApi';
import { COUNTRIES } from '@/lib/helpers/countries';
import type { CreateBrandPayload } from '../types/brand.types';

interface CreateBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateBrandPayload) => Promise<void>;
  isSubmitting: boolean;
  /** Pass an existing brand to switch the modal into edit mode */
  initialValues?: Partial<CreateBrandFormValues>;
}

const defaultValues: CreateBrandFormValues = {
  brandName: '',
  brandEmail: '',
  mainAddress: {
    country: '',
    address: '',
    location: { type: 'Point', coordinates: [0, 0] },
  },
  category: '',
  phone: '',
};

export function CreateBrandModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialValues,
}: CreateBrandModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateBrandFormValues>({
    resolver: zodResolver(createBrandSchema),
    defaultValues: { ...defaultValues, ...initialValues },
  });

  const address = watch('mainAddress.address');
  const country = watch('mainAddress.country');
  const coordinates = watch('mainAddress.location.coordinates');

  const countryCode = COUNTRIES.find((c) => c.name === country)?.code;

  const { data: categoriesData, isLoading: categoriesLoading, isError: categoriesError } =
    useGetAllCategoriesQuery();

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const submit = async (values: CreateBrandFormValues) => {
    await onSubmit({
      brandEmail: values.brandEmail,
      brandName: values.brandName,
      mainAddress: values.mainAddress,
      category: values.category || undefined,
    });
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={initialValues ? 'Edit Brand' : 'Add Brand'}>
      <form onSubmit={handleSubmit(submit)} className="space-y-5">
        <section className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">Basic Information</h4>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Brand Name *</label>
            <input
              {...register('brandName')}
              placeholder="My Brand Store"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.brandName && <p className="mt-1 text-xs text-red-600">{errors.brandName.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Brand Email *</label>
            <input
              {...register('brandEmail')}
              type="email"
              placeholder="contact@brand.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.brandEmail && <p className="mt-1 text-xs text-red-600">{errors.brandEmail.message}</p>}
            <p className="mt-1 text-xs text-gray-500">
              The brand owner can later claim this listing by registering with this same email.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select
                {...register('category')}
                disabled={categoriesLoading}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">
                  {categoriesLoading ? 'Loading...' : categoriesError ? 'Failed to load' : 'Select a category'}
                </option>
                {categoriesData?.data.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                {...register('phone')}
                placeholder="+234..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-gray-100 pt-4">
          <h4 className="text-sm font-semibold text-gray-900">Location</h4>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Country *</label>
            <select
              {...register('mainAddress.country')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a country</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.mainAddress?.country && (
              <p className="mt-1 text-xs text-red-600">{errors.mainAddress.country.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Full Address *</label>
            <PlacesAutocomplete
              value={address}
              onChange={(val) => setValue('mainAddress.address', val, { shouldValidate: true })}
              onPlaceSelect={(addr, lat, lng) => {
                setValue('mainAddress.address', addr, { shouldValidate: true });
                setValue('mainAddress.location.coordinates', [lng, lat], { shouldValidate: true });
              }}
              placeholder="123 Main Street, Lagos"
              error={errors.mainAddress?.address?.message}
              countryCode={countryCode}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Latitude *</label>
              <input
                type="number"
                step="any"
                value={coordinates[1] || ''}
                onChange={(e) =>
                  setValue('mainAddress.location.coordinates', [coordinates[0], Number(e.target.value)], {
                    shouldValidate: true,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Longitude *</label>
              <input
                type="number"
                step="any"
                value={coordinates[0] || ''}
                onChange={(e) =>
                  setValue('mainAddress.location.coordinates', [Number(e.target.value), coordinates[1]], {
                    shouldValidate: true,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          {errors.mainAddress?.location?.coordinates && (
            <p className="text-xs text-red-600">{errors.mainAddress.location.coordinates.message as string}</p>
          )}
        </section>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {initialValues ? 'Save Changes' : 'Create Brand'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
