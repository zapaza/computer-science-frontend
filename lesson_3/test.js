const { BSD } = require('./answer.js');

function runTests() {
    let passed = 0;
    let failed = 0;


    function assert(condition, message) {
        if (condition) {
            passed++;
            console.log(`✅ [PASS] ${message}`);
        } else {
            failed++;
            console.error(`❌ [FAIL] ${message}`);
        }
    }

    function assertThrows(fn, expectedErrorType, expectedErrorMessage, message) {
        try {
            fn();
            failed++;
            console.error(`❌ [FAIL] ${message} (Ожидалась ошибка ${expectedErrorType.name})`);
        } catch (e) {
            if (e instanceof expectedErrorType && (expectedErrorMessage === undefined || e.message.includes(expectedErrorMessage))) {
                passed++;
                console.log(`✅ [PASS] ${message} (Поймана ожидаемая ошибка: ${e.message})`);
            } else {
                failed++;
                console.error(`❌ [FAIL] ${message} (Поймана неверная ошибка: ${e.name}: ${e.message})`);
            }
        }
    }

    // --- Тесты конструктора и валидации ---
    console.log('--- Тесты конструктора и валидации ---');
    
    const bsd1 = new BSD(12345);
    assert(bsd1.length === 5, 'Конструктор корректно устанавливает длину для number');
    assert(bsd1.toString() === '12345', 'Конструктор корректно сохраняет цифры для number');

    const bsd2 = new BSD(9876543210n);
    assert(bsd2.length === 10, 'Конструктор корректно устанавливает длину для bigint');
    assert(bsd2.toString() === '9876543210', 'Конструктор корректно сохраняет цифры для bigint');

    assertThrows(() => new BSD('123'), TypeError, 'Ожидается number или bigint', 'Ошибка при передаче строки');
    assertThrows(() => new BSD(-10), RangeError, 'Число должно быть неотрицательным', 'Ошибка при передаче отрицательного number');
    assertThrows(() => new BSD(-10n), RangeError, 'Число должно быть неотрицательным', 'Ошибка при передаче отрицательного bigint');
    assertThrows(() => new BSD(1.5), TypeError, 'Число должно быть целым', 'Ошибка при передаче дробного числа');
    assertThrows(() => new BSD(Infinity), TypeError, 'Число должно быть конечным', 'Ошибка при передаче Infinity');

    // --- Тест toString ---
    console.log('\n--- Тест метода toString() ---');
    assert(new BSD(0).toString() === '0', 'toString() для 0');
    assert(new BSD(123).toString() === '123', 'toString() для 123');

    // --- Тест toNumber ---
    console.log('\n--- Тест метода toNumber() ---');
    assert(new BSD(42).toNumber() === 42, 'toNumber() возвращает исходное число');
    assertThrows(() => new BSD(2n**53n).toNumber(), RangeError, 'безопасного диапазона', 'toNumber() выбрасывает ошибку для небезопасных целых');

    // --- Тест toBigint (BCD packing) ---
    console.log('\n--- Тест метода toBigint() (BCD упаковка) ---');
    // 123 -> (1 << 8) | (2 << 4) | 3 = 0x123
    const bsd3 = new BSD(123);
    const packed = bsd3.toBigint();
    assert(packed === 0x123n, 'toBigint() упаковывает цифры в нибблы (123 -> 0x123)');
    assert(new BSD(4567).toBigint() === 0x4567n, 'toBigint() корректно упаковывает 4567');

    // --- Тест at() ---
    console.log('\n--- Тест метода at() ---');
    const bsd4 = new BSD(12345);
    assert(bsd4.at(0) === 1, 'at(0) возвращает первую цифру');
    assert(bsd4.at(2) === 3, 'at(2) возвращает среднюю цифру');
    assert(bsd4.at(4) === 5, 'at(4) возвращает последнюю цифру');
    assert(bsd4.at(-1) === 5, 'at(-1) возвращает последнюю цифру');
    assert(bsd4.at(-5) === 1, 'at(-5) возвращает первую цифру');
    
    assertThrows(() => bsd4.at(5), RangeError, 'Индекс вне диапазона', 'at(5) выбрасывает ошибку (выход за границу)');
    assertThrows(() => bsd4.at(-6), RangeError, 'Индекс вне диапазона', 'at(-6) выбрасывает ошибку (выход за границу)');

    console.log(`\n--- Итог: Пройдено ${passed}, Провалено ${failed} ---`);

    if (failed > 0) {
        process.exit(1);
    }
}

runTests();
