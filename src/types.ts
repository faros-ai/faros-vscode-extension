export type AutoCompletionEvent = {
  timestamp: Date;
  charCountChange: number;
  filename?: string;
  extension?: string;
  language?: string;
  repository?: string;
  branch?: string;
};

export type HourlyAggregate = {
    hour: number;
    eventCount: number;
    charCount: number;
    filename: Array<string>;
    extension: Array<string>;
    language: Array<string>;
    repository: Array<string>;
    branch: Array<string>;
};

