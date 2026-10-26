import Dexie from 'dexie';

export const db = new Dexie('VegCardDB');

db.version(1).stores({
    customCards: '++id, name, colorTheme, createdAt'
})