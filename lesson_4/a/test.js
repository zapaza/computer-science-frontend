const { cyclicLeftShift, cyclicRightShift } = require('./answer.js');

/**
 * Простая вспомогательная функция для сравнения значений
 */
function assert(actual, expected, message) {
    const isOk = JSON.stringify(actual) === JSON.stringify(expected);
    if (!isOk) {
        console.error(`FAIL: ${message}`);
        console.error(`  Expected: ${JSON.stringify(expected)}`);
        console.error(`  Actual:   ${JSON.stringify(actual)}`);
        process.exit(1);
    }
    console.log(`OK: ${message}`);
}

function testNumbers() {
    console.log('--- Тестирование чисел (32 бита) ---');
    const n = 0b10000000_00000000_00000000_00000001 >>> 0;

    // Примеры из task.md
    // cyclicLeftShift(0b10000000...01, 1) === 0b00000000...11
    assert(cyclicLeftShift(n, 1), 0b00000000_00000000_00000000_00000011 >>> 0, 'cyclicLeftShift (n, 1)');

    // cyclicRightShift(0b10000000...01, 2) === 0b01100000...00
    assert(cyclicRightShift(n, 2), 0b01100000_00000000_00000000_00000000 >>> 0, 'cyclicRightShift (n, 2)');

    // Сдвиг на 0
    assert(cyclicLeftShift(12345, 0), 12345 >>> 0, 'Left shift by 0');
    assert(cyclicRightShift(12345, 0), 12345 >>> 0, 'Right shift by 0');

    // Сдвиг на 32 (полный цикл)
    assert(cyclicLeftShift(1, 32), 1 >>> 0, 'Left shift by 32');
    assert(cyclicRightShift(1, 32), 1 >>> 0, 'Right shift by 32');

    // Отрицательный сдвиг (влево на -1 == вправо на 1)
    assert(cyclicLeftShift(1, -1), cyclicRightShift(1, 1), 'Left shift by -1 equals Right shift by 1');
    assert(cyclicRightShift(1, -1), cyclicLeftShift(1, 1), 'Right shift by -1 equals Left shift by 1');
}

function testArrays() {
    console.log('\n--- Тестирование массивов ---');
    const arr = ['A', 'B', 'C', 'D'];

    assert(cyclicLeftShift(arr, 1), ['B', 'C', 'D', 'A'], 'Array Left 1');
    assert(cyclicRightShift(arr, 1), ['D', 'A', 'B', 'C'], 'Array Right 1');
    assert(cyclicLeftShift(arr, 2), ['C', 'D', 'A', 'B'], 'Array Left 2');
    assert(cyclicRightShift(arr, 2), ['C', 'D', 'A', 'B'], 'Array Right 2');

    // Сдвиг больше длины
    assert(cyclicLeftShift(arr, 5), ['B', 'C', 'D', 'A'], 'Array Left 5 (length 4)');
    assert(cyclicLeftShift([], 5), [], 'Empty array shift');
}

function testStrings() {
    console.log('\n--- Тестирование строк ---');
    const str = 'ABCD';

    assert(cyclicLeftShift(str, 1), 'BCDA', 'String Left 1');
    assert(cyclicRightShift(str, 1), 'DABC', 'String Right 1');
    assert(cyclicLeftShift(str, 4), 'ABCD', 'String Left 4');
    assert(cyclicLeftShift('', 3), '', 'Empty string shift');
}

try {
    testNumbers();
    testArrays();
    testStrings();
    console.log('\nВсе тесты успешно пройдены!');
} catch (e) {
    console.error('\nПроизошла непредвиденная ошибка во время тестов:');
    console.error(e);
    process.exit(1);
}
