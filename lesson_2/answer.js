/**
 * Выполняет программу, представленную в виде массива байткода.
 *
 * Команды:
 * 0 <val> - SET A
 * 1       - PRINT A
 * 2       - IFN A   (если A !== 0, пропустить следующую инструкцию)
 * 3 <val> - RET
 * 4       - DEC A
 * 5 <adr> - JMP
 *
 * @param {number[]} program
 * @returns {number|undefined}
 */
function execute(program) {
    let memory = 0;
    let pointer = 0;

    const instructionLengths = {
        0: 2, // SET A <val>
        1: 1, // PRINT A
        2: 1, // IFN A
        3: 2, // RET <val>
        4: 1, // DEC A
        5: 2,  // JMP <addr>
    };

    while (pointer < program.length) {
        const opcode = program[pointer];

        switch (opcode) {
            case 0: // SET A <val>
                if (pointer + 1 >= program.length) {
                    throw new Error(`SET A ожидает аргумент в позиции ${ pointer }`);
                }
                const val = program[pointer + 1];
                if (typeof val !== 'number') {
                    throw new Error(`Ошибка типа: SET A ожидает число в позиции ${ pointer + 1 }, получено ${ typeof val }`);
                }
                memory = val;
                pointer += 2;
                break;

            case 1: // PRINT A
                console.log(memory);
                pointer += 1;
                break;

            case 2: // IFN A
                pointer += 1;

                // Если A не равно 0, пропускаем следующую инструкцию
                if (memory !== 0) {
                    if (pointer >= program.length) {
                        break;
                    }

                    const nextOpcode = program[pointer];
                    const nextLength = instructionLengths[nextOpcode];

                    if (!nextLength) {
                        throw new Error(`Неизвестная команда: ${ nextOpcode } в позиции ${ pointer }`);
                    }

                    pointer += nextLength;
                }

                break;

            case 3: // RET <val>
                if (pointer + 1 >= program.length) {
                    throw new Error(`RET ожидает аргумент в позиции ${ pointer }`);
                }
                const retVal = program[pointer + 1];
                if (typeof retVal !== 'number') {
                    throw new Error(`Ошибка типа: RET ожидает число в позиции ${ pointer + 1 }, получено ${ typeof retVal }`);
                }
                return retVal;

            case 4: // DEC A
                memory -= 1;
                pointer += 1;
                break;

            case 5: // JMP <addr>
                if (pointer + 1 >= program.length) {
                    throw new Error(`JMP ожидает аргумент в позиции ${ pointer }`);
                }
                const addr = program[pointer + 1];
                if (typeof addr !== 'number') {
                    throw new Error(`Ошибка типа: JMP ожидает числовой адрес в позиции ${ pointer + 1 }, получено ${ typeof addr }`);
                }
                pointer = addr;
                break;

            default:
                throw new Error(`Неизвестная команда: ${ opcode } в позиции ${ pointer }`);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = execute;
}