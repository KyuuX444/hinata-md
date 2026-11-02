import type { WaClient } from 'zapo-js';
import type { GlobalMessages, GlobalApiFunction } from '../../types/plugin.js';
import { setupGlobalHelpers } from './helper-zapo.js';

export interface BotConfig {
    readonly botName: string;
    readonly prefixes: readonly string[];
    readonly ownerNumbers: readonly string[];
    readonly premiumNumbers: readonly string[];
    readonly sessionPath: string;
    readonly sessionId: string;
    readonly authMode: 'pairing_code' | 'qr';
    readonly pairingPhoneNumber: string;
    readonly thumbnailUrl: string;
    mode: 'public' | 'self';
    readonly logLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error';
    readonly register: {
        readonly enabled: boolean;
        readonly defaultLimit: number;
    };
}

export const mess: GlobalMessages = {
    wait: '⏳ ᴍᴏʜᴏɴ ᴛᴜɴɢɢᴜ, sᴇᴅᴀɴɢ ᴅɪᴘʀᴏsᴇs... 🎀✨',
    loading: '⏳ ᴍᴏʜᴏɴ ᴛᴜɴɢɢᴜ, sᴇᴅᴀɴɢ ᴅɪᴘʀᴏsᴇs... 🎀✨',
    error: '❌ ᴛᴇʀᴊᴀᴅɪ ᴋᴇsᴀʟᴀʜᴀɴ, sɪʟᴀᴋᴀɴ ᴄᴏʙᴀ ʟᴀɢɪ ɴᴀɴᴛɪ 🎀✨',
    owner: '🍓 ᴀᴋsᴇs ᴋʜᴜsᴜs: ʜᴀɴʏᴀ ᴏᴡɴᴇʀ ᴛᴇʀsᴀʏᴀɴɢ sᴀᴊᴀ ʏᴀᴀ 🎀✨',
    admin: '🍓 ᴀᴋsᴇs ᴋʜᴜsᴜs: ғɪᴛᴜʀ ɪɴɪ ʜᴀɴʏᴀ ᴜɴᴛᴜᴋ ᴀᴅᴍɪɴ ɢʀᴜᴘ ʏᴀᴀ 🎀✨',
    botAdmin: '🍓 ᴍᴏʜᴏɴ ᴍᴀᴀғ: ʙᴏᴛ ʜᴀʀᴜs ᴍᴇɴᴊᴀᴅɪ ᴀᴅᴍɪɴ ɢʀᴜᴘ ᴛᴇʀʟᴇʙɪʜ ᴅᴀʜᴜʟᴜ 🎀✨',
    group: '🍓 ᴍᴏʜᴏɴ ᴍᴀᴀғ: ғɪᴛᴜʀ ɪɴɪ ʜᴀɴʏᴀ ʙɪsᴀ ᴅɪɢᴜɴᴀᴋᴀɴ ᴅɪ ᴅᴀʟᴀᴍ ɢʀᴜᴘ ʏᴀᴀ 🎀✨',
    premium: '🍓 ᴀᴋsᴇs ᴋʜᴜsᴜs: ғɪᴛᴜʀ ɪɴɪ ᴋʜᴜsᴜs ᴜsᴇʀ ᴘʀᴇᴍɪᴜᴍ sᴀᴊᴀ ʏᴀᴀ 🎀✨',
    private: '🍓 ᴍᴏʜᴏɴ ᴍᴀᴀғ: ғɪᴛᴜʀ ɪɴɪ ʜᴀɴʏᴀ ʙɪsᴀ ᴅɪɢᴜɴᴀᴋᴀɴ ᴅɪ ᴘʀɪᴠᴀᴛᴇ ᴄʜᴀᴛ ʏᴀᴀ 🎀✨'
};

export const APIs: Record<string, string> = {
    kyzz: 'https://api.kyzzz.xyz'
};

export const APIKeys: Record<string, string> = {
    'https://api.kyzzz.xyz': process.env.KYZZ_API_KEY || 'YOUR_API_KEY',
    kyzz: process.env.KYZZ_API_KEY || 'YOUR_API_KEY'
};

export const API: GlobalApiFunction = (
    name: string,
    path = '/',
    query: Record<string, any> = {},
    apikeyqueryname?: string
): string => {
    const baseUrl = name in globalThis.APIs ? globalThis.APIs[name] : name;
    const q: Record<string, any> = { ...query };

    if (apikeyqueryname) {
        const key = globalThis.APIKeys[baseUrl] || globalThis.APIKeys[name];
        if (key) q[apikeyqueryname] = key;
    }

    const search = new URLSearchParams(q).toString();
    return baseUrl + path + (search ? '?' + search : '');
};

globalThis.mess = mess;
globalThis.APIs = APIs;
globalThis.APIKeys = APIKeys;
globalThis.API = API;

export const config: BotConfig = {
    botName: 'Hinata Md',
    prefixes: ['.', '#', '!'],
    ownerNumbers: process.env.OWNER_NUMBERS ? process.env.OWNER_NUMBERS.split(',') : ['628xxxxxxxxxx'],
    premiumNumbers: process.env.PREMIUM_NUMBERS ? process.env.PREMIUM_NUMBERS.split(',') : ['628xxxxxxxxxx'],
    sessionPath: 'data/session.sqlite',
    sessionId: 'hinata-session',
    authMode: 'pairing_code',
    pairingPhoneNumber: process.env.PAIRING_NUMBER || '628xxxxxxxxxx',
    thumbnailUrl: 'assets/menu.jpg',
    mode: 'public',
    logLevel: 'info',
    register: {
        enabled: true,
        defaultLimit: 30
    }
};

export function registerSettings(client: WaClient): void {
    globalThis.mess = mess;
    globalThis.APIs = APIs;
    globalThis.APIKeys = APIKeys;
    globalThis.API = API;
    setupGlobalHelpers(client, config);
}
