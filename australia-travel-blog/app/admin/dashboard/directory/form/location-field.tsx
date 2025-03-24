'use client';

import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import MapLocationPicker from '@/components/MapLocationPicker';
import { Control } from 'react-hook-form';

interface LocationFieldProps {
  control: Control<any>;
  name: string;
  label?: string;
  required?: boolean;
}

export function LocationField({
  control,
  name,
  label = "Location",
  required = false
}: LocationFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Parse initial value from form
        const initialLocation = field.value ? {
          lat: field.value.lat || 0,
          lng: field.value.lng || 0,
          address: field.value.address || '',
        } : undefined;
        
        return (
          <FormItem className="col-span-full">
            <FormControl>
              <MapLocationPicker
                initialLocation={initialLocation}
                onLocationSelected={(location) => {
                  field.onChange(location);
                }}
                label={label}
                required={required}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
} 