import Image from "next/image";
import Link from "next/link";
import { Stack } from "react-bootstrap";
import graphPic from "../public/images/graph_background.svg";
import LockfileInput from "./dependencyTree/LockfileInput";

export default function HomePage() {
  return (
    <>
      <section className="tw-min-h-[max(70vh,500px);] tw-w-screen tw-flex tw-flex-col tw-items-center tw-justify-center tw-relative -tw-mt-16">
        <Image
          src={graphPic}
          alt="background graphic"
          fill={true}
          style={{ objectFit: "cover" }}
          priority
          className="tw-opacity-[7%] tw-pointer-events-none"
        />

        <h1 className="tw-font-bold tw-text-slate-700">Package-lock visualizer</h1>
        <p className="tw-text-slate-700 tw-font-medium tw-text-xl tw-mb-14">Learn what your project depends on</p>
        <LockfileInput />
      </section>

      <section className="tw-bg-slate-700 tw-text-white tw-w-screen tw-py-8 tw-px-14 !tw-rounded-none tw-border-0 tw-flex tw-flex-col tw-items-center">
        <h2 className="tw-font-bold tw-mb-8">What does it do?</h2>
        <p className="tw-text-left">
          Package-lock visualizer scans your package-lock.json file and provides you with information about the packages
          that you have in an easily readable way. The goal of this project is to demystify the package-lock file and
          tell the user information about the packages they have chosen to use. It not only focuses on the direct
          dependencies of your project, but provides you information on the whole package tree.
        </p>
      </section>
      <Stack direction="horizontal" className="tw-py-8 tw-px-10 !tw-items-start">
        <section className="tw-w-full tw-border-r-[1px] tw-border-r-slate-700 tw-pr-14">
          <h2 className="tw-font-bold tw-mb-8 tw-text-center">How does it work?</h2>
          <p>
            Package-lock visualizer scans your package-lock.json file locally and doesn&apos;t store any information
            about your file. It fetches information about your dependencies from two sources. Information about
            dependencies is fetched from{" "}
            <Link className="tw-text-black tw-italic" href={"https://registry.npmjs.org"} target="_blank">
              NPM-registry
            </Link>{" "}
            and information about vulnerabilities from{" "}
            <Link className="tw-text-black tw-italic" href={"https://osv.dev/"} target="_blank">
              OSV API
            </Link>
            .
          </p>
        </section>
        <section className="tw-w-full">
          <h2 className="tw-font-bold tw-mb-8 tw-text-center">Plans for expansion</h2>
          <ul className="tw-pl-14 tw-list-disc tw-list-inside">
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
