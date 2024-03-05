/**
 * This file contains the Huffman Coding Algorithm
 */

import Random from "@shared/utils/random.ts";

/**
 * This function takes in a string and returns the Huffman Coding of the string
 * @param input_word the word to be encoded
 * @param sorting_variant the variant of the sorting algorithm
 *                        currently not implemented
 */
export function huffmanCodingAlgorithm(input_word: string, sorting_variant : number): {
    result: string;
    main_node: TreeNode
} {
    // split the input word into an dictionary of characters
    if (sorting_variant === 1) {
        // currently not implemented
    }
    const characters: { [key: string]: number } = {};
    for (let i = 0; i < input_word.length; i++) {
        if (characters[input_word[i]]) {
            characters[input_word[i]] += 1;
        } else {
            characters[input_word[i]] = 1;
        }
    }

    // create nodes for each character
    const nodes: TreeNode[] = [];
    for (const character in characters) {
        nodes.push(new TreeNode(character, characters[character], null, null));
    }

    // create a tree based on the characters
    // connect the two smallest values together
    while (nodes.length > 1) {
        // TODO: sort the nodes based on a custom sort function (or store those in a priority queue)
        nodes.sort((a, b) => sortNodes(a, b));
        const left = nodes.shift();
        const right = nodes.shift();
        if (left && right) {
            const newNode = new TreeNode(left.value + right.value, left.frequency + right.frequency, left, right);
            nodes.push(newNode);
        }
    }

    const main_node : TreeNode = nodes[0];

    // create the huffman coding for each character
    const huffmanCoding: { [key: string]: string } = {}
    for (const character in characters) {
        huffmanCoding[character] = "";
    }

    createHuffmanCoding(huffmanCoding, main_node, "");

    let result : string = "";
    for (let i = 0; i < input_word.length; i++) {
        result += huffmanCoding[input_word[i]];
    }

    return {result, main_node};

    function sortNodes(a: TreeNode, b: TreeNode) {
        // if a equals b compare them alphabetically
        // compare the frequency of the two nodes
        if (a.frequency === b.frequency) {
            // compare the smallest letter of the two node strings
            return (a.value.split('').sort().join('')).localeCompare(
                (b.value.split('').sort().join('')));
        }
        return a.frequency - b.frequency;
    }
}


/*
   Additional functions to create the huffman coding
    */
export function createHuffmanCoding(huffmanCode : {[key: string] : string},
                                    node: TreeNode,
                                    code: string) {
    if (node.left) {
        huffmanCode = createHuffmanCoding(huffmanCode, node.left, code + "0");
    }
    if (node.right) {
        huffmanCode = createHuffmanCoding(huffmanCode, node.right, code + "1");
    }
    if (node.value.length === 1) {
        huffmanCode[node.value] = code;
    }
    return huffmanCode;
}

export function createHuffmanCodingBitError(huffmanCode : {[key: string] : string},
                                            node: TreeNode,
                                            code: string,
                                            random: Random) {
    const firstValue = random.int(0, 1);
    const secondValue = (firstValue + 1) % 2
    if (node.left) {
        huffmanCode = createHuffmanCodingBitError(huffmanCode, node.left, code + firstValue.toString(), random);
    }
    if (node.right) {
        huffmanCode = createHuffmanCodingBitError(huffmanCode, node.right, code + secondValue.toString(), random);
    }
    if (node.value.length === 1) {
        huffmanCode[node.value] = code;
    }
    return huffmanCode;
}


/**
 * This class represents a node in the huffman tree
 */
export class TreeNode {
    public value: string;
    public frequency: number;
    public left: TreeNode | null;
    public right: TreeNode | null;
    public personalCode: string;

    constructor(value: string, frequency: number, left: TreeNode | null, right: TreeNode | null) {
        this.value = value;
        this.frequency = frequency;
        this.left = left;
        this.right = right;
        this.personalCode = "";
    }

    /**
     * Function to get the frequency of all leafs
     */
    public getLeafs(leafs : number[] ) {

        if (this.left) {
            this.left.getLeafs(leafs);
        }
        if (this.right) {
            this.right.getLeafs(leafs);
        }

        if (!this.left && !this.right) {
            leafs.push(this.frequency);
        }

        return leafs;

    }

}