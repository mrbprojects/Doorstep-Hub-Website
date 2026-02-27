// 'use client';

// import React, { useEffect, useState } from 'react';
// import { motion } from 'motion/react';
// import { Sparkles } from 'lucide-react';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';

// /* ---------- IMAGE LOADER ---------- */
// const imageLoader = ({ src }) => {
//   return `https://api.doorstephub.com/${src}`;
// };

// /* ---------- SERVICE NAME TO SLUG MAPPING ---------- */
// const serviceSlugMap = {
//   'APPLIANCE SERVICE': 'appliances',
//   'PG Hostels': 'pg-hostel',
//   'Religious Services': 'religious',
//   'Spa Salons': 'spa-salon',
//   'Daily Needs': 'daily-needs',
//   'MEDICINE': 'medicine',
//   'PARCEL': 'parcel',
// };

// /* ---------- COMPACT SERVICES SECTION ---------- */
// function ServiceCardsSection({ services, loading }) {
//   const router = useRouter();

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { staggerChildren: 0.05 },
//     },
//   };

//   const cardVariants = {
//     hidden: { opacity: 0, scale: 0.9 },
//     visible: {
//       opacity: 1,
//       scale: 1,
//       transition: { duration: 0.4, ease: 'easeOut' },
//     },
//   };

//   const handleServiceClick = (serviceName) => {
//     const slug = serviceSlugMap[serviceName] || serviceName.toLowerCase().replace(/\s+/g, '-');
//     router.push(`/${slug}`);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center py-8">
//         <p className="text-gray-400">Loading services...</p>
//       </div>
//     );
//   }

//   if (!services || services.length === 0) {
//     return null;
//   }

//   return (
//     <motion.div
//       variants={containerVariants}
//       initial="hidden"
//       animate="visible"
//       className="mt-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
//     >
//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
//         {services.map((service, index) => (
//           <motion.div
//             key={service._id}
//             variants={cardVariants}
//             onClick={() => handleServiceClick(service.name)}
//             className="group cursor-pointer"
//           >
//             <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border border-white/10 hover:border-[#037166]/50 transition-all duration-300 hover:scale-105">
//               <Image
//                 loader={imageLoader}
//                 src={service.image}
//                 alt={service.name}
//                 fill
//                 className="object-cover transition-transform duration-300 group-hover:scale-110"
//                 sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 14vw"
//               />
//               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

//               {/* Service Name Overlay */}
//               <div className="absolute bottom-0 left-0 right-0 p-3">

//               </div>

//               {/* Hover Glow */}
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 whileHover={{ opacity: 1 }}
//                 className="absolute inset-0 bg-gradient-to-t from-[#037166]/30 to-transparent"
//               />
//             </div>



//             <p className="text-white text-xs font-medium text-center line-clamp-2 group-hover:text-[#04a99d] transition-colors">
//               {service.name}
//             </p>
//           </motion.div>
//         ))}
//       </div>
//     </motion.div>
//   );
// }

// /* ---------- HERO SECTION ---------- */
// function HeroContent({ services = [], loading = false, error = null }) {
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       setMousePosition({ x: e.clientX, y: e.clientY });
//     };
//     window.addEventListener('mousemove', handleMouseMove);
//     return () => window.removeEventListener('mousemove', handleMouseMove);
//   }, []);

//   return (
//     <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
//       {/* Animated Background */}
//       <div className="absolute inset-0">
//         {/* Grid Pattern */}
//         <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

//         {/* Gradient Orbs */}
//         <motion.div
//           animate={{
//             x: mousePosition.x * 0.02,
//             y: mousePosition.y * 0.02,
//           }}
//           transition={{ type: 'spring', damping: 30 }}
//           className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#037166]/20 rounded-full blur-[100px]"
//         />
//         <motion.div
//           animate={{
//             x: -mousePosition.x * 0.015,
//             y: -mousePosition.y * 0.015,
//           }}
//           transition={{ type: 'spring', damping: 30 }}
//           className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#025951]/20 rounded-full blur-[100px]"
//         />
//       </div>

//       {/* Main Content */}
//       <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//         >
//           {/* Eyebrow */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.2 }}
//             className="inline-flex items-center space-x-2 px-4 py-2 bg-[#037166]/10 border border-[#037166]/30 rounded-full mb-8"
//           >
//             <Sparkles className="w-4 h-4 text-[#037166]" />
//             <span className="text-sm text-[#037166] font-medium">Welcome to the Future of Services</span>
//           </motion.div>

