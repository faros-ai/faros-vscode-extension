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
    filename: Set<string>;
    extension: Set<string>;
    language: Set<string>;
    repository: Set<string>;
    branch: Set<string>;
};

