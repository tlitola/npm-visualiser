import { NextRequest } from "next/server";
import { z } from "zod";
import { BadDependencyError } from "@/utils/server/BadDependencyError";

const dependencyQuerySchema = z.array(z.string().includes(":"));

export const withDependenciesHandler = async <TResult>(
  fetchFunction: (name: string, version: string) => Promise<TResult>,
  request: NextRequest,
): Promise<{
  data: Record<string, TResult>;
  missing: string[];
}> => {
  const dependencies = request.nextUrl.searchParams.get("dependencies")?.split(",");
  const parsed = dependencyQuerySchema.safeParse(dependencies);

  if (!parsed.success) throw parsed.error;

  const responses = await Promise.allSettled(
    parsed.data.map(async (dependency) => {
      const [name, version] = dependency.split(":");
      if (!name || !version)
        throw new BadDependencyError(
          `${name}:${version}`,
          "Dependencies need to be given in following format: name:version",
        );
      return { [`${name}:${version}`]: await fetchFunction(name, version) };
    }),
  );

  return responses.reduce(
    (acc, el) => {
      if (el.status === "fulfilled") {
        const [key, value] = Object.entries(el.value)[0];
        acc.data = { ...acc.data, [key]: value };
      } else {
        if (el.reason instanceof BadDependencyError) {
          acc.data = { ...acc.data, [el.reason.dependency]: {} };
          acc.missing = [...acc.missing, el.reason.dependency];
        }
      }
      return acc;
    },
    { data: {}, missing: [] as string[] },
  );
};
