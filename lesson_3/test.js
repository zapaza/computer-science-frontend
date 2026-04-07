const { BCD } = require('./answer.js');

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
    
    const BCD1 = new BCD(12345);
    assert(BCD1.length === 5, 'Конструктор корректно устанавливает длину для number');
    assert(BCD1.toString() === '12345', 'Конструктор корректно сохраняет цифры для number');

    const BCD2 = new BCD(9876543210n);
    assert(BCD2.length === 10, 'Конструктор корректно устанавливает длину для bigint');
    assert(BCD2.toString() === '9876543210', 'Конструктор корректно сохраняет цифры для bigint');

    assertThrows(() => new BCD('123'), TypeError, 'Ожидается number или bigint', 'Ошибка при передаче строки');
    assertThrows(() => new BCD(-10), RangeError, 'Число должно быть неотрицательным', 'Ошибка при передаче отрицательного number');
    assertThrows(() => new BCD(-10n), RangeError, 'Число должно быть неотрицательным', 'Ошибка при передаче отрицательного bigint');
    assertThrows(() => new BCD(1.5), TypeError, 'Число должно быть целым', 'Ошибка при передаче дробного числа');
    assertThrows(() => new BCD(Infinity), TypeError, 'Число должно быть конечным', 'Ошибка при передаче Infinity');

    // --- Тест toString ---
    console.log('\n--- Тест метода toString() ---');
    assert(new BCD(0).toString() === '0', 'toString() для 0');
    assert(new BCD(123).toString() === '123', 'toString() для 123');

    // --- Тест toNumber ---
    console.log('\n--- Тест метода toNumber() ---');
    assert(new BCD(42).toNumber() === 42, 'toNumber() возвращает исходное число');
    assertThrows(() => new BCD(2n**53n).toNumber(), RangeError, 'безопасного диапазона', 'toNumber() выбрасывает ошибку для небезопасных целых');

    // --- Тест toBigint ---
    console.log('\n--- Тест метода toBigint() ---');
    const BCD3 = new BCD(123);
    const result = BCD3.toBigint();
    assert(result === 123n, 'toBigint() возвращает BigInt значение числа (123 -> 123n)');
    assert(new BCD(4567).toBigint() === 4567n, 'toBigint() корректно возвращает BigInt для 4567');

    // --- Тест at() ---
    console.log('\n--- Тест метода at() ---');
    const BCD4 = new BCD(12345);
    assert(BCD4.at(0) === 1, 'at(0) возвращает первую цифру');
    assert(BCD4.at(2) === 3, 'at(2) возвращает среднюю цифру');
    assert(BCD4.at(4) === 5, 'at(4) возвращает последнюю цифру');
    assert(BCD4.at(-1) === 5, 'at(-1) возвращает последнюю цифру');
    assert(BCD4.at(-5) === 1, 'at(-5) возвращает первую цифру');
    
    assertThrows(() => BCD4.at(5), RangeError, 'Индекс вне диапазона', 'at(5) выбрасывает ошибку (выход за границу)');
    assertThrows(() => BCD4.at(-6), RangeError, 'Индекс вне диапазона', 'at(-6) выбрасывает ошибку (выход за границу)');

    console.log(`\n--- Итог: Пройдено ${passed}, Провалено ${failed} ---`);

    if (failed > 0) {
        process.exit(1);
    }
}

runTests();
