import type { Config } from '../config/_env.ts';
export class SupabaseClient {
  constructor(
    private config: Config,
    private request: typeof fetch = fetch,
  ) {}
  async call<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await this.request(
      `${this.config.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path}`,
      {
        ...init,
        headers: {
          apikey: this.config.SUPABASE_SECRET_KEY,
          'Content-Type': 'application/json',
          ...init.headers,
        },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!response.ok) throw new Error(`Supabase request failed (${response.status})`);
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }
}
