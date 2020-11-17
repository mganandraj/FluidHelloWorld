// @ts-nocheck
import { polyfillGlobal } from 'react-native/Libraries/Utilities/PolyfillFunctions';

// We rewrite the following node services with the help of "babel-plugin-rewrite-require" plugin.
// aliases: {
//     stream: 'stream-browserify',
//     path: 'path-browserify',
//     crypto: 'react-native-crypto'
// }

// Encoding API (https://developer.mozilla.org/en-US/docs/Web/API/Encoding_API) is not available in RN environment.
// Fluid is currently using them in conjunction with Crypto APIs to hash text.
// We & Web-standard needs only UTF8 encoding.
// There are multiple alternative polyfills available,
// 1. 'fastestsmallesttextencoderdecoder': The module export currently directly work in react-native environment.
// 2. 'text-encoding': It is working fine, but it adds a big footprint to bit footprint to bundle and global object, in the form of code mappings for encoding that we don't need.
//
// There are other alternatives which we haven;t tried. Here, we have take the source file from 'text-encoding' with a small change to avoid the mapping tables from included in the bundle.
if(typeof TextEncoder === 'undefined' || typeof TextDecoder === 'undefined') {
    const encoding = require('./encoding');
    polyfillGlobal('TextEncoder', () => encoding.TextEncoder);
    polyfillGlobal('TextDecoder', () => encoding.TextDecoder);
}


// We are overriding the default URL implementation, specifically for "localhost" URL support.
// Details are documented here: https://www.npmjs.com/package/react-native-url-polyfill
import 'react-native-url-polyfill/auto';

// Fluid relies on high performance timers backed by performance.Now (https://developer.mozilla.org/en-US/docs/Web/API/Performance/now)
if(typeof performance === 'undefined') {
    let performanceObj: any = {
        "now": function() {
            
            //   I've this is JSIExecutor.cpp
            //   runtime_->global().setProperty(
            //     *runtime_,
            //     "nativePerformanceNow",
            //     Function::createFromHostFunction(
            //         *runtime_,
            //         PropNameID::forAscii(*runtime_, "nativePerformanceNow"),
            //         0,
            //         [](
            //             jsi::Runtime &runtime,
            //             const jsi::Value &,
            //             const jsi::Value *args,
            //             size_t count) {
            //             return jsi::Value((double)std::chrono::high_resolution_clock::now().time_since_epoch().count());
            //         }
            //     )
            // );

            if (typeof global.nativePerformanceNow !== undefined) {
                return global.nativePerformanceNow();
            } else {
                return Date.now(); // Note: The granularity of Date.now() may not suffice for Fluid.
            }
        },
        "mark": function (markName: string) {
            console.log(`performance: mark ${markName}`);
        },
        "measure": function(measureName: string, startMark: string, endMark: string) {
            console.log(`performance: measure ${measureName} ${startMark} ${endMark}`);
        },
        "clearMarks": function(markName: string) {
            console.log(`performance: clearMarks ${markName}`);
        },
        "clearMeasures": function()  {
            console.log(`performance: clearMeasures`);
        }
    };

    polyfillGlobal('performance', () => performanceObj);
}

if (typeof Buffer === 'undefined') 
    polyfillGlobal('Buffer', () => require('buffer').Buffer);

if (typeof process === 'undefined') {
    polyfillGlobal('process', () => require('process'));
}

process.browser = true // https://github.com/crypto-browserify/pbkdf2/blob/4a4deed4d115d55a698cf1292abef4f38cdbe922/lib/default-encoding.js#L3

if(typeof crypto === 'undefined') {
    polyfillGlobal('crypto', () => require('crypto'));  // react-native-crypto
}

// Fluid relies on SubtleCrypto for creating "SHA1" digests for verifying git blobs while summarizing. There may be other uses as well.
if(typeof Crypto === 'undefined' || typeof Crypto.subtle === 'undefined' ) {

    // We tried a more complete polyfill with the help of isomorphic-webcrypto, but it had a bunch of issues.
    // polyfillGlobal('Crypto', () => { return {'subtle': require('isomorphic-webcrypto').subtle} }); 

    // A tiny implementation which satisfies the need for running Fluid at present.
    let subtleCrypto = {'digest': (algorithm, data) => { 
            if(algorithm != "SHA-1") 
                throw 'Our crypto.subtle.digest shim supports only SHA-1 algorithm!';
            
            let digest = crypto.createHash("SHA1").update(Buffer.from(data)).digest();
            return new Uint8Array(digest).buffer;
        }
    };

    polyfillGlobal('Crypto', () => { return {'subtle': subtleCrypto}; }); 
}

if(typeof crypto.subtle === 'undefined') {
    crypto.subtle = Crypto.subtle;
}


// isomorphic-webcrypto introduces a minimal document object which breaks other code !
// global.document = undefined;