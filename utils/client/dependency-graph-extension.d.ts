// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../node_modules/dependency-graph/lib/index.d.ts" />

declare module "dependency-graph" {
  export interface DepGraph<T> {
    nodes: Record<string, T>;
  }
}
