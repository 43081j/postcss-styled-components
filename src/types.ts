export interface Offset {
  offset: number;
  lines: number;
}

export interface RootConfig {
  sourceOffsets: {
    prefix: Offset;
    suffix: Offset;
  };
  cssOffsets: {
    prefix: Offset;
    suffix: Offset;
  };
  baseIndentations: Map<number, number>;
  expressionStrings: string[];
}
