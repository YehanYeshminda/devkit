export type ShareKind = "diff" | "json" | "markdown";

export type SharePayloadDiff = {
  original: string;
  modified: string;
};

export type SharePayloadJson = {
  /** Raw JSON text (validated server-side). */
  raw: string;
  indent: 2 | 4;
};

export type SharePayloadMarkdown = {
  markdown: string;
};

export type SharePayload = SharePayloadDiff | SharePayloadJson | SharePayloadMarkdown;

export type ShareRecordV1 = {
  v: 1;
  kind: ShareKind;
  ownerId: string;
  createdAt: number;
  payload: SharePayload;
};
