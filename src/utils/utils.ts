import { computed, ref } from 'vue'
import Click from "../assets/musics/click.wav"
import Close from "../assets/musics/close.wav"
import Active from "../assets/musics/active.wav"


export const getSrc = (name: string) => {
    // const path = `../../src/assets/images/${name}`
    // const modules = import.meta.globEager('../../src/assets/images/**/*')
    // return name ? modules[path].default : ''
    return `#`
}
type Procedure = (...args: any[]) => void;

export function debounce<F extends Procedure>(
    func: F,
    waitMilliseconds: number,
    immediate: boolean = false
): F {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return function(this: ThisParameterType<F>, ...args: Parameters<F>) {
        const context = this;
        const doLater = function() {
            timeoutId = undefined;
            if (!immediate) {
                func.apply(context, args);
            }
        };

        const shouldCallNow = immediate && timeoutId === undefined;

        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(doLater, 500);

        if (shouldCallNow) {
            func.apply(context, args);
        }
    } as F;
}
export class Debounced {

    public use = (func: Function, delay: number, immediate: boolean = false): Function => {

        let timer: any
        return (...args: any) => {

            if (immediate) {

                func.apply(this, args)
                immediate = false
                return
            }
            clearTimeout(timer)
            timer = setTimeout(() => {

                func.apply(this, args)
            }, delay)
        }
    }
}

function countAliveNeighbors(matrix: any, x: any, y: any) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    let count = 0;
    directions.forEach(([dx, dy]) => {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newY >= 0 && newX < matrix.length && newY < matrix[newX].length && matrix[newX][newY]) {
            count++;
        }
    });
    return count;
}

function gameOfLife(matrix: any) {
    const newMatrix: any = matrix.map((row: any) => row.slice());
    matrix.forEach((row: any, x: any) => {
        row.forEach((cell: any, y: any) => {
            const aliveNeighbors = countAliveNeighbors(matrix, x, y);
            if (cell) {
                newMatrix[x][y] = aliveNeighbors === 2 || aliveNeighbors === 3;
            } else {
                newMatrix[x][y] = aliveNeighbors === 3;
            }
        });
    });
    return newMatrix;
}

export function createMatrix(rows: any, cols: any) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
        matrix.push(Array(cols).fill(0));
    }
    return matrix;
}

function placeSubmatrix(matrix: any, submatrix: any, row: any, col: any) {
    for (let x = 0; x < submatrix.length; x++) {
        for (let y = 0; y < submatrix[x].length; y++) {
            matrix[row + x][col + y] = submatrix[x][y];
        }
    }
}

function aliveCells(matrix: any) {
    let count = 0;
    matrix.forEach((row: any) => {
        row.forEach((cell: any) => {
            if (cell) {
                count++;
            }
        });
    });
    return count;
}

export function evolve(matrix: any, steps: any, submatrix: any) {
    const result = [];
    const offsetX = Math.floor((matrix.length - submatrix.length) / 2);
    const offsetY = Math.floor((matrix[0].length - submatrix[0].length) / 2);
    placeSubmatrix(matrix, submatrix, offsetX, offsetY);

    for (let i = 0; i < steps; i++) {
        matrix = gameOfLife(matrix);
        result.push([i + 1, aliveCells(matrix)]);
    }

    return result;
}

export function decimalToBinary(num: any, length: any) {
    let binary = num.toString(2);
    binary = binary.padStart(length, '0');
    return binary;
}

export function formatTime(seconds: any) {
    const dayInSeconds = 86400;
    const hourInSeconds = 3600;
    const minuteInSeconds = 60;

    if (seconds >= dayInSeconds) {
        const days = Math.floor(seconds / dayInSeconds);
        const remainingSeconds = seconds % dayInSeconds;
        const hours = Math.floor(remainingSeconds / hourInSeconds);
        return `${days} d ${hours} h`;
    } else if (seconds >= hourInSeconds) {
        const hours = Math.floor(seconds / hourInSeconds);
        const remainingSeconds = seconds % hourInSeconds;
        const minutes = Math.floor(remainingSeconds / minuteInSeconds);
        return `${hours} h ${minutes} m`;
    } else if (seconds >= minuteInSeconds) {
        const minutes = Math.floor(seconds / minuteInSeconds);
        const remainingSeconds = seconds % minuteInSeconds;
        return `${minutes} m ${remainingSeconds} s`;
    } else {
        return `${seconds} s`;
    }
}

const getLitGrids = ((matrix: any, pattern: any, size: any) => {
    const x = Math.floor(matrix / size) * size;
    const y = (matrix % size) * size;
    const litGrids = [];
    for (let i = 0; i < (size*size); i++) {
        const digit = pattern.charAt(i);
        if (digit === '1') {
            const row = Math.floor(i / size) + x;
            const col = (i % size) + y;
            litGrids.push([row, col]);
        }
    }
    return litGrids;
})

export {
    getLitGrids
}

