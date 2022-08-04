# How to setup hosting for a new project

1. Add project folder into `projects`
2. Enter project folder
3. Remove `.git` and `package-lock.json` if it exists
4. Run `yarn` once so a new lock file is generated
5. Run command `vercel --scope hoprnet`
6. Once its hosted, copy `projectId` from within `.vercel` folder into a new `deploy.json` file
7. Add `nodeVersion` in `deploy.json` file
8. Add link of the demo URL into the [README](./README.md)
