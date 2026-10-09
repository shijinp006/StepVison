// Where this project's images live in Cloudinary. The account also holds
// other projects (e.g. stepvision/international), so everything for this
// site stays under stepvision/hotel.
export const CLOUDINARY_ROOT = 'stepvision/hotel';
export const CLOUDINARY_FOLDERS = {
    products: `${CLOUDINARY_ROOT}/products`,
    site: `${CLOUDINARY_ROOT}/site`,
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// URL of a fixed site image (hero, banners, category cards) uploaded by
// scripts/migrate-images-to-cloudinary.mjs, e.g. siteImage('hero-slide-1').
// f_auto/q_auto let Cloudinary pick the best format and size per browser.
export function siteImage(name: string) {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${CLOUDINARY_FOLDERS.site}/${name}`;
}
