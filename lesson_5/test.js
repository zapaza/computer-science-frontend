const {
    benchmark,
    fillWithTestData,
    ArrayOfObjectsPixelStream,
    TypedArrayPixelStream,
    ArrayOfArraysPixelStream,
    FlatArrayPixelStream,
    traverseMode
} = require('./answer.js');

const benchCount = [64, 256, 1024, 2048, 4096];

for (const size of benchCount) {
    console.log(`\n--- SetSize: ${size}x${size} ---`);

    const streams = [
        { name: 'TypedArray', instance: new TypedArrayPixelStream(size, size) },
        { name: 'FlatArray', instance: new FlatArrayPixelStream(size, size) },
        { name: 'ArrayOfArrays', instance: new ArrayOfArraysPixelStream(size, size) },
        { name: 'ArrayOfObjects', instance: new ArrayOfObjectsPixelStream(size, size) }
    ];

    console.log('--- Initializing data ---');
    for (const s of streams) {
        fillWithTestData(s.instance);
    }

    for (const s of streams) {
        console.log(`--- ${s.name} ---`);
        benchmark(s.instance, traverseMode.ROW_MAJOR, s.name);
        benchmark(s.instance, traverseMode.COLUMN_MAJOR, s.name);
    }
}
