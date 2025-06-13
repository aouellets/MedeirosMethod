import { useState, useCallback } from 'react';

export const useProfileForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    location: '',
    date_of_birth: null,
    gender: '',
    height_cm: '',
    weight_kg: '',
    fitness_level: 'beginner',
    units_preference: 'metric',
    training_goals: [],
    preferred_workout_days: [],
    preferred_workout_time: 'morning',
    equipment_access: 'gym',
    injury_history: '',
    notifications_enabled: true,
    email_notifications: true,
    push_notifications: true,
    training_reminders: true,
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Update a single field
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Update multiple fields at once
  const updateFields = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Mark a field as touched
  const touchField = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  // Validate individual field
  const validateField = useCallback((field, value) => {
    switch (field) {
      case 'first_name':
        if (!value || value.trim().length === 0) {
          return 'First name is required';
        }
        if (value.trim().length < 2) {
          return 'First name must be at least 2 characters';
        }
        break;
        
      case 'last_name':
        if (!value || value.trim().length === 0) {
          return 'Last name is required';
        }
        if (value.trim().length < 2) {
          return 'Last name must be at least 2 characters';
        }
        break;
        
      case 'bio':
        if (value && value.length > 500) {
          return 'Bio must be less than 500 characters';
        }
        break;
        
      case 'height_cm':
        if (value && (isNaN(value) || value < 50 || value > 300)) {
          return 'Height must be between 50 and 300 cm';
        }
        break;
        
      case 'weight_kg':
        if (value && (isNaN(value) || value < 20 || value > 500)) {
          return 'Weight must be between 20 and 500 kg';
        }
        break;
        
      case 'date_of_birth':
        if (value) {
          const age = new Date().getFullYear() - new Date(value).getFullYear();
          if (age < 13) {
            return 'Must be at least 13 years old';
          }
          if (age > 120) {
            return 'Please enter a valid birth date';
          }
        }
        break;
        
      default:
        return null;
    }
    return null;
  }, []);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Required fields
    const requiredFields = ['first_name', 'last_name'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Optional but validated fields
    const optionalFields = ['bio', 'height_cm', 'weight_kg', 'date_of_birth'];
    
    optionalFields.forEach(field => {
      if (formData[field]) {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // Check if form is valid
  const isValid = useCallback(() => {
    return Object.keys(errors).length === 0 && formData.first_name && formData.last_name;
  }, [errors, formData.first_name, formData.last_name]);

  // Check if form has changes compared to initial data
  const hasChanges = useCallback(() => {
    return Object.keys(formData).some(key => {
      const currentValue = formData[key];
      const initialValue = initialData[key];
      
      // Handle different data types
      if (Array.isArray(currentValue) && Array.isArray(initialValue)) {
        return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
      }
      
      if (currentValue instanceof Date && initialValue instanceof Date) {
        return currentValue.getTime() !== initialValue.getTime();
      }
      
      return currentValue !== initialValue;
    });
  }, [formData, initialData]);

  // Reset form to initial data
  const resetForm = useCallback(() => {
    setFormData({ ...initialData });
    setErrors({});
    setTouched({});
  }, [initialData]);

  // Get formatted data for API submission
  const getFormattedData = useCallback(() => {
    return {
      ...formData,
      full_name: `${formData.first_name} ${formData.last_name}`.trim(),
      date_of_birth: formData.date_of_birth ? 
        (formData.date_of_birth instanceof Date ? 
          formData.date_of_birth.toISOString().split('T')[0] : 
          formData.date_of_birth) : 
        null,
      height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
      weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
    };
  }, [formData]);

  return {
    // Data
    formData,
    errors,
    touched,
    
    // Actions
    updateField,
    updateFields,
    touchField,
    validateField,
    validateForm,
    resetForm,
    
    // Helpers
    isValid: isValid(),
    hasChanges: hasChanges(),
    getFormattedData,
  };
}; 