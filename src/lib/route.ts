export async function formatGithubError(res: Response) {
  const text = await res.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = undefined;
  }

  const baseMsg =
    typeof json?.message === "string" && json.message.trim()
      ? json.message.trim()
      : "";

  const firstErrorMsg =
    Array.isArray(json?.errors) && typeof json.errors[0]?.message === "string"
      ? json.errors[0].message
      : "";

  const message =
    baseMsg || firstErrorMsg
      ? [baseMsg, firstErrorMsg].filter(Boolean).join(" : ")
      : "Upstream error";

  return {
    status: res.status,
    error: "github_error",
    github: {
      message,
      errors: json?.errors,
      raw: json ? undefined : text || undefined,
    },
  };
}
