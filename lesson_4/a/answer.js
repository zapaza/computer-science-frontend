/**
 * Выполняет циклический сдвиг влево.
 * Поддерживает 32-битные числа (битовый регистр), массивы и строки.
 *
 * @param {number|any[]|string} data - Последовательность для сдвига
 * @param {number} k - Количество позиций для сдвига
 * @returns {number|any[]|string} Результат сдвига
 */
function cyclicLeftShift(data, k) {
    if (typeof data === 'number') {
        const n = 32;
        const shift = ((k % n) + n) % n;

        if (shift === 0) {
            return data >>> 0;
        }

        return ((data << shift) | (data >>> (n - shift))) >>> 0;
    }

    if (Array.isArray(data)) {
        const n = data.length;

        if (n === 0) {
            return [];
        }

        const shift = ((k % n) + n) % n;

        if (shift === 0) {
            return [...data];
        }

        return [
            ...data.slice(shift),
            ...data.slice(0, shift)
        ];
    }

    if (typeof data === 'string') {
        const n = data.length;

        if (n === 0) {
            return '';
        }

        const shift = ((k % n) + n) % n;

        if (shift === 0) {
            return data;
        }

        return data.slice(shift) + data.slice(0, shift);
    }

    throw new TypeError('Поддерживаются только числа (32 бита), массивы и строки');
}

/**
 * Выполняет циклический сдвиг вправо.
 * Поддерживает 32-битные числа (битовый регистр), массивы и строки.
 *
 * @param {number|any[]|string} data - Последовательность для сдвига
 * @param {number} k - Количество позиций для сдвига
 * @returns {number|any[]|string} Результат сдвига
 */
function cyclicRightShift(data, k) {
    if (typeof data === 'number') {
        const number = 32;
        const shift = ((k % number) + number) % number;

        if (shift === 0) {
            return data >>> 0;
        }

        return ((data >>> shift) | (data << (number - shift))) >>> 0;
    }

    if (Array.isArray(data)) {
        const length = data.length;

        if (length === 0) {
            return [];
        }

        const shift = ((k % length) + length) % length;

        if (shift === 0) {
            return [...data];
        }

        return [
            ...data.slice(-shift),
            ...data.slice(0, -shift)
        ];
    }

    if (typeof data === 'string') {
        const length = data.length;

        if (length === 0) {
            return '';
        }

        const shift = ((k % length) + length) % length;

        if (shift === 0) {
            return data;
        }

        return data.slice(-shift) + data.slice(0, -shift);
    }

    throw new TypeError('Поддерживаются только числа (32 бита), массивы и строки');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { cyclicLeftShift, cyclicRightShift };
}
