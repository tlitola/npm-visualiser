# NPM-visualizer

NPM-visualizer is a tool meant to demystify package-lock.json file and tell you what your project depends on. It not only visualizes the lockfile in human readable way, but it also fetches you information about the dependencies you have, such as downloads and possible vulnerabilities.

## Technologies

NPM-visualizer is build using Next.js and Typescript for both frontend and backend.

On the frontend NPM-visualizer uses [react-bootstrap](https://github.com/react-bootstrap/react-bootstrap) for components and [Tailwindcss](https://tailwindcss.com) for other styling. The frontend is build desktop first as you don't ususally handle lockfiles on mobile. Mobile support might, however, be added later as a practise exercise for me. NPM-visualizer parses the lockfile on the client side using recursion to form a tree to store the dependencies (This is about to change, as I'm currently working on converting it to using a graph for easier usage). It then fetches information about the dependencies from the backend.

On the backend NPM-visualizer fetches information about the packages from [NPM-registry](https://registry.npmjs.org) and [OSV API](https://osv.dev). The fetching is rate-limited using [p-limit](https://www.npmjs.com/package/p-limit), as not to cause too much simultaneous trafic on the APIs. The reguests are then cached before returning them to frontend. For caching, NPM-visualizer uses, by default, filesystem, storing the data to disk. It is, however, possible to opt out of this behaviour, and use [Redis](https://redis.io) instead. NPM-visualizer uses backend to fetch information from external sources, instead of doing it on the frontend, so I can fully control the caching behaviour of the app and possibly in the future use it on other platforms as well.

For tests the NPM-visualizer uses [Vitest](https://vitest.dev). This project has been my introduction to writing tests and test driven development, and I use it to learn how to write tests in my code.

The project is deployed using [Fly](https://fly.io) and the deployment can be viewed at [npm-visualizer.fly.dev](https://npm-visualizer.fly.dev). The deployment uses a Docker image created by a dockerfile, and deployment is automated using github workflows.

## Inspiration

Some of my inspirations for creating and building NPM-visualizer are as follows:

- The project has been a way for me to further my understanding on how NPM functions as a package manager. It has also acted as a way to further my skills with Next.js and Typescript.
- While programming NPM-visualizer, I have practised using tools that make collaborating with others and writing consistent code easier (Such as Husky, Prettier, editorconfig and Eslint)
- NPM-visualizer has also acted as a platform for me to practise writing tests and focus on test-based development.

## Developing

First install dependencies,

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then run the development server,

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The project will now be visible at [localhost:3000](http://localhost:3000)

By default the project caches requests to the disk. You can change the cache folder by specifying `CACHE_DIR` as an environmental variable (default `/cache`). If you wish to use redis for cache instead, add `REDIS_URL` as an environmental variable.
