import localFont from 'next/font/local';
import {Geist_Mono} from 'next/font/google';

export const marlinGeo = localFont({
  src: [
    {path: '../app/fonts/MarlinGeoSQ-Regular.woff', weight: '400', style: 'normal'},
    {path: '../app/fonts/MarlinGeoSQ-Medium.woff', weight: '500', style: 'normal'},
  ],
  variable: '--font-marlin',
  display: 'swap',
});

export const saprona = localFont({
  src: [
    {path: '../app/fonts/Saprona-Light.woff', weight: '300', style: 'normal'},
    {path: '../app/fonts/Saprona-Regular.woff', weight: '400', style: 'normal'},
    {path: '../app/fonts/Saprona-Medium.woff', weight: '500', style: 'normal'},
  ],
  variable: '--font-saprona',
  display: 'swap',
});

export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});
