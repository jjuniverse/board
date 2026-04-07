export type HttpError = Error & {
  status: number;
  data: unknown;
  url?: string;
  method?: string;
};

function createHttpError(opts: {
  status: number;
  data: unknown;
  url?: string;
  method?: string;
  message?: string;
}): HttpError {
  const err = new Error(opts.message ?? `HTTP ${opts.status}`) as HttpError;
  err.name = 'HttpError';
  err.status = opts.status;
  err.data = opts.data;
  err.url = opts.url;
  err.method = opts.method;
  return err;
}

export function isHttpError(e: unknown): e is HttpError {
  return e instanceof Error && typeof (e as any).status === 'number';
}

async function parseBody(res: Response): Promise<unknown> {
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return await res.text();
    }
  }
  return await res.text();
}

export function extractErrorMessage(e: unknown, fallback = '요청에 실패했습니다.') {
  if (e && typeof e === 'object') {
    const err = e as HttpError;

    if (typeof err.data === 'string') {
      return err.data;
    }
    if ((err.data as any)?.error) {
      return (err.data as any).error;
    }
    if ((err.data as any)?.github?.message) {
      return (err.data as any).github.message;
    }
    if ((err.data as any)?.message) {
      return (err.data as any).message;
    }
    if (err.message) {
      return err.message;
    }
  }
  return fallback;
}

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...options });
  const body = await parseBody(res);

  if (!res.ok) {
    const message =
      (typeof body === 'object' && body !== null && 'message' in (body as any) && (body as any).message) ||
      (typeof body === 'object' && body !== null && 'github' in (body as any) && (body as any).github?.message) ||
      res.statusText ||
      `HTTP ${res.status}`;

    throw createHttpError({
      status: res.status,
      data: body,
      url,
      method: options?.method,
      message: String(message),
    });
  }
  return body as T;
}
