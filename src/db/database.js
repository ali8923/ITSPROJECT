import Dexie from 'dexie';

export const db = new Dexie('VegCardDatabase');
db.version(1).stores({
    customCards: '++id, name, ecoScore, createdAt'
});