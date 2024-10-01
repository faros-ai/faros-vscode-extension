export type AutoCompletionEvent = {
  timestamp: Date;
  charCountChange: number;
  filename?: string;
  extension?: string;
  language?: string;
  repository?: string;
  branch?: string;
};
