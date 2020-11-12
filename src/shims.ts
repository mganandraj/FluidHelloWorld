// @ts-ignore
import { polyfillGlobal } from 'react-native/Libraries/Utilities/PolyfillFunctions';
import 'react-native-url-polyfill/auto';

const encoding = require('./encoding')

if(typeof TextEncoder === 'undefined' || typeof TextDecoder === 'undefined') {
    polyfillGlobal('TextEncoder', () => encoding.MyTextEncoder);
    polyfillGlobal('TextDecoder', () => encoding.MyTextDecoder);
}

// @ts-ignore
if(typeof performance === 'undefined')
    polyfillGlobal('performance', () => require('./performance').PERF);

if (typeof Buffer === 'undefined') 
    polyfillGlobal('Buffer', () => require('buffer').Buffer);

// global.Buffer = require('buffer').Buffer

if (typeof process === 'undefined') {
    global.process = require('process')
}

process.browser = true // https://github.com/crypto-browserify/pbkdf2/blob/4a4deed4d115d55a698cf1292abef4f38cdbe922/lib/default-encoding.js#L3

if(typeof crypto === 'undefined') {
    console.warn('Polyfilling crypto');
    polyfillGlobal('crypto', () => require('crypto'));  // react-native-crypto
}

if(typeof Crypto === 'undefined' || typeof Crypto.subtle === 'undefined' ) {
    const shajs = require('sha.js')

    console.warn('Polyfilling Crypto');
    // polyfillGlobal('Crypto', () => { return {'subtle': require('isomorphic-webcrypto').subtle} }); 
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


// isomorphic-webcrypto introduces a minimal document object !
// global.document = undefined;