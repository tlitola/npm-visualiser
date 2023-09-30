import { packageInfo } from "../Package";

export const fetchPackageInfo = async (name: string, version: string) => {
  const result = await fetch(`/api/dependency/${name}/${version}`);
  return packageInfo.parse(await result.json());
};

export const fetchAllPackagesInfo = async (packages: [string, string][]) => {
  const result = await Promise.all(
    packages.map(async (el) => {
      const [name, version] = el;

      return { [`${name}@${version}`]: await fetchPackageInfo(name, version) };
    })
  );

  return result.reduce((acc, el) => {
    return { ...acc, ...el };
  }, {});
};
