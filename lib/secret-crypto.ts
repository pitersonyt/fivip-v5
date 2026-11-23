import { createCipheriv, randomBytes } from 'node:crypto'

function getKey() {
  const raw = process.env.ENTRETENIMIENTO_SECRET_KEY
  if (!raw) return null
  const key = Buffer.from(raw, 'base64')
  return key.length === 32 ? key : null
}

export function canEncryptSecrets() {
  return getKey() !== null
}

export function encryptSecret(plain: string) {
  const key = getKey()
  if (!key) throw new Error('ENTRETENIMIENTO_SECRET_KEY must be a base64-encoded 32-byte key.')
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  return [iv, cipher.getAuthTag(), encrypted].map((b) => b.toString('base64')).join('.')
}