//           {/* Main Heading */}
//           <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
//             <span className="block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
//               Everything You Need.
//             </span>
//             <span className="block mt-2 bg-gradient-to-r from-[#037166] via-[#02b39a] to-[#037166] bg-clip-text text-transparent">
//               One Hub.
//             </span>
//           </h1>

//           {/* Subtitle */}
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.7 }}
//             className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
//           >
//             Your premium gateway to services, spa, salon, hostels, religious experiences, and more.
//             All in one beautifully crafted platform.
//           </motion.p>

//           {/* Service Cards - Right Below Subtitle */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.9 }}
//           >
//             {error ? (
//               <div className="mt-12 text-center">
//                 <p className="text-red-400 text-sm mb-2">{error}</p>
//                 <button
//                   onClick={() => window.location.reload()}
//                   className="text-[#04a99d] hover:text-[#037166] text-sm underline"
//                 >
//                   Retry
//                 </button>
//               </div>
//             ) : (
//               <ServiceCardsSection services={services} loading={loading} />
//             )}
//           </motion.div>
//         </motion.div>
//       </div>

//       {/* Bottom Gradient */}
//       <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
//     </section>
//   );
// }

// /* ---------- HERO + SERVICES (API INTEGRATION HERE) ---------- */
// export function HeroSection() {
//   const [services, setServices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchServices = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
//           ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_ALL_SERVICES_ENDPOINT}`
//           : 'https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/all-services';

//         const response = await fetch(apiUrl, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`API Error: ${response.status} ${response.statusText}`);
//         }

//         const data = await response.json();

//         // Validate API response structure
//         if (!data || typeof data !== 'object') {
//           throw new Error('Invalid API response format');
//         }

//         if (data.success && Array.isArray(data.data) && data.data.length > 0) {
//           setServices(data.data);
//         } else if (data.success && (!data.data || data.data.length === 0)) {
//           console.warn('API returned success but no services data');
//           setServices([]);
//         } else {
//           throw new Error(data.message || 'Failed to fetch services');
//         }
//       } catch (error) {
//         console.error('Error fetching services:', error);
//         setError(error.message || 'Failed to load services. Please try again later.');
//         setServices([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchServices();
//   }, []);

//   return <HeroContent services={services} loading={loading} error={error} />;
// }

// export default HeroSection;




'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

/* ---------- IMAGE LOADER ---------- */
const imageLoader = ({ src }) => {
  return `https://api.doorstephub.com/${src}`;
};

