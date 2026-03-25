class BSD {
    digits;
    length;

    constructor(num) {
        this.#validate(num);

        const decimalString = num.toString();

        this.length = decimalString.length;
        this.digits = new Uint8Array(this.length);

        // Преобразование строки в массив цифр
        for (let index = 0; index < this.length; index++) {
            const char = decimalString[index];
            const charCode = char.charCodeAt(0);
            // Получаем числовое значение символа (ASCII '0' = 48)
            const digit = charCode - 48;

            this.digits[index] = digit;
        }
    }

    #validate(num) {
        const valueType = typeof num;

        if (valueType === 'number') {
            if (!Number.isFinite(num)) {
                throw new TypeError('Число должно быть конечным');
            }

            if (!Number.isInteger(num)) {
                throw new TypeError('Число должно быть целым');
            }

            if (num < 0) {
                throw new RangeError('Число должно быть неотрицательным');
            }

            return;
        }

        if (valueType === 'bigint') {
            if (num < 0n) {
                throw new RangeError('Число должно быть неотрицательным');
            }

            return;
        }

        throw new TypeError('Ожидается number или bigint');
    }

    toBigint() {
        let result = 0n;

        for (let index = 0; index < this.length; index++) {
            const currentDigit = this.digits[index];
            const currentDigitAsBigInt = BigInt(currentDigit);

            // Сдвиг влево на 4 бита для следующей цифры
            const shiftedResult = result << 4n;
            // Установка текущей цифры в младшие 4 бита
            result = shiftedResult | currentDigitAsBigInt;
        }

        return result;
    }

    toNumber() {
        const decimalString = this.toString();
        const numericValue = Number(decimalString);

        const isSafeInteger = Number.isSafeInteger(numericValue);
        if (!isSafeInteger) {
            throw new RangeError('Число выходит за пределы безопасного диапазона number');
        }

        return numericValue;
    }

    toString() {
        let result = '';

        for (let index = 0; index < this.length; index++) {
            const currentDigit = this.digits[index];
            const currentDigitAsString = String(currentDigit);

            result += currentDigitAsString;
        }

        return result;
    }

    at(index) {
        let normalizedIndex = index;

        // Обработка отрицательных индексов
        if (index < 0) {
            normalizedIndex = this.length + index;
        }

        const isOutOfRange =
            normalizedIndex < 0 || normalizedIndex >= this.length;

        if (isOutOfRange) {
            throw new RangeError('Индекс вне диапазона');
        }

        return this.digits[normalizedIndex];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BSD };
}