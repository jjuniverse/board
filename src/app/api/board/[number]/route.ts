import { formatGithubError } from "@/lib/route";
import { NextResponse } from "next/server";
const GITHUB = "https://api.github.com";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ number: string }> },
) {
  const { number } = await params;

  const res = await fetch(
    `${GITHUB}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/issues/${number}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const errPayload = await formatGithubError(res);
    return NextResponse.json(errPayload, { status: res.status });
  }

  const data = await res.json();

  // allowClosed=1 일때 삭제된 issue 확인 가능
  const allowClosed = new URL(req.url).searchParams.get("allowClosed") === "1";
  if (!allowClosed && data.state !== "open") {
    return NextResponse.json({ error: "issue is closed" }, { status: 404 });
  }

  return NextResponse.json(data);
}
