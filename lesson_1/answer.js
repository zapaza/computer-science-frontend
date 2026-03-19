/**
 * Класс для кодирования и декодирования русского текста.
 */
class TextCompressor {
    static ESC = '11111';
    static EXTENDED = '111';

    static BASE_CODES = {
        ' ': '00000', 'о': '00001', 'е': '00010', 'а': '00011', 'и': '00100', 'н': '00101',
        'т': '00110', 'с': '00111', 'р': '01000', 'в': '01001', 'л': '01010', 'к': '01011',
        'м': '01100', 'д': '01101', 'п': '01110', 'у': '10000', 'я': '10001', 'ы': '10010',
        'ь': '10011', 'г': '10100', 'з': '10101', 'б': '10110', 'ч': '10111', 'й': '11000',
        'х': '11001', 'ж': '11010', 'ш': '11011', '.': '11100', ',': '11101',
    };

    static RARE_CODES = {
        'э': '000', 'щ': '001', 'ц': '010', 'ю': '011', 'ф': '100', 'ё': '101', 'ъ': '110',
    };

    static PUNCT_CODES = {
        '!': '0000', '?': '0001', ':': '0010', ';': '0011', '-': '0100', '(': '0101',
        '/': '0110', ')': '1000', '"': '1001', '«': '1010', '»': '1011', '…': '1100',
        '№': '1101', '\\': '1110',
    };

    static CONTROL_CODES = {
        '\t': '00', '\n': '01', 'EOF': '10',
    };

    static TYPES = {
        'CAPS_NEXT': '00', 'CAPS_LOCK': '01', 'DIGIT_ONE': '100', 'DIGIT_RUN': '101',
        'PUNCT': '110', 'CONTROL': '111',
    };

    // Предварительно рассчитанные обратные таблицы для ускорения декодирования
    static REVERSE_BASE = Object.fromEntries(Object.entries(this.BASE_CODES).map(([k, v]) => [
        v,
        k,
    ]));
    static REVERSE_RARE = Object.fromEntries(Object.entries(this.RARE_CODES).map(([k, v]) => [
        v,
        k,
    ]));
    static REVERSE_PUNCT = Object.fromEntries(Object.entries(this.PUNCT_CODES).map(([k, v]) => [
        v,
        k,
    ]));
    static REVERSE_CONTROL = Object.fromEntries(Object.entries(this.CONTROL_CODES).map(([k, v]) => [
        v,
        k,
    ]));

