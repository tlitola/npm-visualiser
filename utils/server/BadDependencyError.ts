export class BadDependencyError extends Error {
  dependency: string;

  constructor(dependency: string, message: string) {
    super(message);
    this.name = "BadDependencyError";
    this.dependency = dependency;
  }
}
