export interface PackageLock {
  name: string;
  version: string;
  lockfileVersion: number;
  requires: boolean;
  packages: {
    "": {
      name: string;
      version: string;
      dependencies: {
        [key: string]: string;
      };
    };
  } & {
    [key: string]: {
      version: string;
      resolved: string;
      integrity: string;
      dependencies?: {
        [key: string]: string;
      };
      [key: string]: any;
    };
  };
}
