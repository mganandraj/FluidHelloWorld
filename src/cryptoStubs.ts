class CryptoHash {
    data: string;
    constructor() {
        this.data = "";
    }

    digest = (str: string) => {
        // @ts-ignore
        let result = global.nativeSha1Digest(this.data);
        console.warn(`crypto.digest -- input: ${this.data} -- output: ${result}`);
        return result;
    }

    update = (str: string) => {
        this.data = this.data + str;
        console.warn(`crypto.update -- input: ${str} -- output: ${this.data}`);
        return this;
    }
}

let cryptoObj: any = {};
cryptoObj.createHash = function(algorithm: string) {
    return new CryptoHash();
}

export let CRYPTO = cryptoObj, SHA1 = CryptoHash;
