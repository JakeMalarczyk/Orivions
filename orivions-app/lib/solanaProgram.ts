// Read-only check of a Solana program: who can upgrade it. Uses public RPC data only.
// Used by /api/program-check and /tools/solana-program-check.

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
export const UPGRADEABLE_LOADER = 'BPFLoaderUpgradeab1e11111111111111111111111';

export function base58Decode(s: string): Uint8Array | null {
  if (!s || s.length < 32 || s.length > 44) return null;
  let n = BigInt(0);
  for (const ch of s) {
    const i = ALPHABET.indexOf(ch);
    if (i < 0) return null;
    n = n * BigInt(58) + BigInt(i);
  }
  const bytes: number[] = [];
  while (n > BigInt(0)) {
    bytes.unshift(Number(n & BigInt(255)));
    n >>= BigInt(8);
  }
  let zeros = 0;
  for (const ch of s) {
    if (ch === '1') zeros++;
    else break;
  }
  const out = new Uint8Array(zeros + bytes.length);
  out.set(bytes, zeros);
  return out.length === 32 ? out : null;
}

export function base58Encode(bytes: Uint8Array): string {
  let n = BigInt(0);
  for (const b of bytes) n = (n << BigInt(8)) | BigInt(b);
  let s = '';
  while (n > BigInt(0)) {
    s = ALPHABET[Number(n % BigInt(58))] + s;
    n /= BigInt(58);
  }
  for (const b of bytes) {
    if (b === 0) s = '1' + s;
    else break;
  }
  return s;
}

// Whether 32 bytes are a valid ed25519 point. A normal wallet key is on the curve;
// a program derived address (PDA) never is.
const P = BigInt(2) ** BigInt(255) - BigInt(19);
const D = (-BigInt(121665) * modPow(BigInt(121666), P - BigInt(2), P)) % P;
function modPow(b: bigint, e: bigint, m: bigint): bigint {
  let r = BigInt(1);
  b %= m;
  while (e > BigInt(0)) {
    if (e & BigInt(1)) r = (r * b) % m;
    b = (b * b) % m;
    e >>= BigInt(1);
  }
  return r;
}
export function isOnCurve(bytes: Uint8Array): boolean {
  let y = BigInt(0);
  for (let i = 31; i >= 0; i--) y = (y << BigInt(8)) | BigInt(bytes[i]!);
  y &= (BigInt(1) << BigInt(255)) - BigInt(1);
  if (y >= P) return false;
  const u = (y * y - BigInt(1) + P) % P;
  const v = (D * y * y + BigInt(1)) % P;
  const x2 = (u * modPow(v, P - BigInt(2), P)) % P;
  if (x2 === BigInt(0)) return true;
  return modPow(x2, (P - BigInt(1)) / BigInt(2), P) === BigInt(1);
}

export type AuthorityKind = 'single-key' | 'program-controlled' | 'immutable';

export interface ProgramCheck {
  status: 'ok' | 'not-found' | 'not-a-program' | 'not-upgradeable' | 'error';
  address: string;
  authority?: string;
  authorityKind?: AuthorityKind;
  lastDeploySlot?: number;
  lastDeployTime?: string;
  message?: string;
}

const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

async function rpc<T>(method: string, params: unknown[]): Promise<T | null> {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`rpc ${res.status}`);
  const json = (await res.json()) as { result?: T; error?: unknown };
  if (json.error) throw new Error('rpc error');
  return json.result ?? null;
}

interface AccountValue {
  executable: boolean;
  owner: string;
  data: [string, string];
}

async function account(address: string, length: number): Promise<AccountValue | null> {
  const r = await rpc<{ value: AccountValue | null }>('getAccountInfo', [
    address,
    { encoding: 'base64', dataSlice: { offset: 0, length } },
  ]);
  return r?.value ?? null;
}

function bytesOf(v: AccountValue): Uint8Array {
  return new Uint8Array(Buffer.from(v.data[0], 'base64'));
}

export async function checkProgram(address: string): Promise<ProgramCheck> {
  const key = base58Decode(address);
  if (!key) return { status: 'error', address, message: 'That does not look like a Solana address.' };
  try {
    const prog = await account(address, 36);
    if (!prog) return { status: 'not-found', address, message: 'No account with this address exists on Solana mainnet.' };
    if (!prog.executable) {
      return { status: 'not-a-program', address, message: 'This account exists but is not a program (it may be a wallet, token or data account).' };
    }
    if (prog.owner !== UPGRADEABLE_LOADER) {
      return {
        status: 'not-upgradeable',
        address,
        authorityKind: 'immutable',
        message: 'This is a built-in or older-loader program. It has no upgrade authority, so its code is fixed.',
      };
    }
    const pd = base58Encode(bytesOf(prog).slice(4, 36));
    const data = await account(pd, 45);
    if (!data) return { status: 'error', address, message: 'The program data account could not be read.' };
    const d = bytesOf(data);
    const slot = Number(new DataView(d.buffer, d.byteOffset + 4, 8).getBigUint64(0, true));
    const hasAuthority = d[12] === 1;
    let lastDeployTime: string | undefined;
    try {
      const t = await rpc<number>('getBlockTime', [slot]);
      if (typeof t === 'number') lastDeployTime = new Date(t * 1000).toISOString().slice(0, 10);
    } catch {
      // The block time is a nice extra, not required.
    }
    if (!hasAuthority) {
      return { status: 'ok', address, authorityKind: 'immutable', lastDeploySlot: slot, lastDeployTime };
    }
    const authBytes = d.slice(13, 45);
    return {
      status: 'ok',
      address,
      authority: base58Encode(authBytes),
      authorityKind: isOnCurve(authBytes) ? 'single-key' : 'program-controlled',
      lastDeploySlot: slot,
      lastDeployTime,
    };
  } catch {
    return { status: 'error', address, message: 'The Solana network did not answer in time. Try again in a moment.' };
  }
}
