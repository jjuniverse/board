import { formatGithubError } from '@/lib/route';
import { NextResponse } from 'next/server';

const GITHUB = 'https://api.github.com';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const label = searchParams.get('label') ?? '';
    const query = searchParams.get('q') ?? '';
    const rawTarget = (searchParams.get('target') ?? 'title') as string;
    const target: 'title' | 'body' = rawTarget === 'body' ? 'body' : 'title';

    const page = searchParams.get('page') ?? '1';
    const perPage = searchParams.get('per_page') ?? '10';

    const searchWord = query.trim();

    const parts = [`repo:${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`, 'is:issue', 'is:open'];
    if (label) {
      parts.push(`label:"${label}"`);
    }
    if (searchWord) {
      // 공백 포함 검색어 처리
      const searchWordForParts = searchWord.includes(' ') ? `"${searchWord.replace(/"/g, '\\"')}"` : searchWord;
      parts.push(`in:${target} ${searchWordForParts}`);
    }

    const qs = new URLSearchParams({
      q: parts.join(' '),
      sort: 'created',
      order: 'desc',
      page: String(page),
      per_page: String(perPage),
    });

    const res = await fetch(`${GITHUB}/search/issues?${qs}`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errPayload = await formatGithubError(res);
      return NextResponse.json(errPayload, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json({
      items: data.items ?? [],
      totalCount: data.total_count ?? 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    return NextResponse.json(
      {
        status: 502,
        error: 'fetch_failed',
        message: message,
      },
      { status: 502 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${GITHUB}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errPayload = await formatGithubError(res);
      return NextResponse.json(errPayload, { status: res.status });
    }
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    return NextResponse.json(
      {
        status: 502,
        error: 'fetch_failed',
        message: message,
      },
      { status: 502 }
    );
  }
}
