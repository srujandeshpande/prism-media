export function to_s16le_buf(sequence: Buffer | number[]): Buffer {
	if (Buffer.isBuffer(sequence)) return sequence;
	const buffer = Buffer.allocUnsafe(sequence.length * 2);
	let i = 0;
	for (const n of sequence) {
		buffer.writeInt16LE(n, i);
		i += 2;
	}
	return buffer;
}

export function from_s16le_buf(buffer: Buffer): number[] {
	const sequence = [];
	for (let i = 0; i < buffer.length; i += 2) {
		sequence.push(buffer.readInt16LE(i));
	}
	return sequence;
}

export function to_s32le_buf(sequence: Buffer | number[]): Buffer {
	if (Buffer.isBuffer(sequence)) return sequence;
	const buffer = Buffer.allocUnsafe(sequence.length * 4);
	let i = 0;
	for (const n of sequence) {
		buffer.writeInt32LE(n, i);
		i += 4;
	}
	return buffer;
}

export function from_s32le_buf(buffer: Buffer): number[] {
	const sequence = [];
	for (let i = 0; i < buffer.length; i += 4) {
		sequence.push(buffer.readInt32LE(i));
	}
	return sequence;
}

export function to_s16be_buf(sequence: Buffer | number[]): Buffer {
	if (Buffer.isBuffer(sequence)) return sequence;
	const buffer = Buffer.allocUnsafe(sequence.length * 2);
	let i = 0;
	for (const n of sequence) {
		buffer.writeInt16BE(n, i);
		i += 2;
	}
	return buffer;
}

export function from_s16be_buf(buffer: Buffer): number[] {
	const sequence = [];
	for (let i = 0; i < buffer.length; i += 2) {
		sequence.push(buffer.readInt16BE(i));
	}
	return sequence;
}

export function to_s32be_buf(sequence: Buffer | number[]): Buffer {
	if (Buffer.isBuffer(sequence)) return sequence;
	const buffer = Buffer.allocUnsafe(sequence.length * 4);
	let i = 0;
	for (const n of sequence) {
		buffer.writeInt32BE(n, i);
		i += 4;
	}
	return buffer;
}

export function from_s32be_buf(buffer: Buffer): number[] {
	const sequence = [];
	for (let i = 0; i < buffer.length; i += 4) {
		sequence.push(buffer.readInt32BE(i));
	}
	return sequence;
}
