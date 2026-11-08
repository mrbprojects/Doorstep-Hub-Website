'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getCategories,
  getCities,
  getCountries,
  getServices,
  getStates,
  getSubcategories,
} from '@/lib/providerAuthApi';

function stateModel() {
  return { options: [], loading: false, error: '' };
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled,
  loading,
  error,
  onRetry,
  className = '',
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-wider text-white/60">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled || loading}
        className={`w-full h-9 rounded-md border border-white/20 bg-white/5 px-2 text-sm text-white focus:border-[#04a99d] focus:ring-1 focus:ring-[#04a99d] transition-all disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      >
        <option value="" className="bg-[#1a1a1a]">{loading ? 'Loading...' : placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id} className="bg-[#1a1a1a]">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <button
          type="button"
          onClick={onRetry}
          className="text-[10px] text-red-400 hover:underline"
        >
          Error loading {label.toLowerCase()}. Tap to retry.
        </button>
      )}
    </div>
  );
}

export function RegisterPage({ token, phone, onSubmit, loading, error }) {
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone,
    serviceId: '',
    serviceName: '',
    categoryId: '',
    categoryName: '',
    subcategoryId: '',
    subcategoryName: '',
    countryId: '',
    countryName: '',
    stateId: '',
    stateName: '',
    cityId: '',
    cityName: '',
  });
  const [lists, setLists] = useState({
    services: stateModel(),
    categories: stateModel(),
    subcategories: stateModel(),
    countries: stateModel(),
    states: stateModel(),
    cities: stateModel(),
  });

  useEffect(() => {
    queueMicrotask(() => {
      setForm((prev) => ({ ...prev, phone }));
    });
  }, [phone]);

  function updateList(key, next) {
    setLists((prev) => ({ ...prev, [key]: { ...prev[key], ...next } }));
  }

  const loadList = useCallback(async (key, loader) => {
    updateList(key, { loading: true, error: '' });
    try {
      const options = await loader();
      updateList(key, { loading: false, error: '', options });
    } catch (err) {
      updateList(key, { loading: false, options: [], error: err.message || 'Failed to load' });
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadList('services', getServices);
      loadList('countries', () => getCountries(token));
    });
  }, [loadList, token]);

  useEffect(() => {
    if (!form.serviceId) return;
    queueMicrotask(() => {
      loadList('categories', () => getCategories(form.serviceId));
    });
  }, [form.serviceId, loadList]);

  useEffect(() => {
    if (!form.categoryId) return;
    queueMicrotask(() => {
      loadList('subcategories', () => getSubcategories(form.categoryId));
    });
  }, [form.categoryId, loadList]);

  useEffect(() => {
    if (!form.countryId) return;
    queueMicrotask(() => {
      loadList('states', () => getStates(token, form.countryId));
    });
  }, [form.countryId, loadList, token]);

  useEffect(() => {
    if (!form.countryId || !form.stateId) return;
    queueMicrotask(() => {
      loadList('cities', () => getCities(token, form.countryId, form.stateId));
    });
  }, [form.countryId, form.stateId, loadList, token]);

  function pick(name, labelName, options, value, resets, clearLists) {
    const selected = options.find((entry) => entry.id === value);
    setForm((prev) => ({
      ...prev,
      [name]: value,
      [labelName]: selected?.label || '',
      ...resets,
    }));
    setLists((prev) => {
      const next = { ...prev };
      clearLists.forEach((key) => {
        next[key] = { ...next[key], options: [], error: '' };
      });
      return next;
    });
  }

  function validate() {
    if (!form.name.trim()) return 'Name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Valid email is required.';
    if (!/^[6-9]\d{9}$/.test(form.phone)) return 'Valid mobile number is required.';
    if (!form.serviceId || !form.categoryId || !form.subcategoryId) return 'Select service, category and subcategory.';
    if (!form.countryId || !form.stateId || !form.cityId) return 'Select country, state and city.';
    return '';
  }

  async function submit(event) {
    event.preventDefault();
    const message = validate();
    if (message) {
      setFormError(message);
      return;
    }
    setFormError('');
    await onSubmit(form);
  }

  const canSubmit =
    form.name &&
    form.email &&
    form.phone &&
    form.serviceId &&
    form.categoryId &&
    form.subcategoryId &&
    form.countryId &&
    form.stateId &&
    form.cityId;

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="space-y-1">
        <h2 className="text-xl font-black text-white">Business Details</h2>
        <p className="text-xs text-white/50">Complete your profile to join our partner network.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/60">Name</label>
          <Input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Full name"
            className="h-9 text-sm border-white/20 bg-white/5 text-white placeholder:text-white/40"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/60">Email</label>
          <Input
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="Email address"
            className="h-9 text-sm border-white/20 bg-white/5 text-white placeholder:text-white/40"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField
          id="service"
          label="Service"
          value={form.serviceId}
          options={lists.services.options}
          onChange={(event) =>
            pick('serviceId', 'serviceName', lists.services.options, event.target.value, {
              categoryId: '', categoryName: '', subcategoryId: '', subcategoryName: '',
            }, ['categories', 'subcategories'])
          }
          placeholder="Select"
          loading={lists.services.loading}
          error={lists.services.error}
          onRetry={() => loadList('services', getServices)}
        />
        <SelectField
          id="category"
          label="Category"
          value={form.categoryId}
          options={lists.categories.options}
          onChange={(event) =>
            pick('categoryId', 'categoryName', lists.categories.options, event.target.value, {
              subcategoryId: '', subcategoryName: '',
            }, ['subcategories'])
          }
          placeholder="Select"
          disabled={!form.serviceId}
          loading={lists.categories.loading}
          error={lists.categories.error}
          onRetry={() => loadList('categories', () => getCategories(form.serviceId))}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField
          id="subcategory"
          label="Subcategory"
          value={form.subcategoryId}
          options={lists.subcategories.options}
          onChange={(event) => pick('subcategoryId', 'subcategoryName', lists.subcategories.options, event.target.value, {}, [])}
          placeholder="Select"
          disabled={!form.categoryId}
          loading={lists.subcategories.loading}
          error={lists.subcategories.error}
          onRetry={() => loadList('subcategories', () => getSubcategories(form.categoryId))}
        />
        <SelectField
          id="country"
          label="Country"
          value={form.countryId}
          options={lists.countries.options}
          onChange={(event) =>
            pick('countryId', 'countryName', lists.countries.options, event.target.value, {
              stateId: '', stateName: '', cityId: '', cityName: '',
            }, ['states', 'cities'])
          }
          placeholder="Select"
          loading={lists.countries.loading}
          error={lists.countries.error}
          onRetry={() => loadList('countries', () => getCountries(token))}
          className="text-white !opacity-100"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField
          id="state"
          label="State"
          value={form.stateId}
          options={lists.states.options}
          onChange={(event) =>
            pick('stateId', 'stateName', lists.states.options, event.target.value, {
              cityId: '', cityName: '',
            }, ['cities'])
          }
          placeholder="Select"
          disabled={!form.countryId}
          loading={lists.states.loading}
          error={lists.states.error}
          onRetry={() => loadList('states', () => getStates(token, form.countryId))}
        />
        <SelectField
          id="city"
          label="City"
          value={form.cityId}
          options={lists.cities.options}
          onChange={(event) => pick('cityId', 'cityName', lists.cities.options, event.target.value, {}, [])}
          placeholder="Select"
          disabled={!form.stateId}
          loading={lists.cities.loading}
          error={lists.cities.error}
          onRetry={() => loadList('cities', () => getCities(token, form.countryId, form.stateId))}
        />
      </div>

      {(formError || (error && !error.includes('User ID'))) ? <p className="text-xs text-red-400 font-medium">{formError || error}</p> : null}

      <Button
        type="submit"
        disabled={loading || !canSubmit}
        className="w-full h-10 bg-[#04a99d] text-white font-bold hover:bg-[#037166] shadow-lg shadow-[#04a99d]/20 mt-2"
      >
        {loading ? 'Completing Registration...' : 'Complete Registration'}
      </Button>
    </form>
  );
}
