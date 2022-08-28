<!-- INTRODUCTION -->
<p align="center">
  <a href="https://github.com/metamathstudios" target="_blank" rel="noopener noreferrer">
    <img width="100" src="https://user-images.githubusercontent.com/78161484/186249688-f56c5b5e-e068-43ca-bc6c-0efe4bf064ca.png" alt="Chatr Logo">
  </a>

  
  <!-- Title Placeholder -->
  <h3 align="center">Chatr!</h3>
  <p align="center">
    <code>A project by MetaMath Studios</code>
  </p>
  <p align="center">
Chatr! is a fully private chat built on top of <a href="https://hoprnet.org">HOPR's</a> mixnet. Chatr provide a secure and private way to chat and send tokens bundled in a simple to use web extension.
  </p>
</p>

<div align="center">

[![GitHub tag](https://img.shields.io/github/tag/metamathstudios/chatr-by-metamath?include_prereleases=&sort=semver)](https://github.com/metamathstudios/chatr-by-metamath/releases/)
[![License](https://img.shields.io/github/license/metamathstudios/chatr-by-metamath)](#license)
<a href="https://chrome.google.com/webstore/detail/chatr/bfcdlkhdghemaahmdlhbknfojecalcgc" target="_blank">
<img src="https://img.shields.io/badge/Chrome-download-blue?logo=googlechrome" alt="Google Web Store">
</a>
  
</div>

## ⚒️ Configuring and using Chatr!

https://user-images.githubusercontent.com/78161484/186452447-5201e3af-460c-4a2a-9e21-e97f927f2046.mp4

## 🖥️ Interoperability with [Myne.chat](https://github.com/hoprnet/myne-chat)

https://user-images.githubusercontent.com/78161484/186452686-a97b14da-83a8-4ab2-ba18-42c1c47bd985.mp4

## 📦 Loading Latest Unpacked Extension Release

https://user-images.githubusercontent.com/78161484/186307184-0d5a4334-4c02-4dd1-b180-35cd55771447.mp4

## Future Features

  - [ ] Release on Chrome Web Extension Store (and other browsers).
  - [ ] Make message history persistent (Cookies).
  - [ ] Extend token transfer to DAI tokens.
  - [ ] Create a Login window, abstracting HOPR node configuration and launching on demand nodes to non-tech-savvy users.
  - [ ] Currenty, aliases are stored locally. HOPR api support setting, reading and deleting peer alias and will be implemented soon.
  
  🚨 Chatr is an open-source project, if you would like to make suggestions or contribute to the project, feel free to create a new PR
  
## Getting Started with Local Development

Chatr requires the following dependencies

- `node.js@v16`
- `yarn`

Clone or fork `chatr-by-metamath`:

```sh
git clone https://github.com/metamathstudios/chatr-by-metamath.git
```

Install dependencies:

```sh
cd chatr-by-metamath
yarn install
```

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
