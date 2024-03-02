import { huffmanCodingAlgorithm } from './huffmanCodingAlgorithm.ts';
import { expect, test } from "vitest"

test('huffmanCodingAlgorithm', () => {
    expect(huffmanCodingAlgorithm('abbcccdddd', 0)).toBe('1001011011111110000');
    expect(huffmanCodingAlgorithm('balance',0)).toBe('100011110100101110');
    expect(huffmanCodingAlgorithm('hello',0)).toBe('1111100010');
});