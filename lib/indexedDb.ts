// lib/indexedDb.ts
import { openDB } from 'idb'

const DB_NAME = 'stch-db-session'
const STORE_NAME = 'user_session'

export async function getSessionDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' }) // Se asume que 'user.id' existe
      }
    },
  })
}

export async function saveUserSession(user: any) {
  const db = await getSessionDB()
  await db.put(STORE_NAME, user)
}

export async function getUserSession() {
  const db = await getSessionDB()
  return await db.getAll(STORE_NAME) // Devuelve un array, aunque solo se espera uno
}

export async function clearUserSession() {
  const db = await getSessionDB()
  return await db.clear(STORE_NAME)
}
