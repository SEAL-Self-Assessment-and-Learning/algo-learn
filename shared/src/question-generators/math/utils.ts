// modularArithmeticUtils.ts

export function gcd(a: number, b: number): number {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}

export function calculateModularInverse(a: number, n: number): number | null {
    let t = 0, newT = 1;
    let r = n, newR = a;
    while (newR !== 0) {
        const quotient = Math.floor(r / newR);
        [t, newT] = [newT, t - quotient * newT];
        [r, newR] = [newR, r - quotient * newR];
    }
    if (r > 1) return null;
    return t < 0 ? t + n : t;
}

export function modularExponentiation(a: number, b: number, n: number): number {
    let result = 1;
    a = a % n;
    while (b > 0) {
        if (b % 2 === 1) result = (result * a) % n;
        b = Math.floor(b / 2);
        a = (a * a) % n;
    }
    return result;
}