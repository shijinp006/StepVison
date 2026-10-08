// "Tabletop & Dining" -> "tabletop-dining"
export const slugify = (text: string) =>
    text
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