    /**
     * Кодирует текст в Uint8Array.
     * @param {string} text - Исходный текст.
     * @returns {{buffer: Uint8Array, size: number}}
     */
    encode(text) {
        const writer = new BitWriter();
        let isCapsLock = false;
        let i = 0;

        while (i < text.length) {
            const char = text[i];

            // 1. Цифры (без создания временных строк для всей серии)
            if (this._isDigit(char)) {
                if (isCapsLock) {
                    this._writeExtended(writer, TextCompressor.TYPES.CAPS_LOCK);
                    writer.writeBit(0);
                    isCapsLock = false;
                }

                let j = i;
                while (j < text.length && this._isDigit(text[j])) j ++;
                const runLen = j - i;

                if (runLen === 1) {
                    this._writeExtended(writer, TextCompressor.TYPES.DIGIT_ONE);
                    writer.writeBitsValue(parseInt(text[i]), 4);
                } else {
                    this._writeExtended(writer, TextCompressor.TYPES.DIGIT_RUN);
                    this._writeEliasGamma(writer, runLen);
                    for (let k = i; k < j; k ++) {
                        writer.writeBitsValue(parseInt(text[k]), 4);
                    }
                }
                i = j;
                continue;
            }

            // 2. Буквы (русский алфавит)
            if (this._isRussianLetter(char)) {
                const upper = this._isUpper(char);
                const lower = char.toLowerCase();

                if (upper) {
                    if (!isCapsLock) {
                        const nextIsUpper = (i + 1 < text.length && this._isRussianLetter(text[i + 1]) && this._isUpper(text[i + 1]));
                        if (nextIsUpper) {
                            this._writeExtended(writer, TextCompressor.TYPES.CAPS_LOCK);
                            writer.writeBit(1);
                            isCapsLock = true;
                        } else {
                            this._writeExtended(writer, TextCompressor.TYPES.CAPS_NEXT);
                        }
                    }
                } else if (isCapsLock) {
                    this._writeExtended(writer, TextCompressor.TYPES.CAPS_LOCK);
                    writer.writeBit(0);
                    isCapsLock = false;
                }

                if (TextCompressor.BASE_CODES[lower]) {
                    writer.writeBits(TextCompressor.BASE_CODES[lower]);
                } else if (TextCompressor.RARE_CODES[lower]) {
                    writer.writeBits(TextCompressor.ESC);
                    writer.writeBits(TextCompressor.RARE_CODES[lower]);
                }
                i ++;
                continue;
            }

            // 3. Знаки препинания и управление
            if (isCapsLock) {
                this._writeExtended(writer, TextCompressor.TYPES.CAPS_LOCK);
                writer.writeBit(0);
                isCapsLock = false;
            }

            if (TextCompressor.BASE_CODES[char]) {
                writer.writeBits(TextCompressor.BASE_CODES[char]);
            } else if (TextCompressor.PUNCT_CODES[char]) {
                this._writeExtended(writer, TextCompressor.TYPES.PUNCT);
                writer.writeBits(TextCompressor.PUNCT_CODES[char]);
            } else if (TextCompressor.CONTROL_CODES[char]) {
                this._writeExtended(writer, TextCompressor.TYPES.CONTROL);
                writer.writeBits(TextCompressor.CONTROL_CODES[char]);
            } else {
                throw new Error(`Unsupported character: ${ JSON.stringify(char) } at index ${ i }`);
            }
            i ++;
        }

        this._writeExtended(writer, TextCompressor.TYPES.CONTROL);
        writer.writeBits(TextCompressor.CONTROL_CODES['EOF']);

        return { buffer: writer.getUint8Array(), size: writer.bitLength };
    }

    /**
     * Декодирует данные из буфера.
     * @param {Uint8Array} buffer - Сжатые данные.
     * @param {number} bitLength - Размер в битах.
     * @returns {string}
     */
    decode(buffer, bitLength) {
        const reader = new BitReader(buffer, bitLength);
        let text = '';
        let isCapsLock = false;

        const decodeOneChar = (forceUpper) => {
            const chunk5 = reader.readBitsString(5);
            let char;
            if (chunk5 === TextCompressor.ESC) {
                const category = reader.readBitsString(3);
                char = TextCompressor.REVERSE_RARE[category];
                if (!char) {
                    throw new Error('Invalid bitstream: unknown rare category');
                }
            } else {
                char = TextCompressor.REVERSE_BASE[chunk5];
                if (!char) {
                    throw new Error('Invalid bitstream: unknown base code');
                }
            }
            if (forceUpper && !this._isRussianLetter(char)) {
                throw new Error('CAPS_NEXT applied to non-letter character');
            }
            return forceUpper ?
                char.toUpperCase() :
                char;
        };

        while (reader.hasMore(5)) {
            const chunk5 = reader.readBitsString(5);

            if (chunk5 === TextCompressor.ESC) {
                const category = reader.readBitsString(3);
                if (category === TextCompressor.EXTENDED) {
                    let typeMatch = false;
                    for (const [typeName, typeBits] of Object.entries(TextCompressor.TYPES)) {
                        if (reader.peekBitsString(typeBits.length) === typeBits) {
                            reader.skipBits(typeBits.length);
                            typeMatch = true;
                            if (typeName === 'CAPS_NEXT') {
                                text += decodeOneChar(true);
                            } else if (typeName === 'CAPS_LOCK') {
                                isCapsLock = reader.readBit() === 1;
                            } else if (typeName === 'DIGIT_ONE') {
                                text += reader.readBitsValue(4).toString();
                            } else if (typeName === 'DIGIT_RUN') {
                                const len = this._readEliasGamma(reader);
                                for (let k = 0; k < len; k ++) {
                                    text += reader.readBitsValue(4).toString();
                                }
                            } else if (typeName === 'PUNCT') {
                                text += TextCompressor.REVERSE_PUNCT[reader.readBitsString(4)];
                            } else if (typeName === 'CONTROL') {
                                const ctrl = TextCompressor.REVERSE_CONTROL[reader.readBitsString(2)];
                                if (ctrl === 'EOF') {
                                    return text;
                                }
                                text += ctrl;
                            }
                            break;
                        }
                    }
                    if (!typeMatch) {
                        throw new Error('Unknown extended type in bitstream');
                    }
                } else {
                    const char = TextCompressor.REVERSE_RARE[category];
                    text += isCapsLock ?
                        char.toUpperCase() :
                        char;
                }
            } else {
                const char = TextCompressor.REVERSE_BASE[chunk5];
                text += isCapsLock ?
                    char.toUpperCase() :
                    char;
            }
        }
        return text;
    }

