import { NextResponse } from 'next/server';
import { buildUrlSetXML, getStaticSitemapEntries } from '@/lib/seo/sitemapManager';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const BASE_URL = 'https://doorstephub.com';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.doorstephub.com/v1/dhubApi').replace(/\/$/, '');

async function fetchAPI(endpoint, body = null, method = 'POST') {
    try {
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'DoorstepHub-SitemapGenerator/1.0'
            },
        };
        if (body) config.body = JSON.stringify(body);
        const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
        return res.ok ? await res.json() : null;
    } catch (e) {
        return null;
    }
}

export async function GET(request, { params }) {
    let group = params.group || '';
    if (group.endsWith('.xml')) {
        group = group.replace(/\.xml$/, '');
    }

    let entries = [];

    try {
        switch (group) {
            case 'static-pages':
                entries = getStaticSitemapEntries();
                break;

            case 'cities':
                const citiesData = await fetchAPI('/app/cities/cities_list', null, 'GET');
                const cities = (citiesData?.success && Array.isArray(citiesData.cities)) ? citiesData.cities : [];
                entries = cities.map(city => {
                    const slug = (city.slug || city.name || '').toLowerCase().replace(/\s+/g, '-');
                    return {
                        url: `${BASE_URL}/appliances/repair-service/${slug}`,
                        lastModified: new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.8
                    };
                }).filter(e => e.url);
                break;

            case 'categories':
                const catData = await fetchAPI('/app/applience-repairs-website/getallcategorys', { lattitude: '17.3850', longitude: '78.4867' });
                const categories = (catData?.success && Array.isArray(catData.data)) ? catData.data : [];
                entries = categories.map(cat => {
                    const slug = cat.slug || (cat.name ? cat.name.toLowerCase().replace(/\s+/g, '-') : '');
                    return {
                        url: `${BASE_URL}/appliances/${slug}`,
                        lastModified: new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.8
                    };
                }).filter(e => e.url);
                break;

            case 'brands':
                const brandData = await fetchAPI('/app/brands/all_brands', null, 'GET');
                const brands = (brandData?.success && Array.isArray(brandData.brands)) ? brandData.brands : [];
                entries = brands.map(brand => {
                    const slug = brand.slug || (brand.name ? brand.name.toLowerCase().replace(/\s+/g, '-') : '');
                    return {
                        url: `${BASE_URL}/appliances/brand/${slug}`,
                        lastModified: new Date(),
                        changeFrequency: 'monthly',
                        priority: 0.7
                    };
                }).filter(e => e.url);
                break;

            case 'pghostels':
                entries = [
                    { url: `${BASE_URL}/pghostels`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
                    { url: `${BASE_URL}/pg-hostel`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
                    { url: `${BASE_URL}/pghostels/listings/boys-pg`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
                    { url: `${BASE_URL}/pghostels/listings/girls-pg`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
                    { url: `${BASE_URL}/pghostels/listings/coliving`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
                    { url: `${BASE_URL}/pghostels/listings/single-room`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
                    { url: `${BASE_URL}/pghostels/listings/double-sharing`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 }
                ];
                try {
                    const pgData = await fetchAPI('/app/products/featured_pg_hostels', null, 'GET');
                    const hostels = (pgData?.success && Array.isArray(pgData.hostels)) ? pgData.hostels : [];
                    hostels.forEach(h => {
                        const slug = h.slug || h.hostelSlug || h._id;
                        if (slug) {
                            entries.push({
                                url: `${BASE_URL}/pghostels/${slug}`,
                                lastModified: new Date(),
                                changeFrequency: 'weekly',
                                priority: 0.8
                            });
                            entries.push({
                                url: `${BASE_URL}/pghostels/hostel-detail/${slug}`,
                                lastModified: new Date(),
                                changeFrequency: 'weekly',
                                priority: 0.7
                            });
                        }
                    });
                } catch (e) {}
                break;

            case 'spa-salon':
                entries = [
                    { url: `${BASE_URL}/spa-salon`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
                    { url: `${BASE_URL}/spa-salon/packages`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
                    { url: `${BASE_URL}/spa-salon/category/facial-spa`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
                    { url: `${BASE_URL}/spa-salon/category/hair-care`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
                    { url: `${BASE_URL}/spa-salon/category/body-massage`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
                    { url: `${BASE_URL}/spa-salon/category/manicure-pedicure`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
                    { url: `${BASE_URL}/spa-salon/detail/glow-facial`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
                    { url: `${BASE_URL}/spa-salon/detail/hair-spa`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
                    { url: `${BASE_URL}/spa-salon/detail/swedish-massage`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 }
                ];
                break;

            case 'religious':
                entries = [
                    { url: `${BASE_URL}/religious-services`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
                    { url: `${BASE_URL}/religious`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
                    { url: `${BASE_URL}/religious-services/all-services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
                    { url: `${BASE_URL}/religious-services/category`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
                    { url: `${BASE_URL}/religious-services/category/griha-pravesh`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
                    { url: `${BASE_URL}/religious-services/category/satyanarayan-puja`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
                    { url: `${BASE_URL}/religious-services/category/ganesh-puja`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
                    { url: `${BASE_URL}/religious-services/service/lakshmi-puja`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
                    { url: `${BASE_URL}/religious-services/service/rudrabhishekam`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 }
                ];
                break;

            case 'amc':
                entries = [
                    { url: `${BASE_URL}/amc`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
                    { url: `${BASE_URL}/amc/ac-maintenance-plan`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
                    { url: `${BASE_URL}/amc/home-appliances-amc`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 }
                ];
                break;

            case 'images':
                // Collect images across ALL dynamic verticals & static pages
                const [svcRes, cityRes, catRes, brandRes, pgRes] = await Promise.all([
                    fetchAPI('/app/applience-repairs-website/all-services', null, 'GET'),
                    fetchAPI('/app/cities/cities_list', null, 'GET'),
                    fetchAPI('/app/applience-repairs-website/getallcategorys', { lattitude: '17.3850', longitude: '78.4867' }),
                    fetchAPI('/app/brands/all_brands', null, 'GET'),
                    fetchAPI('/app/products/featured_pg_hostels', null, 'GET')
                ]);

                // 1. Services
                const svcList = (svcRes?.success && Array.isArray(svcRes.data)) ? svcRes.data : [];
                svcList.forEach(s => {
                    const slug = s.slug || (s.name ? s.name.toLowerCase().replace(/\s+/g, '-') : '');
                    if (slug) {
                        const imageUrl = s.image ? (s.image.startsWith('http') ? s.image : `https://api.doorstephub.com/${s.image.replace(/^\//, '')}`) : `${BASE_URL}/d-hub-logo.png`;
                        entries.push({
                            url: `${BASE_URL}/${slug}`,
                            lastModified: new Date(),
                            changeFrequency: 'weekly',
                            priority: 0.8,
                            image: imageUrl
                        });
                    }
                });

                // 2. City Pages
                const cityList = (cityRes?.success && Array.isArray(cityRes.cities)) ? cityRes.cities : [];
                cityList.forEach(c => {
                    const slug = (c.slug || c.name || '').toLowerCase().replace(/\s+/g, '-');
                    if (slug) {
                        entries.push({
                            url: `${BASE_URL}/appliances/repair-service/${slug}`,
                            lastModified: new Date(),
                            changeFrequency: 'weekly',
                            priority: 0.8,
                            image: `${BASE_URL}/${c.name || 'Hyderabad'}.png`
                        });
                    }
                });

                // 3. Category Pages
                const categoryList = (catRes?.success && Array.isArray(catRes.data)) ? catRes.data : [];
                categoryList.forEach(cat => {
                    const slug = cat.slug || (cat.name ? cat.name.toLowerCase().replace(/\s+/g, '-') : '');
                    if (slug) {
                        const img = cat.image ? (cat.image.startsWith('http') ? cat.image : `https://api.doorstephub.com/${cat.image.replace(/^\//, '')}`) : `${BASE_URL}/electric-appliance.png`;
                        entries.push({
                            url: `${BASE_URL}/appliances/${slug}`,
                            lastModified: new Date(),
                            changeFrequency: 'weekly',
                            priority: 0.8,
                            image: img
                        });
                    }
                });

                // 4. Brand Pages
                const brandList = (brandRes?.success && Array.isArray(brandRes.brands)) ? brandRes.brands : [];
                brandList.forEach(b => {
                    const slug = b.slug || (b.name ? b.name.toLowerCase().replace(/\s+/g, '-') : '');
                    if (slug) {
                        const img = b.logo ? (b.logo.startsWith('http') ? b.logo : `https://api.doorstephub.com/${b.logo.replace(/^\//, '')}`) : `${BASE_URL}/d-hub-logo.png`;
                        entries.push({
                            url: `${BASE_URL}/appliances/brand/${slug}`,
                            lastModified: new Date(),
                            changeFrequency: 'monthly',
                            priority: 0.7,
                            image: img
                        });
                    }
                });

                // 5. PG Hostels
                const hostelList = (pgRes?.success && Array.isArray(pgRes.hostels)) ? pgRes.hostels : [];
                hostelList.forEach(h => {
                    const slug = h.slug || h.hostelSlug || h._id;
                    if (slug) {
                        const img = h.image ? (h.image.startsWith('http') ? h.image : `https://api.doorstephub.com/${h.image.replace(/^\//, '')}`) : `${BASE_URL}/pghostels.png`;
                        entries.push({
                            url: `${BASE_URL}/pghostels/${slug}`,
                            lastModified: new Date(),
                            changeFrequency: 'weekly',
                            priority: 0.8,
                            image: img
                        });
                    }
                });

                // 6. Static / Main Verticals
                entries.push({ url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0, image: `${BASE_URL}/d-hub-logo.png` });
                entries.push({ url: `${BASE_URL}/amc`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8, image: `https://api.doorstephub.com/uploads/Doorstep-Hub-AMC-Service.png` });
                entries.push({ url: `${BASE_URL}/spa-salon`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9, image: `${BASE_URL}/spa-pet-hero.png` });
                entries.push({ url: `${BASE_URL}/religious-services`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9, image: `${BASE_URL}/d-hub-logo.png` });
                break;

            case 'services':
            default:
                const serviceData = await fetchAPI('/app/applience-repairs-website/all-services', null, 'GET');
                const services = (serviceData?.success && Array.isArray(serviceData.data)) ? serviceData.data : [];
                entries = services.map(s => {
                    const slug = s.slug || (s.name ? s.name.toLowerCase().replace(/\s+/g, '-') : '');
                    return {
                        url: `${BASE_URL}/${slug}`,
                        lastModified: new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.9
                    };
                }).filter(e => e.url);
                break;
        }
    } catch (e) {
        console.error(`Error generating sitemap for group ${group}:`, e);
    }

    const xml = buildUrlSetXML(entries);

    return new NextResponse(xml, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
        }
    });
}
