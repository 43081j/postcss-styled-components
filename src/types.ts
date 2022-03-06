export interface Offset {
  offset: number;
  lines: number;
}

export interface RootConfig {
  sourceOffsets: {
    prefix: Offset;
    suffix: Offset;
  };
  baseIndentations: Map<number, number>;
  expressionStrings: string[];
}

export type NodeRaws = Record<string, string>;