/* ---------- COMPACT SERVICES SECTION ---------- */
function ServiceCardsSection({ services, loading, activeIndex, serviceSlugs }) {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  // ✅ FIXED: Pass full service object, not just serviceName
  const handleServiceClick = (service) => {
    // Store service ID and details in localStorage
    localStorage.setItem('selectedService', JSON.stringify({
      id: service._id,
      name: service.name,
      servicetypeName: service.servicetypeName || service.name,
      image: service.image
    }));

    // Generate slug from service.name
    let slug = service.name.toLowerCase().replace(/\s+/g, '-');

    // Use dynamic slugs for specific services
    const upperName = service.name.toUpperCase();
    if (upperName.includes('APPLIANCE')) slug = serviceSlugs.appliances;
    else if (upperName.includes('RELIGIOUS')) slug = serviceSlugs.religious;
    else if (upperName.includes('PG')) slug = serviceSlugs.pg;
    else if (upperName.includes('SPA')) slug = serviceSlugs.spa;

    router.push(`/${slug}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-gray-400">Loading services...</p>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return null;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mt-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="flex flex-wrap justify-center gap-4">
        {services.map((service, index) => {
          const isActive = index === activeIndex;
          return (
            <motion.div
              key={service._id}
              variants={cardVariants}
              // ✅ FIXED: Pass full service object
              onClick={() => handleServiceClick(service)}
              className={`group cursor-pointer w-[calc(50%-0.6rem)] sm:w-[calc(33.333%-0.7rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(14.28%-0.9rem)] transition-all duration-500`}
            >
              <div
                className={`
                  relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f1614] border 
                  transition-all duration-500
                  ${isActive
                    ? 'border-[#037166] scale-110 shadow-[0_0_20px_rgba(3,113,102,0.4)]'
                    : 'border-white/10 hover:border-[#037166]/50 hover:scale-105'}
                `}
              >
                <Image
                  loader={imageLoader}
                  src={service.image}
                  alt={service.name}
                  fill
                  className={`object-cover transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 14vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Service Name Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  {/* Empty overlay preserved */}
                </div>

                {/* Hover Glow */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-t from-[#037166]/30 to-transparent"
                />
              </div>

              <h5 className={`text-xs mt-2 font-medium text-center line-clamp-2 transition-colors duration-300 ${isActive ? 'text-[#04a99d]' : 'text-white group-hover:text-[#04a99d]'}`}>
                {service.name}
              </h5>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ---------- HERO SECTION ---------- */
function HeroContent({ services = [], loading = false, error = null }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [serviceSlugs, setServiceSlugs] = useState({
    appliances: 'appliances',
    religious: 'religious-services',
    spa: 'spa-salon',
    pg: 'pghostels'
  });

  // Fetch Service Slugs
  useEffect(() => {
    const fetchSlugs = async () => {
      const services = [
        { id: '683daaa8f261c1548bdf7442', key: 'appliances' },
        { id: '695250aa57bb211ca094e5fd', key: 'religious' },
        { id: '69524f4a57bb211ca094e5e6', key: 'spa' },
        { id: '69524fb157bb211ca094e5ee', key: 'pg' }
      ];

      try {
        const results = await Promise.all(
          services.map(s =>
            fetch(`https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/get_slugs_by_serviceId/${s.id}`)
              .then(res => res.json())
              .then(data => data.success && data.data?.home ? { [s.key]: data.data.home } : null)
              .catch(() => null)
          )
        );

        const newSlugs = {};
        results.forEach(res => {
          if (res) Object.assign(newSlugs, res);
        });

        if (Object.keys(newSlugs).length > 0) {
          setServiceSlugs(prev => ({ ...prev, ...newSlugs }));
        }
      } catch (error) {
        console.error("Failed to fetch service slugs:", error);
      }
    };
    fetchSlugs();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-rotation Logic
  useEffect(() => {
    if (!services || services.length === 0 || isPaused) return;

    const intervalId = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % services.length);
    }, 1000); // Change every 1 second

    return () => clearInterval(intervalId);
  }, [services, isPaused]); // Re-run if services load/change or pause state changes

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Standardized Architectural World Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d12] to-[#0a0a0a]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(3,113,102,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(3,113,102,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Gradient Orbs - Intensified */}
        <motion.div
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
          transition={{ type: 'spring', damping: 30 }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#037166]/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: -mousePosition.x * 0.02,
            y: -mousePosition.y * 0.02,
          }}
          transition={{ type: 'spring', damping: 30 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#025951]/20 rounded-full blur-[120px]"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#037166]/10 border border-[#037166]/30 rounded-full mb-8 max-w-full"
          >
            <Sparkles className="w-4 h-4 text-[#037166] shrink-0" />
            <h6 className="text-[10px] sm:text-xs md:text-sm bg-gradient-to-r from-[#037166] to-[#ff6b35] bg-clip-text text-transparent font-medium line-clamp-1 sm:line-clamp-none">
              We are Committed to Provide you a Safe Service Experience
            </h6>
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-6xl font-bold mb-6 italic">
            {/* SVG Text for Stroke Animation */}

            <span className="block bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Everything You Need.</span>



            <motion.span
              key={activeIndex} // Triggers animation on change
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="block mt-2 bg-gradient-to-r from-[#037166] to-[#ff6b35] bg-clip-text text-transparent min-h-[1.2em]"
            >
              {services.length > 0 ? services[activeIndex]?.name : "One Hub."}
            </motion.span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
          >
            Your Premium Gateway to Appliance Services, Spa & Saloon, PG & Hostels, Religious Services, and More.
            A Smarter Way to Access Trusted Services.
          </motion.p>

          {/* Tour Trigger Button */}


          {/* Service Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {error ? (
              <div className="mt-12 text-center">
                <p className="text-red-400 text-sm mb-2">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-[#04a99d] hover:text-[#037166] text-sm underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <ServiceCardsSection services={services} loading={loading} activeIndex={activeIndex} serviceSlugs={serviceSlugs} />
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
    </section >
  );
}

/* ---------- MAIN EXPORT ---------- */
export function HeroSection() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_ALL_SERVICES_ENDPOINT}`
          : 'https://api.doorstephub.com/v1/dhubApi/app/applience-repairs-website/all-services';

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data || typeof data !== 'object') {
          throw new Error('Invalid API response format');
        }

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setServices(data.data);
        } else if (data.success && (!data.data || data.data.length === 0)) {
          console.warn('API returned success but no services data');
          setServices([]);
        } else {
          throw new Error(data.message || 'Failed to fetch services');
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        setError(error.message || 'Failed to load services. Please try again later.');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return <HeroContent services={services} loading={loading} error={error} />;
}

export default HeroSection;