    _isDigit(c) {
        return c >= '0' && c <= '9';
    }

    _isRussianLetter(c) {
        return (c >= 'а' && c <= 'я') || (c >= 'А' && c <= 'Я') || c === 'ё' || c === 'Ё';
    }

    _isUpper(c) {
        return (c >= 'А' && c <= 'Я') || c === 'Ё';
    }

    _writeExtended(writer, type) {
        writer.writeBits(TextCompressor.ESC);
        writer.writeBits(TextCompressor.EXTENDED);
        writer.writeBits(type);
    }

    _writeEliasGamma(writer, n) {
        let k = Math.floor(Math.log2(n));
        for (let i = 0; i < k; i ++) {
            writer.writeBit(0);
        }
        for (let i = k; i >= 0; i --) {
            writer.writeBit((n >> i) & 1);
        }
    }

    _readEliasGamma(reader) {
        let k = 0;
        while (reader.readBit() === 0) k ++;
        let n = 1;
        for (let i = 0; i < k; i ++) {
            n = (n << 1) | reader.readBit();
        }
        return n;
    }
}

class BitWriter {
    constructor() {
        this.buffer = new Uint8Array(1024);
        this.bitLength = 0;
    }

    writeBit(bit) {
        if (this.bitLength >= this.buffer.length * 8) {
            const b = new Uint8Array(this.buffer.length * 2);
            b.set(this.buffer);
            this.buffer = b;
        }
        if (bit) {
            this.buffer[this.bitLength >> 3] |= (1 << (7 - (this.bitLength % 8)));
        }
        this.bitLength ++;
    }

    writeBits(str) {
        for (let i = 0; i < str.length; i ++) {
            this.writeBit(str[i] === '1');
        }
    }

    writeBitsValue(val, len) {
        for (let i = len - 1; i >= 0; i --) {
            this.writeBit(((val >> i) & 1) === 1);
        }
    }

    getUint8Array() {
        return this.buffer.slice(0, (this.bitLength + 7) >> 3);
    }
}

class BitReader {
    constructor(buffer, bitLength) {
        this.buffer = buffer;
        this.bitLength = bitLength;
        this.pos = 0;
    }

    readBit() {
        if (this.pos >= this.bitLength) {
            throw new Error('Unexpected end of bitstream');
        }
        const bit = (this.buffer[this.pos >> 3] >> (7 - (this.pos % 8))) & 1;
        this.pos ++;
        return bit;
    }

    readBitsString(len) {
        let s = '';
        for (let i = 0; i < len; i ++) {
            s += this.readBit();
        }
        return s;
    }

    peekBitsString(len) {
        const p = this.pos;
        let s = '';
        try {
            s = this.readBitsString(len);
        } catch (e) {
        }
        this.pos = p;
        return s;
    }

    readBitsValue(len) {
        let v = 0;
        for (let i = 0; i < len; i ++) {
            v = (v << 1) | this.readBit();
        }
        return v;
    }

    skipBits(len) {
        this.pos = Math.min(this.pos + len, this.bitLength);
    }

    hasMore(len) {
        return this.pos + len <= this.bitLength;
    }
}

// Экспорт для возможности тестирования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TextCompressor };
}