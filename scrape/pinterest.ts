import axios from 'axios';

export interface PinterestItem {
    id: string;
    title: string;
    description: string;
    image: string;
    url: string;
}

export interface PinterestSearchResult {
    status: boolean;
    query: string;
    total: number;
    results: PinterestItem[];
    error?: string;
}

const DEFAULT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Scrape Pinterest Search results
 * @param query Search query
 * @param limit Maximum results to return (default 6)
 */
export async function scrapePinterest(query: string, limit: number = 6): Promise<PinterestSearchResult> {
    try {
        const cleanQuery = query.trim();
        if (!cleanQuery) {
            return {
                status: false,
                query: '',
                total: 0,
                results: [],
                error: 'Query pencarian tidak boleh kosong.'
            };
        }

        const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(cleanQuery)}`;
        const initialRes = await axios.get(searchUrl, {
            headers: {
                'User-Agent': DEFAULT_UA,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'id,en-US;q=0.9,en;q=0.8'
            },
            timeout: 15000
        });

        const html = initialRes.data as string;
        const setCookieHeaders = initialRes.headers['set-cookie'] || [];
        const cookies = Array.isArray(setCookieHeaders) ? setCookieHeaders.join('; ') : String(setCookieHeaders);
        const csrfMatch = cookies.match(/csrftoken=([^;]+)/);
        const csrftoken = csrfMatch ? csrfMatch[1] : '';

        // Extract appVersion from __PWS_DATA__
        let appVersion = '';
        const pwsMatch = html.match(/<script id="__PWS_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (pwsMatch) {
            try {
                const parsed = JSON.parse(pwsMatch[1]);
                appVersion = parsed.appVersion || '';
            } catch {
                // Ignore json parse error
            }
        }

        // Fetch BaseSearchResource
        const queryParams = {
            options: {
                query: cleanQuery,
                scope: 'pins',
                bookmarks: []
            },
            context: {}
        };

        const apiUrl = `https://www.pinterest.com/resource/BaseSearchResource/get/?data=${encodeURIComponent(JSON.stringify(queryParams))}`;
        const apiRes = await axios.get(apiUrl, {
            headers: {
                'User-Agent': DEFAULT_UA,
                'X-Requested-With': 'XMLHttpRequest',
                'X-App-Version': appVersion,
                'X-Pinterest-PWS-Handler': 'www/search/pins/index.js',
                'X-CSRFToken': csrftoken,
                'Referer': searchUrl,
                'Cookie': cookies,
                'Accept': 'application/json, text/javascript, */*, q=0.01'
            },
            timeout: 15000
        });

        const rawResults = (apiRes.data as any)?.resource_response?.data?.results || [];
        const items: PinterestItem[] = [];
        const seenImages = new Set<string>();

        for (const pin of rawResults) {
            if (!pin) continue;
            const images = pin.images || {};
            const imgUrl = images.orig?.url || images['736x']?.url || images['474x']?.url || images['236x']?.url;
            if (!imgUrl || seenImages.has(imgUrl)) continue;

            seenImages.add(imgUrl);
            const title = (pin.title || pin.grid_title || pin.description || cleanQuery).trim();
            const description = (pin.description || pin.rich_summary?.display_description || '').trim();
            const id = pin.id || '';
            const pinUrl = id ? `https://www.pinterest.com/pin/${id}/` : (pin.link || searchUrl);

            items.push({
                id,
                title: title.length > 80 ? title.slice(0, 77) + '...' : title,
                description,
                image: imgUrl,
                url: pinUrl
            });

            if (items.length >= limit) break;
        }

        if (items.length === 0) {
            return {
                status: false,
                query: cleanQuery,
                total: 0,
                results: [],
                error: `Tidak ada hasil Pinterest ditemukan untuk "${cleanQuery}".`
            };
        }

        return {
            status: true,
            query: cleanQuery,
            total: items.length,
            results: items
        };
    } catch (err: any) {
        return {
            status: false,
            query,
            total: 0,
            results: [],
            error: err.message || 'Terjadi kesalahan saat mencari di Pinterest.'
        };
    }
}
