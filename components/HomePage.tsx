import Image from "next/image";
import graphPic from "../public/images/graph_background.svg";
import { Stack } from "react-bootstrap";
import Link from "next/link";
import LockfileInput from "./dependencyTree/LockfileInput";

export default function HomePage() {
  return (
    <>
      <section className="min-h-[max(70vh,500px);]  w-screen flex flex-col items-center justify-center relative -mt-16">
        <Image src={graphPic} alt="background graphic" fill={true} className="opacity-[7%] pointer-events-none" />
        <h1 className="font-bold text-slate-700">Package-lock visualizer</h1>
        <p className="text-slate-700 font-medium text-xl mb-14">Learn what your project depends on</p>
        <LockfileInput />
      </section>

      <section className="bg-slate-700 text-white w-screen py-4 px-14 !rounded-none border-0 flex flex-col items-center">
        <h2 className="font-bold mb-4">What does it do?</h2>
        <p className="text-left">
          Package-lock visualizer scans your package-lock.json file and provides you with information about the packages
          that you have in an easily readable way. The goal of this project is to demystify the package-lock file and
          tell the user information about the packages they have chosen to use. It not only focuses on the direct
          dependencies of your project, but provides you information on the whole package tree.
        </p>
      </section>
      <Stack direction="horizontal" className="py-4 px-10 !items-start">
        <section className="w-full border-r-[1px] border-r-slate-700 pr-14">
          <h2 className="font-bold mb-4 text-center">How does it work?</h2>
          <p>
            Package-lock visualizer scans your package-lock.json file locally and doesn&apos;t store any information
            about your file. It fetches information about your dependencies from two sources. Information about
            dependencies is fetched from{" "}
            <Link className="text-black italic" href={"https://registry.npmjs.org"} target="_blank">
              NPM-registry
            </Link>{" "}
            and information about vulnerabilities from{" "}
            <Link className="text-black italic" href={"https://osv.dev/"} target="_blank">
              OSV API
            </Link>
            .
          </p>
        </section>
        <section className="w-full">
          <h2 className="font-bold mb-4 text-center">Plans for expansion</h2>
          <ul className="pl-14 list-disc list-inside">
            <li>Add support for lockfiles from pnpm and yarn</li>
            <li>Calculate the bundled and gzipped size of packages</li>
            <li>Add option to view the tree starting from the leaves</li>
            <li>Add option to view dependencies as a graph</li>
          </ul>
        </section>
      </Stack>
    </>
  );
}
