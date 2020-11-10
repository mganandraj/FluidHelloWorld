// Copied from https://gist.github.com/Yaffle/5458286

let TextDecoderObj = function TextDecoderObj(){};
TextDecoderObj.prototype.decode = function (octets: any) {
  var string = "";
  var i = 0;
  while (i < octets.length) {
    var octet = octets[i];
    var bytesNeeded = 0;
    var codePoint = 0;
    if (octet <= 0x7F) {
      bytesNeeded = 0;
      codePoint = octet & 0xFF;
    } else if (octet <= 0xDF) {
      bytesNeeded = 1;
      codePoint = octet & 0x1F;
    } else if (octet <= 0xEF) {
      bytesNeeded = 2;
      codePoint = octet & 0x0F;
    } else if (octet <= 0xF4) {
      bytesNeeded = 3;
      codePoint = octet & 0x07;
    }
    if (octets.length - i - bytesNeeded > 0) {
      var k = 0;
      while (k < bytesNeeded) {
        octet = octets[i + k + 1];
        codePoint = (codePoint << 6) | (octet & 0x3F);
        k += 1;
      }
    } else {
      codePoint = 0xFFFD;
      bytesNeeded = octets.length - i;
    }
    string += String.fromCodePoint(codePoint);
    i += bytesNeeded + 1;
  }
  return string
};

    TextDecoderObj.prototype.toString = function(){return "[object TextDecoder]"};
    try { // Object.defineProperty only works on DOM prototypes in IE8
        Object.defineProperty(TextDecoderObj.prototype,"encoding",{
            get:function(){if(TextDecoderObj.prototype.isPrototypeOf(this)) return"utf-8";
                            else throw TypeError("Illegal invocation");}
        });
    } catch(e) { /*IE6-8 fallback*/ TextDecoderObj.prototype.encoding = "utf-8"; }
    if(typeof Symbol!=="undefined") TextDecoderObj.prototype[Symbol.toStringTag]="TextDecoder";

export let TextDecoder = TextDecoderObj;