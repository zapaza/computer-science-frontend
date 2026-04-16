const traverseMode = {
    ROW_MAJOR: 'row-major',
    COLUMN_MAJOR: 'column-major'
}

class BasePixelStream {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    setPixel(x, y, color) {}

    getPixel(x, y) {}

    forEach(mode, callback) {
        if (mode === traverseMode.ROW_MAJOR) {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    callback(this.getPixel(x, y), x, y);
                }
            }
        } else if (mode === traverseMode.COLUMN_MAJOR) {
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    callback(this.getPixel(x, y), x, y);
                }
            }
        }
    }
}


class TypedArrayPixelStream extends BasePixelStream {
    constructor(width, height) {
        super(width, height);
        this.data = new Uint8ClampedArray(width * height * 4);
    }

    _getIndex(x, y) {
        return (y * this.width + x) * 4;
    }

    setPixel(x, y, color) {
        const index = this._getIndex(x, y);
        this.data[index] = color.r;
        this.data[index + 1] = color.g;
        this.data[index + 2] = color.b;
        this.data[index + 3] = color.a;
    }

    getPixel(x, y) {
        const index = this._getIndex(x, y);
        return [
            this.data[index],
            this.data[index + 1],
            this.data[index + 2],
            this.data[index + 3],
        ]
    }
}

class ArrayOfObjectsPixelStream extends BasePixelStream {
    constructor(width, height) {
        super(width, height);
        this.data = new Array(width * height).fill(null).map(() => ({r: 0, g: 0, b: 0, a: 0}));
    }

    setPixel(x, y, color) {
        const pixel = this.data[y * this.width + x];
        pixel.r = color.r;
        pixel.g = color.g;
        pixel.b = color.b;
        pixel.a = color.a;
    }

    getPixel(x, y) {
        const p = this.data[y * this.width + x];
        return [p.r, p.g, p.b, p.a];
    }
}

class ArrayOfArraysPixelStream extends BasePixelStream {
    constructor(width, height) {
        super(width, height);
        this.data = new Array(width * height);
        for (let i = 0; i < this.data.length; i++) {
            this.data[i] = [0, 0, 0, 0];
        }
    }

    setPixel(x, y, color) {
        const pixel = this.data[y * this.width + x];
        pixel[0] = color.r;
        pixel[1] = color.g;
        pixel[2] = color.b;
        pixel[3] = color.a;
    }

    getPixel(x, y) {
        return this.data[y * this.width + x];
    }
}

class FlatArrayPixelStream extends BasePixelStream {
    constructor(width, height) {
        super(width, height);
        this.data = new Array(width * height * 4).fill(0);
    }

    _getIndex(x, y) {
        return (y * this.width + x) * 4;
    }

    setPixel(x, y, color) {
        const index = this._getIndex(x, y);
        this.data[index] = color.r;
        this.data[index + 1] = color.g;
        this.data[index + 2] = color.b;
        this.data[index + 3] = color.a;
    }

    getPixel(x, y) {
        const index = this._getIndex(x, y);
        return [
            this.data[index],
            this.data[index + 1],
            this.data[index + 2],
            this.data[index + 3],
        ]
    }
}

function benchmark(stream, mode, label) {
    let checksum = 0;
    const start = performance.now();

    stream.forEach(mode, (rgba) => {
        checksum = (checksum + rgba[0] + rgba[1] + rgba[2]) % 1000000;
    });

    const end = performance.now();
    console.log(`${label} (${mode}): ${(end - start).toFixed(2)}ms (chk: ${checksum})`);
}

function fillWithTestData(stream) {
    for (let y = 0; y < stream.height; y++) {
        for (let x = 0; x < stream.width; x++) {
            // Заполняем какими-то данными, например градиентом
            stream.setPixel(x, y, {
                r: (x % 256),
                g: (y % 256),
                b: ((x + y) % 256),
                a: 255
            });
        }
    }
}

module.exports = {
    benchmark,
    TypedArrayPixelStream,
    ArrayOfObjectsPixelStream,
    ArrayOfArraysPixelStream,
    FlatArrayPixelStream,
    fillWithTestData,
    traverseMode
};