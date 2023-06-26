export interface HasString {
  toString(): string;
}

export type StringLike = string | HasString;
