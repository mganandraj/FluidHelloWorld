// @ts-ignore
import { polyfillGlobal } from 'react-native/Libraries/Utilities/PolyfillFunctions';

// We rewrite the following node services with the help of "babel-plugin-rewrite-require" plugin.
// aliases: {
//     stream: 'stream-browserify',
//     path: 'path-browserify',
//     crypto: 'react-native-crypto'
// }

// We are overriding the default URL implementation, specifically for "localhost" URL support.
// Details are documented here: https://www.npmjs.com/package/react-native-url-polyfill
import 'react-native-url-polyfill/auto';

// Encoding API (https://developer.mozilla.org/en-US/docs/Web/API/Encoding_API) is not available in RN environment.
// Fluid is currently using them in conjunction with Crypto APIs to hash text.
if(typeof TextEncoder === 'undefined' || typeof TextDecoder === 'undefined') {
    const encoding = require('text-encoding');
    polyfillGlobal('TextEncoder', () => encoding.TextEncoder);
    polyfillGlobal('TextDecoder', () => encoding.TextDecoder);
}

// Fluid relies on high performance timers backed by performance.Now (https://developer.mozilla.org/en-US/docs/Web/API/Performance/now)
// @ts-ignore
if(typeof performance === 'undefined')
    polyfillGlobal('performance', () => require('./performance').PERF);

if (typeof Buffer === 'undefined') 
    polyfillGlobal('Buffer', () => require('buffer').Buffer);

if (typeof process === 'undefined') {
    polyfillGlobal('process', () => require('process'));
}

// @ts-ignore
process.browser = true // https://github.com/crypto-browserify/pbkdf2/blob/4a4deed4d115d55a698cf1292abef4f38cdbe922/lib/default-encoding.js#L3

if(typeof crypto === 'undefined') {
    console.warn('Polyfilling crypto');
    polyfillGlobal('crypto', () => require('crypto'));  // react-native-crypto
}

// Fluid relies on SubtleCrypto for creating "SHA1" digests for verifying git blobs while summarizing. There may be other uses as well.
// @ts-ignore
if(typeof Crypto === 'undefined' || typeof Crypto.subtle === 'undefined' ) {

    // We tried a more complete polyfill with the help of isomorphic-webcrypto, but it had a bunch of issues.
    // polyfillGlobal('Crypto', () => { return {'subtle': require('isomorphic-webcrypto').subtle} }); 

    // A tiny implementation which satisfies the need for running Fluid at present.
    // @ts-ignore
    let subtleCrypto = {'digest': (algorithm, data) => { 
            if(algorithm != "SHA-1") 
                throw 'Our crypto.subtle.digest shim supports only SHA-1 algorithm!';
            
            // @ts-ignore
            let digest = crypto.createHash("SHA1").update(Buffer.from(data)).digest();
            return new Uint8Array(digest).buffer;
        }
    };

    polyfillGlobal('Crypto', () => { return {'subtle': subtleCrypto}; }); 
}

if(typeof crypto.subtle === 'undefined') {
    // @ts-ignore
    crypto.subtle = Crypto.subtle;
}


// isomorphic-webcrypto introduces a minimal document object which breaks other code !
// global.document = undefined;