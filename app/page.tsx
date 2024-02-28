import Image from "next/image";
import LockfileInput from "@/components/dependencyTree/LockfileInput";
import { Stack } from "react-bootstrap";
import Link from "next/link";
import graphPic from "../public/images/graph_background.svg";

export default function Home() {
  return (
    <main className="tw-flex tw-min-h-screen tw-flex-col tw-items-center tw-bg-gray-50 tw-px-4 tw-py-16 ">
      <>
        <section className="tw-relative -tw-mt-16 tw-flex tw-min-h-[max(70vh,500px);] tw-w-screen tw-flex-col tw-items-center tw-justify-center">
          <Image
            src={graphPic}
            alt="background graphic"
            fill={true}
            style={{ objectFit: "cover" }}
            priority
            className="tw-pointer-events-none tw-opacity-[7%]"
          />

          <h1 className="tw-font-bold tw-text-slate-700">Package-lock visualizer</h1>
          <p className="tw-mb-14 tw-text-xl tw-font-medium tw-text-slate-700">Learn what your project depends on</p>
          <LockfileInput />
        </section>

        <section className="tw-flex tw-w-screen tw-flex-col tw-items-center !tw-rounded-none tw-border-0 tw-bg-slate-700 tw-px-14 tw-py-8 tw-text-white">
          <h2 className="tw-mb-8 tw-font-bold">What does it do?</h2>
          <p className="tw-text-left">
            Package-lock visualizer scans your package-lock.json file and provides you with information about the
            packages that you have in an easily readable way. The goal of this project is to demystify the package-lock
            file and tell the user information about the packages they have chosen to use. It not only focuses on the
            direct dependencies of your project, but provides you information on the whole package tree.
          </p>
        </section>
        <Stack direction="horizontal" className="!tw-items-start tw-px-10 tw-py-8">
          <section className="tw-w-full tw-border-r-[1px] tw-border-r-slate-700 tw-pr-14">
            <h2 className="tw-mb-8 tw-text-center tw-font-bold">How does it work?</h2>
            <p>
              Package-lock visualizer scans your package-lock.json file locally and doesn&apos;t store any information
              about your file. It fetches information about your dependencies from two sources. Information about
              dependencies is fetched from{" "}
              <Link className="tw-italic tw-text-black" href={"https://registry.npmjs.org"} target="_blank">
                NPM-registry
              </Link>{" "}
              and information about vulnerabilities from{" "}
              <Link className="tw-italic tw-text-black" href={"https://osv.dev/"} target="_blank">
                OSV API
              </Link>
              .
            </p>
          </section>
          <section className="tw-w-full">
            <h2 className="tw-mb-8 tw-text-center tw-font-bold">Plans for expansion</h2>
            <ul className="tw-list-inside tw-list-disc tw-pl-14">
              <li>Add support for lockfiles from pnpm and yarn</li>
              <li>Calculate the bundled and gzipped size of packages</li>
              <li>Add option to view the tree starting from the leaves</li>
              <li>Add option to view dependencies as a graph</li>
            </ul>
          </section>
        </Stack>
      </>
    </main>
  );
}
