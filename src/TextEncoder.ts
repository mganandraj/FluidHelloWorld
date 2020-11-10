// Copied from https://gist.github.com/Yaffle/5458286

/// Not from this: https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder#Polyfill

let TextEncoderObj = function TextEncoderObj(){};
TextEncoderObj.prototype.encode = function (string: string) {
    var octets = [];
    var length = string.length;
    var i = 0;
    while (i < length) {
      var codePoint = string.codePointAt(i);
      var c = 0;
      var bits = 0;
      if (codePoint <= 0x0000007F) {
        c = 0;
        bits = 0x00;
      } else if (codePoint <= 0x000007FF) {
        c = 6;
        bits = 0xC0;
      } else if (codePoint <= 0x0000FFFF) {
        c = 12;
        bits = 0xE0;
      } else if (codePoint <= 0x001FFFFF) {
        c = 18;
        bits = 0xF0;
      }
      octets.push(bits | (codePoint >> c));
      c -= 6;
      while (c >= 0) {
        octets.push(0x80 | ((codePoint >> c) & 0x3F));
        c -= 6;
      }
      i += codePoint >= 0x10000 ? 2 : 1;
    }
    return octets;
  };

    TextEncoderObj.prototype.toString = function(){return "[object TextEncoder]"};
    try { // Object.defineProperty only works on DOM prototypes in IE8
        Object.defineProperty(TextEncoderObj.prototype,"encoding",{
            get:function(){if(TextEncoderObj.prototype.isPrototypeOf(this)) return"utf-8";
                            else throw TypeError("Illegal invocation");}
        });
    } catch(e) { /*IE6-8 fallback*/ TextEncoderObj.prototype.encoding = "utf-8"; }
    if(typeof Symbol!=="undefined") TextEncoderObj.prototype[Symbol.toStringTag]="TextEncoder";

export let TextEncoder = TextEncoderObj;