class BCD {
    digits;
    length;

    constructor(num) {
        this.#validate(num);

        const digits = [];
        let n = BigInt(num);

        if (n === 0n) {
            digits.push(0);
        } else {
            while (n > 0n) {
                const digit = Number(n % 10n);
                digits.push(digit);
                n = n / 10n;
            }
            digits.reverse();
        }

        this.length = digits.length;
        this.digits = new Uint8Array(digits);
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
            const currentDigit = BigInt(this.digits[index]);

            // Умножение на 10 для следующей цифры
            result = result * 10n + currentDigit;
        }

        return result;
    }

    toNumber() {
        const bigValue = this.toBigint();
        const numValue = Number(bigValue);

        if (!Number.isSafeInteger(numValue)) {
            throw new RangeError(
                'Число выходит за пределы безопасного диапазона number'
            );
        }

        return numValue;
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
    module.exports = { BCD };
}