export const BOARD = {
  QNA: { label: "qna", path: "/qna", name: "질문게시판" },
  COMMUNITY: { label: "community", path: "/community", name: "자유게시판" },
} as const;

export type BoardKey = keyof typeof BOARD;
