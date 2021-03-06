# @fluid-example/hello-world

This repository contains a simple app that enables all connected clients to roll a dice and view the result.
For a walkthrough of this example and how it works, check out the [tutorial documentation](https://aka.ms/fluid/tutorial).

## Getting Started

After cloning the repository, install dependencies with:

```bash
npm install
```

You can then run the example browser app with:

```bash
npm start
```

This will open a browser window to the example.  You can navigate to the same URL in a second window to see changes propagating between clients.

You can run the RN server with the following commands:

First build the typescript sources (Note: This can be automated)

```bash
npx tsc
```

Then, start the RN dev server,

```bash
npm run start (or npx react-native start)
```

Ensure that dev server port is mapped,

```bash
adb reverse tcp:8081 tcp:8081
```

Alternatively, the Javascript bundle can be generated and packaged as an application asset for release to the users,

```bash
npx react-native bundle --entry-file .\built\rnView.js --platform android --dev false --bundle-output index.android.bundle --sourcemap-output index.android.bundle.map
copy index.android.bundle .\android\app\src\main\assets\index.android.bundle
```
Generate bytecodes if Hermes engine is used,

```bash
copy index.android.bundle index.android.bundle.js
.\node_modules\hermes-engine\win64-bin\hermes.exe -Wno-undefined-variable -O -emit-binary -non-strict -target=HBC -out index.android.bundle index.android.bundle.js -fstrip-function-names
copy index.android.bundle .\android\app\src\main\assets\index.android.bundle
```

If using tinylicious server, ensure the server is running on host machine and the server port is reverse mapped,
```bash
npm run start:server (or run 'tinylicious')
adb reverse tcp:3000 tcp:3000
```

To webpack the web bundle and output the result in `./dist`, you can run:

```bash
npm run build
```

Notes: 

1. The react native runtime must have _nativePerformanceNow_ in _global_ for Fluid runtime to work correctly. I've added the following snippet to JSIExecutor.cpp in react-native to have it,

```cpp
  runtime_->global().setProperty(
      *runtime_,
      "nativePerformanceNow",
      Function::createFromHostFunction(
          *runtime_,
          PropNameID::forAscii(*runtime_, "nativePerformanceNow"),
          0,
          [](
              jsi::Runtime &runtime,
              const jsi::Value &,
              const jsi::Value *args,
              size_t count) {
            return jsi::Value((double)std::chrono::high_resolution_clock::now().time_since_epoch().count());
          }
      )
  );
```

2. Fluid core requires [_Web Crypo APIs_](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) available in the Javascript runtime. We've currently used [_react-native-crypto_](https://www.npmjs.com/package/react-native-crypto) package. Another alternative is [_isomorphic-webcrypto_](https://github.com/kevlened/isomorphic-webcrypto).
3. react-native-crypto requires react-native-randombytes, which requires a native module to be setup.
4. Having a single project mixing DOM and react-native code is bad. This project should be refactored into a monorepo with separate projects.