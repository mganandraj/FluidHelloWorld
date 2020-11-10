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
npm run start
```

Alternatively, the Javascript bundle can be generated to package it with the application package,

```bash
npx react-native bundle --entry-file .\built\rnView.js --platform android --bundle-output index.android.bundle
```

To webpack the web bundle and output the result in `./dist`, you can run:

```bash
npm run build
```

NOTE: The react native runtime must have _nativePerformanceNow_ in _global_ for Fluid runtime to work correctly. Currently, i've added the following snipped to JSIExecutor.cpp in react-native to have it,

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