import { Pattaya, Inter, Pacifico } from 'next/font/google';

export const pattaya = Pattaya({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-pattaya',
    display: "swap",
});

export const pacifico = Pacifico({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-pacifico',
    display: "swap",
});

export const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: "swap",
});