export function useCountdownSeconds() {
    const count = ref<number>(0)
    const countdown = (
        initCount: number,
        callback?: Function,
        timeInterval: number = 1000
    ) => {
        setCount(initCount)
        const intervalId = setInterval(() => {
            count.value -= 1
            if (count.value <= 0) {
                clearInterval(intervalId)
                callback?.()
            }
        }, timeInterval)
    }
    const getCount = () => {
        return computed(() => count.value)
    }
    const setCount = (value: number) => {
        count.value = value
    }
    return {
        countdown,
        getCount,
        setCount
    }
}
export function formatHourTime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
export function countdownFromTimeString(timeString: any) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);

    const now = new Date();

    const countdownEnd = new Date();
    countdownEnd.setHours(now.getHours() + hours);
    countdownEnd.setMinutes(now.getMinutes() + minutes);
    countdownEnd.setSeconds(now.getSeconds() + seconds);

    const diffMs = countdownEnd.getTime() - now.getTime();

    const countdownMs = diffMs - 1000;
    if (countdownMs <= 0) {
        return '00:00:00';
    }
    const countdownHours = Math.floor(countdownMs / 3600000);
    const countdownMinutes = Math.floor((countdownMs % 3600000) / 60000);
    const countdownSeconds = Math.floor((countdownMs % 60000) / 1000);

    return `${String(countdownHours).padStart(2, '0')}:${String(countdownMinutes).padStart(2, '0')}:${String(countdownSeconds).padStart(2, '0')}`;
}

export function splitEvoHistories(evoHistories: evo[]) {
    const qtyCountArr = evoHistories.map(e => e.qtyCount);
    const stepArr = evoHistories.map(e => e.step);

    return { qtyCountArr, stepArr };
}
export function formatDate(timestamp: number) {
    const date = new Date(timestamp);

    const year = date.getFullYear().toString().slice(-2);

    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    const day = date.getDate().toString().padStart(2, '0');

    const hours = date.getHours().toString().padStart(2, '0');

    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
export function getRandomElement(arr: any) {
    if (arr && arr.length) {
        const randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex];
    }
    return null;
}

export function weightedRandom() {
    const weights = {
        '1-7': 3,
        '8-15': 1
    };

    const totalWeight = weights['1-7'] * 7 + weights['8-15'] * 8;
    let randomWeight = Math.floor(Math.random() * totalWeight) + 1;
    if (randomWeight <= weights['1-7'] * 7) {
        return randomWeight % 7 === 0 ? 7 : randomWeight % 7;
    } else {
        randomWeight -= weights['1-7'] * 7;
        return 7 + (randomWeight % 8 === 0 ? 8 : randomWeight % 8);
    }
}
export function clickMusic() {
    const music = localStorage.getItem('musicStatus')
    if (music !== 'false') {
        const audioClick = new Audio(Click);
        audioClick.play()
    }
}
export function closeMusic() {
    const music = localStorage.getItem('musicStatus')
    if (music !== 'false') {
        const audioClick = new Audio(Close);
        audioClick.play()
    }
}
export function activeMusic() {
    const music = localStorage.getItem('musicStatus')
    if (music !== 'false') {
        const audioClick = new Audio(Active);
        audioClick.play()
    }
}

export function formatTimestampToDDHHMM(timestamp: any) {
    const now = Date.now();
    const diff = timestamp - now;

    if (diff <= 0) {
        return '00:00:00';
    }

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

    const dd = String(days).padStart(2, '0');
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');

    return `${dd}D - ${hh}H - ${mm}M`;
}

export function formatNumberWithCommas(x: number | string | null): string {
    if (x === null) return ''
    const parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

export function truncateNumber(num: any, precision: any) {
    // Convert num to a string
    const numStr = num.toString();
    // Find the position of the decimal point
    const dotIndex = numStr.indexOf('.');

    if (dotIndex !== -1) { // Check if there is a decimal point
        // Get the number of digits after the decimal point
        const lengthAfterDot = numStr.length - dotIndex - 1;
        if (lengthAfterDot > precision) { // More digits than precision
            return parseFloat(numStr.substring(0, dotIndex + precision + 1));
        }
    }
    return num; // Return the number as is if no truncation is needed
}

export function formatNumberForEnglish(input: number | string | null): string | null {
    if (input === null) {
        return null;
    }

    const value = typeof input === 'string' ? parseFloat(input) : input;
    if (isNaN(value)) {
        return null;
    }

    if (value >= 1e9) {
        return truncateNumber(value / 1e9, 3) + 'B';
    } else if (value >= 1e6) {
        return truncateNumber(value / 1e6, 3) + 'M';
    } else if (value >= 1e3) {
        return truncateNumber(value / 1e3, 3) + 'K';
    } else {
        return value.toString();
    }
}

export function sumNumbers(n: number): number {
    return n * (n + 1) / 2;
}
export function totalSum(count: number, price: number): number {
    let total = 0;
    for (let i = 1; i <= count; i++) {
        total += price * (1 + 0.05 * i);
    }
    return truncateNumber(total, 6);
}
export function canContinuePaging(currentPage: number, itemsPerPage: number, totalItems: number) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return currentPage < totalPages;
}

export function findOnesPositions(binaryString: string): number[][] {
    if (binaryString.length !== 81) {
        throw new Error("the binary string must have exactly 81 characters.");
    }

    let grid: string[][] = [];
    for (let i = 0; i < 81; i += 9) {
        grid.push(binaryString.slice(i, i + 9).split(''));
    }

    let positions: number[][] = [];

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (grid[i][j] === '1') {
                positions.push([i, j]);
            }
        }
    }

    return positions;
}