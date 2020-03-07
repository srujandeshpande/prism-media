import { VolumeTransformerS16LE, VolumeTransformerS32LE, VolumeTransformerS16BE, VolumeTransformerS32BE } from '../core/VolumeTransformer';
import { writeAndCollect } from './util/writeAndCollect';
import { to_s16le_buf, to_s32le_buf, to_s16be_buf, to_s32be_buf } from './util/bufferReadWrite';

const commonFixtures = {
	// If the stream was not acting as a passthrough, it would return [1, 2, 3, 4]
	'volume = 1 acts as passthrough': {
		volume: 1,
		input: Buffer.from([1, 2, 3, 4, 5]),
		expected: Buffer.from([1, 2, 3, 4, 5])
	},
	'volume = 2': {
		volume: 2,
		input: [0, 1, 2, 3],
		expected: [0, 2, 4, 6]
	},
	'volume = 0.5': {
		volume: 0.5,
		input: [0, 1, 2, 3, 10],
		expected: [0, 0, 1, 1, 5] // values floored
	},
	'volume = 0': {
		volume: 0,
		input: [0, 1, 2, 3, 4, 5],
		expected: [0, 0, 0, 0, 0, 0] // values floored
	}
};

describe('common', () => {
	/*
	We can test for all transformer types with just a single type,
	since they all same a common constructor.
	*/
	test('default volume', () => {
		expect(new VolumeTransformerS16LE().volume).toBe(1);
		expect(new VolumeTransformerS16LE({ highWaterMark: 12 }).volume).toBe(1);
		expect(new VolumeTransformerS16LE({ volume: undefined }).volume).toBe(1);
	});

	test('volume in constructor', () => {
		for (const volume of [1, 2, 0.5]) {
			expect(new VolumeTransformerS16LE({ volume }).volume).toBe(volume);
		}
	});
});

describe('s16le and s16be', () => {
	const fixtures = {
		...commonFixtures,
		'values are capped at extremities': {
			volume: 16,
			input: [2 ** 14, 1, -2, 3, -(2 ** 14)],
			expected: [(2 ** 15) - 1, 16, -32, 48, -(2 ** 15)] // values floored
		}
	};

	const tests = [
		{ name: 's16le', VolumeTransformer: VolumeTransformerS16LE, toBuf: to_s16le_buf },
		{ name: 's16be', VolumeTransformer: VolumeTransformerS16BE, toBuf: to_s16be_buf }
	];

	for (const { name, VolumeTransformer, toBuf } of tests) {
		for (const [testName, { volume, input, expected }] of Object.entries(fixtures)) {
			test(`${name}: ${testName}`, () => expect(writeAndCollect(
				toBuf(input),
				new VolumeTransformer({ volume })
			)).resolves.toEqual(toBuf(expected)));
		}

		test(`${name}: no output if not enough input`, () => expect(writeAndCollect(
			Buffer.from([1]),
			new VolumeTransformer({ volume: 2 })
		)).resolves.toHaveLength(0));

		test(`${name}: incomplete frames ignored`, () => {
			const data = toBuf([1, 2, 3]);
			return expect(writeAndCollect(
				Buffer.concat([data, Buffer.from([17])]),
				new VolumeTransformer({ volume: 2 })
			)).resolves.toEqual(toBuf([2, 4, 6]));
		});
	}
});

describe('s32le and s32be', () => {
	const fixtures = {
		...commonFixtures,
		'32-bit values': {
			volume: 2,
			input: [2 ** 18, 2 ** 19, -(2 ** 20)],
			expected: [2 ** 19, 2 ** 20, -(2 ** 21)]
		},
		'values are capped at extremities': {
			volume: 16,
			input: [2 ** 30, 1, -2, 3, -(2 ** 30)],
			expected: [(2 ** 31) - 1, 16, -32, 48, -(2 ** 31)] // values floored
		}
	};

	const tests = [
		{ name: 's32le', VolumeTransformer: VolumeTransformerS32LE, toBuf: to_s32le_buf },
		{ name: 's32be', VolumeTransformer: VolumeTransformerS32BE, toBuf: to_s32be_buf }
	];

	for (const { name, VolumeTransformer, toBuf } of tests) {
		for (const [testName, { volume, input, expected }] of Object.entries(fixtures)) {
			test(`${name}: ${testName}`, () => expect(writeAndCollect(
				toBuf(input),
				new VolumeTransformer({ volume })
			)).resolves.toEqual(toBuf(expected)));
		}

		test(`${name}: no output if not enough input`, () => expect(writeAndCollect(
			Buffer.from([1, 2, 3]),
			new VolumeTransformer({ volume: 2 })
		)).resolves.toHaveLength(0));

		test(`${name}: incomplete frames ignored`, () => {
			const data = toBuf([1, 2, 3]);
			return expect(writeAndCollect(
				Buffer.concat([data, Buffer.from([17])]),
				new VolumeTransformer({ volume: 2 })
			)).resolves.toEqual(toBuf([2, 4, 6]));
		});
	}
});
