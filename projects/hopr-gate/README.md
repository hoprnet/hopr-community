<!-- INTRODUCTION -->
<p align="center">
  <a href="https://github.com/metamathstudios" target="_blank" rel="noopener noreferrer">
    <img width="40%" src="https://user-images.githubusercontent.com/78161484/191833309-70c4d499-eda8-4ec8-9617-d9ec05de4874.png" alt="Hopr Gate Logo">
  </a>
   
  <!-- Title Placeholder -->
  <p align="center">
Hopr Gate is a dApp that demonstrates how to send Ethereum RPC calls over HOPR Mixnet. 
  </p>
</p>

# 🧭 Table of contents

- [🧭 Table of contents](#-table-of-contents)
- [📝 How Hopr Gate Works](#-how-hopr-gate-works)
- [⚒️ Configuring and using Hopr Gate](#-configuring-and-using-hopr-gate)
- [🚀 Getting Started with Local Development](#-getting-started-with-local-development)

## 📝 How Hopr Gate Works

Hopr Gate works in 4 simple steps:

 <p align="center">
  <img width="80%" src="https://user-images.githubusercontent.com/78161484/191838872-92af171d-23f0-4478-9f46-6eee0f466903.png" alt="Hopr Gate in 4 steps">
 </p>
 
 1. Step 1: A RPC Method is requested from an User node to a pre-configured Relayer node. 
 2. Step 2: The Relayer node is connected to a pre-configured RPC endpoint. A RPC method is called over HTTP.
 3. Step 3: The Blockchain which the Relayer is configured to send a response to the remote call over HTTP.
 4. Step 4: The Relayer delivers the response to the user using HOPR's mixnet.

## ⚒ Configuring and using Hopr Gate

https://user-images.githubusercontent.com/78161484/191840277-2a485080-1000-4518-ad3d-a551eae69c04.mp4

## 🚀 Getting Started with Local Development

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

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).<br>
To learn React, check out the [React documentation](https://reactjs.org/).<br>
To learn more about HOPR, check out the [HOPR documentation](https://docs.hoprnet.org/).
