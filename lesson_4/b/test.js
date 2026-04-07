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

    // --- Тесты конструктора и упакованного BCD ---
    console.log('--- Тесты конструктора и упакованного BCD ---');
    
    const BCD1 = new BCD(12345);
    assert(BCD1.length === 5, 'Конструктор корректно устанавливает длину для 12345');
    // В упакованном BCD для 5 цифр должно быть 3 байта (ceil(5/2))
    assert(BCD1.digits.length === 3, 'Память оптимизирована: 3 байта для 5 цифр');

    const BCD2 = new BCD(9876543210n);
    assert(BCD2.length === 10, 'Конструктор корректно устанавливает длину для 9876543210');
    // В упакованном BCD для 10 цифр должно быть 5 байт (ceil(10/2))
    assert(BCD2.digits.length === 5, 'Память оптимизирована: 5 байтов для 10 цифр');

    assertThrows(() => new BCD('123'), TypeError, 'Ожидается number или bigint', 'Ошибка при передаче строки');
    assertThrows(() => new BCD(-10), RangeError, 'Число должно быть неотрицательным', 'Ошибка при передаче отрицательного number');

    // --- Тест toString ---
    console.log('\n--- Тест метода toString() ---');
    assert(new BCD(0).toString() === '0', 'toString() для 0');
    assert(new BCD(123).toString() === '123', 'toString() для 123');
    assert(new BCD(1234).toString() === '1234', 'toString() для 1234');

    // --- Тест toNumber ---
    console.log('\n--- Тест метода toNumber() ---');
    assert(new BCD(42).toNumber() === 42, 'toNumber() возвращает исходное число');

    // --- Тест toBigint ---
    console.log('\n--- Тест метода toBigint() ---');
    assert(new BCD(123).toBigint() === 123n, 'toBigint() возвращает BigInt значение 123n');
    assert(new BCD(4567).toBigint() === 4567n, 'toBigint() возвращает BigInt значение 4567n');

    // --- Тест at() ---
    console.log('\n--- Тест метода at() ---');
    const BCD4 = new BCD(12345);
    assert(BCD4.at(0) === 1, 'at(0) === 1');
    assert(BCD4.at(1) === 2, 'at(1) === 2');
    assert(BCD4.at(2) === 3, 'at(2) === 3');
    assert(BCD4.at(3) === 4, 'at(3) === 4');
    assert(BCD4.at(4) === 5, 'at(4) === 5');
    assert(BCD4.at(-1) === 5, 'at(-1) === 5');
    
    assertThrows(() => BCD4.at(5), RangeError, 'Индекс вне диапазона', 'at(5) выбрасывает ошибку');

    console.log(`\n--- Итог: Пройдено ${passed}, Провалено ${failed} ---`);

    if (failed > 0) {
        process.exit(1);
    }
}

runTests();
