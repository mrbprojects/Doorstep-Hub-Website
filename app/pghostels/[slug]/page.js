'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NewHostelDetailPage from '@/pghostels/hostel-detail/[slug]/page';
import PGSubcategoryPage from '../subcategory/[slug]/page';
import { resolveParam } from '@/utils/slugHelper';

const PG_SERVICE_ID = '69524fb157bb211ca094e5ee';

function getImageUrl(image) {
    if (!image) return null;
    return image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${image}`;
}

function PGSubcategoryListingsPage({ subcategory }) {
    const router = useRouter();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const fetchListings = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/professional-services`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        serviceId: PG_SERVICE_ID,
                        ...resolveParam(subcategory.slug || subcategory._id, 'subcategoryId', 'subcategorySlug'),
                        lattitude: '17.4483',
                        longitude: '78.3915',
                    }),
                });
                const data = await response.json();
                if (!active) return;
                setListings(data.success && Array.isArray(data.professionalServices) ? data.professionalServices : []);
            } catch (error) {
                console.error('Failed to fetch PG subcategory listings', error);
                if (active) setListings([]);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchListings();

        return () => {
            active = false;
        };
    }, [subcategory]);

    return (
        <div className="min-h-screen bg-[#fffdf7] text-gray-950">
            <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3c36] via-[#147469] to-[#f0a64c] pt-32 pb-24">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0d3c36] via-[#147469] to-[#f0a64c] opacity-10" />
                <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
                    >
                        Back to Subcategories
                    </button>
                    <h1 className="mx-auto max-w-5xl text-4xl font-black tracking-tight text-white drop-shadow-lg md:text-6xl">
                        {subcategory.name || 'PG & Hostel Listings'}
                    </h1>
                    <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/90 md:text-xl">
                        Verified PG and hostel listings for this stay type.
                    </p>
                </div>
            </section>

            <section className="relative z-20 mx-auto -mt-16 max-w-7xl px-4 pb-24">
                {loading && (
                    <div className="rounded-[2rem] bg-white px-6 py-10 text-center text-gray-600 shadow-xl">
                        Loading listings...
                    </div>
                )}

                {!loading && listings.length === 0 && (
                    <div className="rounded-[2rem] bg-white px-6 py-10 text-center text-gray-600 shadow-xl">
                        No listings found for this subcategory.
                    </div>
                )}

                {!loading && listings.length > 0 && (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {listings.map((listing) => {
                            const name = listing.business_name || `${listing.firstName || ''} ${listing.lastName || ''}`.trim() || 'PG & Hostel';
                            const image = getImageUrl(listing.image || listing.logo);
                            return (
                                <button
                                    key={listing._id}
                                    type="button"
                                    onClick={() => router.push(`/pghostels/${listing.slug || listing._id}`)}
                                    className="group relative cursor-pointer text-left"
                                >
                                    <div className="absolute inset-0 top-4 rounded-[2rem] bg-[#f0a64c] opacity-20 blur transition-opacity group-hover:opacity-40" />
                                    <div className="relative h-full overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-4 shadow-xl transition-transform duration-300 group-hover:-translate-y-2">
                                        <div className="relative mb-6 h-56 overflow-hidden rounded-[1.5rem] bg-[#eef3f2]">
                                            {image && <img src={image} alt={name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                            <h3 className="absolute bottom-4 left-4 right-4 text-2xl font-black text-white">{name}</h3>
                                        </div>
                                        <p className="mb-4 line-clamp-2 px-2 text-sm leading-7 text-gray-600">
                                            {listing.bio || listing.address || 'Explore details, amenities, and booking options.'}
                                        </p>
                                        <div className="flex items-center justify-between px-2 pb-2 text-sm font-bold text-[#147469]">
                                            <span>{listing.rating || '4.5'} rating</span>
                                            <span>{listing.startingAt || listing.minFare ? `from ₹${Number(listing.startingAt || listing.minFare).toLocaleString()}` : 'View details'}</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

export default function PGHostelSlugPage({ params: propParams }) {
    const routeParams = useParams();
    const slug = propParams?.slug || routeParams.slug;
    const [mode, setMode] = useState('loading');
    const [resolvedSubcategory, setResolvedSubcategory] = useState(null);

    useEffect(() => {
        let active = true;

        const resolveSlug = async () => {
            try {
                const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serviceId: PG_SERVICE_ID }),
                });
                const categoriesData = await categoriesResponse.json();

                if (!active) return;

                const categories = categoriesData.category || categoriesData.categories || categoriesData.data || [];
                const matchedCategory = Array.isArray(categories)
                    ? categories.find((category) =>
                        category?._id === slug ||
                        (category?.slug && category.slug.toLowerCase() === slug.toLowerCase())
                    )
                    : null;

                if (matchedCategory) {
                    setMode('subcategory');
                    return;
                }

                if (Array.isArray(categories)) {
                    for (const category of categories) {
                        const subcategoryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/subcategories`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ categorySlug: category.slug, serviceId: PG_SERVICE_ID }),
                        });
                        const subcategoryData = await subcategoryResponse.json();
                        if (!active) return;

                        if (subcategoryData.success && Array.isArray(subcategoryData.data)) {
                            const matchedSubcategory = subcategoryData.data.find((subcategory) =>
                                subcategory?._id === slug ||
                                (subcategory?.slug && subcategory.slug.toLowerCase() === slug.toLowerCase())
                            );

                            if (matchedSubcategory) {
                                setResolvedSubcategory(matchedSubcategory);
                                setMode('subcategoryListing');
                                return;
                            }
                        }
                    }
                }

                const payload = {
                    ...resolveParam(slug, 'categoryId', 'categorySlug'),
                    serviceId: PG_SERVICE_ID,
                };
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/app/professional-services-flow/public/subcategories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const data = await response.json();

                if (!active) return;

                if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                    setMode('subcategory');
                    return;
                }

                setMode('detail');
            } catch (error) {
                console.error('Failed to resolve PG slug', error);
                if (active) setMode('detail');
            }
        };

        if (slug) resolveSlug();

        return () => {
            active = false;
        };
    }, [slug]);

    if (mode === 'loading') {
        return <div className="min-h-screen bg-white" />;
    }

    if (mode === 'subcategory') {
        return <PGSubcategoryPage />;
    }

    if (mode === 'subcategoryListing' && resolvedSubcategory) {
        return <PGSubcategoryListingsPage subcategory={resolvedSubcategory} />;
    }

    return <NewHostelDetailPage slugOverride={slug} />;
}
