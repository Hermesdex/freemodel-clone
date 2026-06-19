import type { User, ApiKey, Stats } from '@/types';

// In-memory storage (in production, use Vercel KV, Supabase, or PostgreSQL)
const userStore = new Map<string, User>();
const apiKeyStore = new Map<string, ApiKey[]>(); // userId -> ApiKey[]
const statsStore = new Map<string, Stats>();

// Initialize demo user
const DEMO_USER_ID = 'user_coinpump';
const demoUser: User = {
  id: DEMO_USER_ID,
  name: 'Coin Pump',
  email: 'coinpump83@gmail.com',
  avatar: 'C',
  verified: true,
  plan: 'Pro',
  planRenewal: '2026-06-23',
};

const demoStats: Stats = {
  currentPlan: 'Pro',
  planRenewal: 'Jun 23, 2026',
  cacheHitRate: null,
  requests30d: 146,
  tokens30d: 9022175,
  avgLatency: 127,
};

const demoApiKeys: ApiKey[] = [
  {
    id: 'key_1',
    name: 'Kola',
    key: 'fe_oa_...d0f8...',
    prefix: 'fe_oa_prod',
    createdAt: '2026-06-05',
    lastUsed: '2026-06-05',
    requests: 12450,
    tokens: 892000,
    isActive: true,
  },
  {
    id: 'key_2',
    name: 'Haina',
    key: 'fe_oa_...c9dd...',
    prefix: 'fe_oa_dev',
    createdAt: '2026-06-04',
    lastUsed: '2026-06-04',
    requests: 3420,
    tokens: 156000,
    isActive: true,
  },
];

userStore.set(DEMO_USER_ID, demoUser);
statsStore.set(DEMO_USER_ID, demoStats);
apiKeyStore.set(DEMO_USER_ID, demoApiKeys);

// Generate secure API key (FreeModel style: fe_oa_...)
export function generateApiKey(): { prefix: string; key: string; fullKey: string } {
  const prefix = 'fe_oa';
  const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  // Format: fe_oa_xxxxxxxxxxxxxxxx (24 hex chars after prefix)
  const key = `${prefix}_${randomPart.slice(0, 8)}...${randomPart.slice(-4)}`;
  const fullKey = `${prefix}_${randomPart}`;
  return { prefix: `${prefix}_${randomPart.slice(0, 4)}`, key, fullKey };
}

// User functions
export function getUser(userId: string = DEMO_USER_ID): User | undefined {
  return userStore.get(userId);
}

export function updateUser(userId: string, updates: Partial<User>): User | undefined {
  const user = userStore.get(userId);
  if (!user) return undefined;
  const updated = { ...user, ...updates };
  userStore.set(userId, updated);
  return updated;
}

// Stats functions
export function getStats(userId: string = DEMO_USER_ID): Stats | undefined {
  return statsStore.get(userId);
}

export function updateStats(userId: string, updates: Partial<Stats>): Stats | undefined {
  const stats = statsStore.get(userId);
  if (!stats) return undefined;
  const updated = { ...stats, ...updates };
  statsStore.set(userId, updated);
  return updated;
}

// API Key functions
export function getApiKeys(userId: string = DEMO_USER_ID): ApiKey[] {
  return apiKeyStore.get(userId) || [];
}

export function createApiKey(userId: string, name: string): ApiKey | null {
  const keys = apiKeyStore.get(userId) || [];
  const { prefix, key, fullKey } = generateApiKey();
  
  const newKey: ApiKey = {
    id: `key_${Date.now()}`,
    name,
    key,
    prefix,
    createdAt: new Date().toISOString().split('T')[0],
    lastUsed: null,
    requests: 0,
    tokens: 0,
    isActive: true,
  };
  
  keys.unshift(newKey);
  apiKeyStore.set(userId, keys);
  
  // Return the full key only once
  (newKey as any).rawKey = fullKey;
  
  return newKey;
}

export function revokeApiKey(userId: string, keyId: string): boolean {
  const keys = apiKeyStore.get(userId) || [];
  const index = keys.findIndex(k => k.id === keyId);
  if (index === -1) return false;
  
  keys[index].isActive = false;
  apiKeyStore.set(userId, keys);
  return true;
}

export function deleteApiKey(userId: string, keyId: string): boolean {
  const keys = apiKeyStore.get(userId) || [];
  const filtered = keys.filter(k => k.id !== keyId);
  if (filtered.length === keys.length) return false;
  
  apiKeyStore.set(userId, filtered);
  return true;
}

export function toggleApiKey(userId: string, keyId: string): ApiKey | null {
  const keys = apiKeyStore.get(userId) || [];
  const key = keys.find(k => k.id === keyId);
  if (!key) return null;
  
  key.isActive = !key.isActive;
  apiKeyStore.set(userId, keys);
  return key;
}

// Utility: format numbers
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

export function formatTokens(num: number): string {
  return num.toLocaleString('id-ID');
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}