const execute = require('./answer.js');

const instructions = {
    'SET A': 0,
    'PRINT A': 1,
    'IFN A': 2,
    'RET': 3,
    'DEC A': 4,
    'JMP': 5
};

const testCases = [
    {
        name: "Позитивный тест (Цикл от 10 до 0)",
        program: [
            instructions['SET A'], 10,
            instructions['PRINT A'],
            instructions['IFN A'],
            instructions['RET'], 0,
            instructions['DEC A'],
            instructions['JMP'], 2
        ],
        expectedResult: 0,
        shouldFail: false
    },
    {
        name: "Негативный тест (Строка вместо числа в SET A)",
        program: [
            instructions['SET A'], '0',
            instructions['PRINT A'],
            instructions['IFN A'],
            instructions['RET'], -1,
            instructions['DEC A'],
            instructions['JMP'], 2
        ],
        shouldFail: true,
        expectedError: "Ошибка типа: SET A ожидает число"
    },
    {
        name: "Граничный случай (RET без аргумента)",
        program: [
            instructions['SET A'], 5,
            instructions['RET']
        ],
        shouldFail: true,
        expectedError: "RET ожидает аргумент"
    },
    {
        name: "Неизвестная команда",
        program: [
            99, 1 // Опкод 99 не существует
        ],
        shouldFail: true,
        expectedError: "Неизвестная команда: 99"
    }
];

function runTests() {
    let passedCount = 0;

    console.log("=== ЗАПУСК ТЕСТОВ ИНТЕРПРЕТАТОРА ===\n");

    testCases.forEach((test, index) => {
        console.log(`Тест #${index + 1}: ${test.name}`);
        try {
            const result = execute(test.program);
            
            if (test.shouldFail) {
                console.error(`  ОШИБКА: Тест должен был завершиться с ошибкой, но вернул: ${result}`);
            } else if (result === test.expectedResult) {
                console.log(`  УСПЕХ: Результат совпал (${result})`);
                passedCount++;
            } else {
                console.error(`  ОШИБКА: Ожидалось ${test.expectedResult}, получено ${result}`);
            }
        } catch (error) {
            if (test.shouldFail && error.message.includes(test.expectedError)) {
                console.log(`  УСПЕХ: Поймана ожидаемая ошибка: "${error.message}"`);
                passedCount++;
            } else if (test.shouldFail) {
                console.error(`  ОШИБКА: Поймана ошибка, но не та: "${error.message}" (Ожидалось включение: "${test.expectedError}")`);
            } else {
                console.error(`  КРИТИЧЕСКАЯ ОШИБКА: ${error.message}`);
                console.error(error.stack);
            }
        }
        console.log("");
    });

    console.log(`--- Итог: Пройдено ${passedCount} из ${testCases.length} тестов ---`);
    if (passedCount !== testCases.length) {
        process.exit(1);
    }
}

runTests();
