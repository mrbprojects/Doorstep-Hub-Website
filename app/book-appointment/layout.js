import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const appointmentNavItems = [
    { name: 'Become A Partner', href: '/service-partner' },
    { name: 'Careers', href: '/careers' },
    { name: 'Help Center', href: '/help-center' },
    { name: "FAQ's", href: '/help-center' },
    { name: 'Contact us', href: '/contact-us' },
    { name: 'App Download Here', href: '/service-partner' },
];

export default function BookAppointmentLayout({ children }) {
    const appointmentTheme = {
        bgScrolled: 'bg-white',
        bgMobile: 'bg-white',
        textMain: 'text-[#102B35]',
        textHover: 'text-[#007F70]',
        border: 'border-[#D9E5EB]',
        accent: 'bg-[#007F70]',
        accentGradientFrom: 'from-[#007F70]',
        accentGradientTo: 'to-[#00594F]',
        buttonBg: 'bg-[#F7FAF9]',
        isLight: true
    };

    return (
        <div className="min-h-screen bg-[#F7FAF9]">
            <Header theme={appointmentTheme} navItems={appointmentNavItems} />
            {children}
            <Footer />
        </div>
    );
}
