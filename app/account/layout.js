import AccountLayoutClient from './AccountLayoutClient';

export const metadata = {
    title: 'My Account | Doorstep Hub',
    description: 'Manage your Doorstep Hub bookings, wallet, profile, and customer support.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function AccountLayout({ children }) {
    return <AccountLayoutClient>{children}</AccountLayoutClient>;
}
