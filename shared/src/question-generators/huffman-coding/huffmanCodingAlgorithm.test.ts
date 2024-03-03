import { huffmanCodingAlgorithm } from './huffmanCodingAlgorithm.ts';
import { expect, test } from "vitest"

/**
 * Test to check if the huffmanCodingAlgorithm function works correctly
 */
test('huffmanCodingAlgorithm', () => {

    expect(huffmanCodingAlgorithm('abbcccdddd', 0)).toBe('1001011011111110000');
    expect(huffmanCodingAlgorithm('balance',0)).toBe('100011110100101110');
    expect(huffmanCodingAlgorithm('hello',0)).toBe('1111100010');

    // those inputs are from https://ae.cs.uni-frankfurt.de/teaching/20ss/+algo1/selbsttest12.pdf
    expect(huffmanCodingAlgorithm('solve',0)).toBe('010011110110');
    expect(huffmanCodingAlgorithm('revive',0)).toBe('111100110010');
    expect(huffmanCodingAlgorithm('huffman',0)).toBe('011001010110010111');
    expect(huffmanCodingAlgorithm('accuracy',0)).toBe('111001011001110110');
    expect(huffmanCodingAlgorithm('weekend',0)).toBe('111001010110100');
    expect(huffmanCodingAlgorithm('winning',0)).toBe('1011100110100');
    expect(huffmanCodingAlgorithm('attempt',0)).toBe('100001011101110');

    // those inputs are from https://ae.cs.uni-frankfurt.de/teaching/20ss/+algo1/selbsttest18.pdf
    expect(huffmanCodingAlgorithm('test',0)).toBe('100011');
    expect(huffmanCodingAlgorithm('access',0)).toBe('100111110100');
    expect(huffmanCodingAlgorithm('coffee',0)).toBe('100101001111');
    expect(huffmanCodingAlgorithm('element',0)).toBe('010001010110111');
    expect(huffmanCodingAlgorithm('output',0)).toBe('100011101011');
    expect(huffmanCodingAlgorithm('goethe',0)).toBe('11000100111110');
    expect(huffmanCodingAlgorithm('minimal',0)).toBe('1110001011010011');

    // Already by the code generated words (recreated them by hand)
    expect(huffmanCodingAlgorithm('ijyipmps',0)).toBe('00010111001001110110');

});