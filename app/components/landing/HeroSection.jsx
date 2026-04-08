// 'use client';

// import React, { useEffect, useState } from 'react';
// import { motion } from 'motion/react';
// import { Sparkles } from 'lucide-react';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';

// /* ---------- IMAGE LOADER ---------- */
// const imageLoader = ({ src }) => {
//   return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${src}`;
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
//                 sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 14vw"
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
//     <section className="relative min-h-screen flex items-center justify-center overflow-x-hidden pt-20">
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
//           : `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/all-services`;

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
import { Sparkles, Download,Zap ,Shield ,Star  } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

/* ---------- IMAGE LOADER ---------- */
const imageLoader = ({ src }) => {
  return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${src}`;
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
    // Store service details in localStorage
    localStorage.setItem('selectedService', JSON.stringify({
      id: service._id,
      name: service.name,
      servicetypeName: service.servicetypeName || service.name,
      image: service.image
    }));

    // Generate fallback slug from name
    let slug = service.name ? service.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : service._id;

    // Use dynamic slugs for hubs
    const upperName = service.name ? service.name.toUpperCase() : '';
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
      className="mt-6 sm:mt-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
    >
      <div className="flex flex-wrap justify-center gap-2 min-[400px]:gap-3 sm:gap-6">
        {services.map((service, index) => {
          const isActive = index === activeIndex;
          const isAppliance = (service.name || '').toUpperCase().includes('APPLIANCE');
          return (
            <motion.div
              key={service._id}
              variants={cardVariants}
              onClick={() => handleServiceClick(service)}
              className={`group relative transition-all duration-500 w-[17vw] max-w-[75px] sm:max-w-none sm:w-24 flex-shrink-0 cursor-pointer`}
            >
              <div
                className={`
                  relative aspect-square rounded-xl overflow-hidden bg-transparent border-2 
                  transition-all duration-500
                  ${isActive
                    ? 'border-[#007367] scale-110 shadow-[0_0_20px_rgba(3,113,102,0.2)]'
                    : 'border-transparent hover:border-[#007367]/30 hover:scale-105'}
                `}
              >
                <Image
                  loader={imageLoader}
                  src={service.image}
                  alt={service.name}
                  fill
                  className={`object-cover transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                  sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 14vw"
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

              <h5 className={`text-[10px] min-[400px]:text-[11px] sm:text-[15px] leading-[1.2] mt-1 sm:mt-2 font-medium text-center line-clamp-2 transition-colors duration-300 ${isActive ? 'text-[#04a99d]' : 'text-[#007367] group-hover:text-[#04a99d]'}`}>
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
    appliances: 'appliance-repair-services',
    religious: 'religious-services',
    spa: 'spa-salon',
    pg: 'pghostels'
  });

  // Fetch Service Slugs (only appliance ID is supported by this endpoint)
  useEffect(() => {
    const fetchSlugs = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/get_slugs_by_serviceId/683daaa8f261c1548bdf7442`
        );
        const data = await res.json();
        if (data.success && data.data?.home) {
          setServiceSlugs(prev => ({ ...prev, appliances: data.data.home }));
        }
      } catch (e) {
        console.warn('Failed to fetch appliance slug, using default:', e);
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


  const videoRef = React.useRef(null);
  const appLinks = {
    android: 'https://play.google.com/store/apps/details?id=com.doorstephub.customer&pcampaignid=web_share',
    ios: 'https://apps.apple.com/in/app/doorstep-hub/id6475340236'
  };

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

  return (
    <section className="relative min-h-[85dvh] flex items-center justify-center overflow-x-hidden pt-16 pb-0 sm:pt-20 sm:pb-0">
      {/* Latest Booking Background */}
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
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#037166]/40 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: -mousePosition.x * 0.02,
            y: -mousePosition.y * 0.02,
          }}
          transition={{ type: 'spring', damping: 30 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#025951]/40 rounded-full blur-[120px]"
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
            className="inline-flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#037166]/10 border border-[#037166]/30 rounded-full mb-4 sm:mb-8 max-w-full"
          >
            <Sparkles className="w-4 h-4 text-[#037166] shrink-0" />
            <h6 className="text-[10px] sm:text-xs md:text-sm bg-gradient-to-r from-[#037166] to-[#ff6b35] bg-clip-text text-transparent font-medium line-clamp-1 sm:line-clamp-none">
              We are Committed to Provide you a Safe Service Experience
            </h6>
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 italic leading-[1.1]">
            {/* SVG Text for Stroke Animation */}

            <span className="block text-white-900 drop-shadow-sm">Everything You Need.</span>

                           

            <motion.span
              key={activeIndex} // Triggers animation on change
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="block mt-1 sm:mt-2 bg-gradient-to-r from-[#037166] to-[#ff6b35] bg-clip-text text-transparent min-h-[1.2em]"
            >
              {services.length > 0 ? services[activeIndex]?.name : "One Hub."}
            </motion.span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-base sm:text-lg md:text-xl text-white-700 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed"
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

          {/* Download Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-wrap justify-center gap-4 mt-8 mb-4 relative z-20"
          >
            <a href={appLinks.android} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-36 xs:w-44 md:w-38 h-12 xs:h-14 md:h-13 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden border border-white/10" title="Get it on Google Play">
              <img src="/andriod1.png" alt="Google Play" className="h-full w-full object-cover brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" />
            </a>
            <a href={appLinks.ios} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-36 xs:w-44 md:w-38 h-12 xs:h-14 md:h-13 bg-gradient-to-r from-[#037166] to-[#04a99d] rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden border border-white/10" title="Download on the App Store">
              <img src="/apple2.png" alt="App Store" className="h-full w-full object-cover brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" />
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
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
          : `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/applience-repairs-website/all-services`;

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

