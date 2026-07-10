'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Loader2, MapPin, Package, Phone, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchOrderDetail, resolveMediaUrl } from '@/lib/accountApi';
import { getStatusLabel, getStatusStyle, resolveEffectiveOrderStatus } from '@/lib/orderStatus';

function resolveServices(order = {}) {
    if (Array.isArray(order.services) && order.services.length > 0) {
        return order.services.map((service) => ({
            name: service.name || service.serviceName || 'Service',
            image: service.image || service.serviceImage || service.mainImage || '',
            price: service.price ?? service.servicePrice ?? service.defaultPrice,
            quantity: service.quantity || 1,
        }));
    }

    if (order.serviceId?.name || order.serviceName) {
        return [
            {
                name: order.serviceId?.name || order.serviceName,
                image: order.serviceId?.mainImage || order.serviceImage || '',
                price: order.serviceId?.defaultPrice,
                quantity: 1,
            },
        ];
    }

    return [];
}

function resolveAddress(order = {}) {
    const address = order.address || order.serviceAddressId;
    if (!address || typeof address !== 'object') return null;

    const parts = [
        address.flat,
        address.area,
        address.addressLineOne,
        address.addressLineTwo,
        address.cityName?.name || address.cityName,
        address.stateName?.name || address.stateName,
        address.postalCode,
    ].filter(Boolean);

    return parts.join(', ') || address.fullAddress || null;
}

export default function BookingDetailPage() {
    const params = useParams();
    const bookingId = params?.bookingId;
    const { token, loading: authLoading } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadOrder = useCallback(async () => {
        if (!token || !bookingId) return;
        setLoading(true);
        setError('');
        try {
            const data = await fetchOrderDetail(token, bookingId);
            setOrder(data);
        } catch (e) {
            console.error('Failed to load booking detail:', e);
            setError(e?.message || 'Failed to load booking details');
            setOrder(null);
        } finally {
            setLoading(false);
        }
    }, [token, bookingId]);

    useEffect(() => {
        if (authLoading) return;
        if (!token) {
            setLoading(false);
            return;
        }
        loadOrder();
    }, [authLoading, token, loadOrder]);

    const status = order ? resolveEffectiveOrderStatus(order) : 'pending';
    const services = order ? resolveServices(order) : [];
    const address = order ? resolveAddress(order) : null;
    const providerName =
        order?.providerName ||
        order?.provider?.name ||
        order?.provider?.providerName ||
        (order?.providerId?.firstName
            ? `${order.providerId.firstName || ''} ${order.providerId.lastName || ''}`.trim()
            : order?.providerId?.businessName) ||
        null;
    const totalAmount = order?.payment?.totalAmount ?? order?.totalAmount ?? null;

    return (
        <div className="space-y-6">
            <Link
                href="/account/bookings"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#037166] hover:underline"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to My Bookings
            </Link>

            {loading || authLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#037166]" />
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : !order ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-900">Booking not found</h3>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                            <div>
                                <h1 className="text-2xl font-extrabold text-gray-900">Booking Details</h1>
                                <p className="text-xs font-mono text-[#037166] mt-1">{order.orderId}</p>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${getStatusStyle(status)}`}>
                                {getStatusLabel(status)}
                            </span>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
                            {order.bookedDate && order.bookedDate !== 'N/A' && (
                                <div className="inline-flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {order.bookedDate}
                                </div>
                            )}
                            {order.bookedTime && order.bookedTime !== 'N/A' && (
                                <div className="inline-flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    {order.bookedTime}
                                </div>
                            )}
                            {order.mobileNumber && order.mobileNumber !== 'N/A' && (
                                <div className="inline-flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    {order.mobileNumber}
                                </div>
                            )}
                            {totalAmount != null && (
                                <div className="font-bold text-gray-900">Total: ₹{Number(totalAmount).toFixed(0)}</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                        <h2 className="font-bold text-gray-900">Services</h2>
                        {services.map((service, idx) => {
                            const imageUrl = service.image ? resolveMediaUrl(service.image) : null;
                            return (
                                <div key={idx} className="flex gap-4 items-center border border-gray-100 rounded-xl p-4">
                                    <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={service.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900">{service.name}</p>
                                        {service.price != null && service.price !== 'N/A' && (
                                            <p className="text-sm text-gray-600">₹{Number(service.price).toFixed(0)}</p>
                                        )}
                                    </div>
                                    {service.quantity > 1 && (
                                        <span className="text-xs font-semibold text-gray-500">x{service.quantity}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {(providerName || address) && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
                            <h2 className="font-bold text-gray-900">Booking Info</h2>
                            {providerName && (
                                <p className="inline-flex items-center gap-2 text-sm text-gray-600">
                                    <User className="w-4 h-4 text-gray-400" />
                                    Provider: {providerName}
                                </p>
                            )}
                            {address && (
                                <p className="inline-flex items-start gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    {address}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
