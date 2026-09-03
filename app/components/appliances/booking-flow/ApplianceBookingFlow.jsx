'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CityWiseCenters } from './CityWiseCenters';
import { FranchiseSection } from './FranchiseSection';
import { cities as mockCities } from './data';
import { fetchCities } from '@/lib/api';
import { buildApplianceRepairCityPublicPath } from '@/lib/applianceRepairSlugs';

export function ApplianceBookingFlow() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function loadCities() {
      try {
        setLoading(true);
        const citiesData = await fetchCities(debouncedQuery);

        // Map API response to the structure expected by CityWiseCenters
        const mappedCities = citiesData.map((c) => ({
          name: c.name,
          slug: c.slug || c.name?.toLowerCase().replace(/\s+/g, '-'),
          centers: c.serviceCenterCount || 0,
          area: c.state_name || "Service Area",
          icon: c.image 
            ? (c.image.startsWith('http') ? c.image : `https://devapis.doorstephub.com${c.image}`)
            : null,
          id: c._id,
          lat: c.latitude,
          lng: c.longitude,
          domain: c.domain
        }));
        
        setCities(mappedCities);
      } catch (err) {
        console.error("Error loading cities:", err);
        setError(err.message);
        // Only fallback to mock data on initial load if API fails
        if (!debouncedQuery) {
          setCities(mockCities);
        } else {
          setCities([]); // No results for search if API fails
        }
      } finally {
        setLoading(false);
      }
    }

    loadCities();
  }, [debouncedQuery]);

  const handleSelectCity = (city) => {
    setSelectedCity(city);
    const slug = city.slug || city.name?.toLowerCase().replace(/\s+/g, '-');
    let publicPath = buildApplianceRepairCityPublicPath(slug);

    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const match = pathname.match(/^\/([a-z0-9-]+)-service-center-[a-z0-9-]+$/i);
      if (match && match[1]) {
        const catPart = match[1];
        if (catPart !== 'appliances-repair') {
          publicPath = `/${catPart}-service-center-${slug}`;
        }
      }
    }

    if (city.domain && slug) {
      const base = city.domain.endsWith('/') ? city.domain.slice(0, -1) : city.domain;
      window.location.href = `${base}${publicPath}`;
    } else {
      router.push(publicPath);
    }
  };

  return (
    <div className="bg-transparent w-full">
      <CityWiseCenters 
        cities={cities} 
        selectedCity={selectedCity} 
        onSelectCity={handleSelectCity} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        loading={loading}
      />
      
      {/* <FranchiseSection /> */}
    </div>
  );
}

