export type DocumentChangeEvent = {
  timestamp: Date;
  autoCompletionCharCountChange?: number;
  handWrittenCharCountChange?: number;
  filename?: string;
  extension?: string;
  language?: string;
  repository?: string;
  branch?: string;
};

export type AutoCompletionEvent = DocumentChangeEvent & {
  autoCompletionCharCountChange: number;
};

export type HandWrittenEvent = DocumentChangeEvent & {
  handWrittenCharCountChange: number;
};

export type Summarization = {
  autoCompletionEventCount: number;
  autoCompletionCharCount: number;
  handWrittenCharCount: number;
};

export type HourlyAggregate = {
  hour: number;
  totals: Summarization;
  filenames: { [filename: string]: Summarization };
  languages: { [language: string]: Summarization };
  extensions: { [extension: string]: Summarization };
  repositories: { [repository: string]: Summarization };
  branches: { [branch: string]: Summarization };
};
