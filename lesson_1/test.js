const { TextCompressor } = require('./answer.js');

const compressor = new TextCompressor();
const testCases = [
    "Привет, мир!",
    "МГУ, 2026 год.",
    "Съешь ещё этих мягких французских булок, да выпей чаю.",
    "1234567890",
    "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ",
    "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
    "Текст с\tтабуляцией и\nпереносом строки.",
    "Одна цифра 5 и серия 123."
];

/**
 * Вспомогательная функция для конвертации Uint8Array в строку бит.
 * @param {Uint8Array} buffer 
 * @param {number} bitLength 
 * @returns {string}
 */
function bufferToBitString(buffer, bitLength) {
    let bits = "";
    for (let i = 0; i < bitLength; i++) {
        const byte = buffer[i >> 3];
        const bit = (byte >> (7 - (i % 8))) & 1;
        bits += bit;
    }
    return bits;
}

console.log("=== ТЕСТЫ КОДИРОВАНИЯ И ДЕКОДИРОВАНИЯ ===\n");

testCases.forEach((text, index) => {
    try {
        console.log(`--- Тест #${index + 1} ---`);
        console.log(`Исходная строка: "${text}"`);

        // Кодирование
        const { buffer, size } = compressor.encode(text);
        const bitString = bufferToBitString(buffer, size);
        
        console.log(`Результат (биты): ${bitString}`);
        console.log(`Размер:           ${size} бит`);

        // Декодирование
        console.log(`\n--- Тест декодирования #${index + 1} ---`);
        console.log(`Набор битов:      ${bitString}`);
        
        const decoded = compressor.decode(buffer, size);
        console.log(`Полученное выражение: "${decoded}"`);

        if (text === decoded) {
            console.log(`Статус:           ПРОЙДЕН\n`);
        } else {
            console.log(`Статус:           ОШИБКА`);
            console.log(`  Ожидалось:      "${text}"`);
            console.log(`  Получено:       "${decoded}"`);
            process.exit(1);
        }
    } catch (e) {
        console.log(`\nКритическая ошибка в Тесте #${index + 1}: ${e.message}`);
        console.log(e.stack);
        process.exit(1);
    }
});

console.log("Все тесты успешно завершены!");
