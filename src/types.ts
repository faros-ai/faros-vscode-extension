export type DocumentChangeEvent = {
  timestamp: Date;
  charCountChange: number;
  type: 'AutoCompletion' | 'HandWritten';
  filename?: string;
  extension?: string;
  language?: string;
  repository?: string;
  branch?: string;
};

export type AutoCompletionEvent = DocumentChangeEvent & {
  type: 'AutoCompletion';
};

export type HandWrittenEvent = DocumentChangeEvent & {
  type: 'HandWritten';
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
