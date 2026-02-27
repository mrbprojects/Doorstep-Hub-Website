'use client';
import Image from 'next/image';

export default function LogoTest() {
    return (
        <div className="p-10 space-y-10">
            <div className="p-10 bg-white border">
                <h2 className="text-black mb-4">On White Background:</h2>
                <div className="relative w-48 h-14 bg-gray-100">
                    <Image src="/d-hub-logo.png" alt="test" fill className="object-contain" />
                </div>
            </div>
            <div className="p-10 bg-black border">
                <h2 className="text-white mb-4">On Black Background:</h2>
                <div className="relative w-48 h-14 bg-gray-900">
                    <Image src="/d-hub-logo.png" alt="test" fill className="object-contain" />
                </div>
            </div>
        </div>
    );
}
