import { formatGithubError } from '@/lib/route';
import { NextResponse } from 'next/server';
const GITHUB = 'https://api.github.com';

export async function GET(req: Request, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;

  const res = await fetch(`${GITHUB}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/issues/${number}`, {
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

  // allowClosed=1 일때 삭제된 issue 확인 가능
  const allowClosed = new URL(req.url).searchParams.get('allowClosed') === '1';
  if (!allowClosed && data.state !== 'open') {
    return NextResponse.json({ error: 'issue is closed' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const updateBody = await req.json();

  const res = await fetch(`${GITHUB}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/issues/${number}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateBody),
  });

  if (!res.ok) {
    const payload = await formatGithubError(res);
    return NextResponse.json(payload, { status: res.status });
  }

  return NextResponse.json(await res.json());
}

export async function DELETE(_: Request, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;

  const res = await fetch(`${GITHUB}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/issues/${number}`, {
    method: 'PATCH', // GitHub는 이슈 삭제 불가 → close로 대체
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ state: 'closed' }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const payload = await formatGithubError(res);
    return NextResponse.json(payload, { status: res.status });
  }

  // 프런트 훅 시그니처를 맞추기 위해 { ok: true } 반환
  return NextResponse.json({ ok: true });
}
