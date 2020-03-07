import { Transform, TransformOptions, TransformCallback } from 'stream';

/**
 * The options that can be provided when instantiating a VolumeTransformer
 */
export interface VolumeTransformerOptions extends TransformOptions {
	volume?: number;
}

/**
 * A Transform stream that adjusts the volume of PCM audio
 */
export abstract class VolumeTransformer extends Transform {
	/**
	 * The volume of this transformer (1 = original, 2 = double, 0.5 = half etc.)
	 */
	public volume: number;

	/**
	 * A buffer that stores an incomplete from previous transformations
	 */
	private _chunk: Buffer;

	/**
	 * The number of bytes per frame
	 */
	protected abstract _bytes: number;

	/**
	 * The maximum value that can be expresssed in a frame
	 */
	protected abstract _extremum: number;

	/**
	 * Reads an int from a buffer
	 * @param buffer The buffer to read from
	 * @param offset The offset/index to read from in the buffer
	 * @returns The int that was read
	 */
	protected abstract _readInt(buffer: Buffer, offset: number): number;

	/**
	 * Writes an int to a buffer
	 * @param buffer The buffer to write to
	 * @param value The value to write
	 * @param offset The offset/index to write to in the buffer
	 */
	protected abstract _writeInt(buffer: Buffer, value: number, offset: number): void;

	/**
	 * Changes the volume of a PCM frame
	 * @param value The frame to change the value of
	 * @returns The frame with adjusted volume
	 */
	protected abstract _applyVolume(value: number): number;

	/**
	 * Creates a new VolumeTransformer
	 * @param options Can be used to specify Transform properties or initialise with a given volume
	 */
	public constructor(options?: VolumeTransformerOptions) {
		super(options);
		this.volume = typeof options?.volume === 'undefined' ? 1 : options.volume;
		this._chunk = Buffer.alloc(0);
	}

	/**
	 * Clamps a value between two limits
	 * @param value The value to clamp
	 * @param lower The minimum value allowed
	 * @param upper The maximum value allowed
	 * @returns The clamped value
	 */
	protected static clamp(value: number, lower: number, upper: number): number {
		return Math.max(Math.min(value, upper), lower);
	}

	public _transform(chunk: Buffer, encoding: string, done: TransformCallback): void {
		// If volume is 1, passthrough the data
		if (this.volume === 1) {
			this.push(chunk);
			done();
			return;
		}

		// Add any previous data
		const buffer = Buffer.concat([this._chunk, chunk]);

		const chunks = Math.floor(buffer.length / this._bytes);
		const totalLength = chunks * this._bytes;

		for (let i = 0; i < totalLength; i += this._bytes) {
			this._writeInt(buffer, this._applyVolume(this._readInt(buffer, i)), i);
		}

		this._chunk = buffer.slice(totalLength);
		this.push(buffer.slice(0, totalLength));
		return done();
	}
}

/**
 * A signed 16-bit little-endian VolumeTransformer
 */
export class VolumeTransformerS16LE extends VolumeTransformer {
	protected _bytes = 2;
	protected _extremum = 2 ** 15;

	protected _applyVolume(value: number): number {
		return VolumeTransformer.clamp(
			value * this.volume,
			-this._extremum, this._extremum - 1
		);
	}

	protected _readInt(buffer: Buffer, offset: number): number {
		return buffer.readInt16LE(offset);
	}

	protected _writeInt(buffer: Buffer, value: number, offset: number): void {
		buffer.writeInt16LE(value, offset);
	}
}

/**
 * A signed 32-bit little-endian VolumeTransformer
 */
export class VolumeTransformerS32LE extends VolumeTransformer {
	protected _bytes = 4;
	protected _extremum = 2 ** 31;

	protected _applyVolume(value: number): number {
		return VolumeTransformer.clamp(value * this.volume, -this._extremum, this._extremum - 1);
	}

	protected _readInt(buffer: Buffer, offset: number): number {
		return buffer.readInt32LE(offset);
	}

	protected _writeInt(buffer: Buffer, value: number, offset: number): void {
		buffer.writeInt32LE(value, offset);
	}
}

/**
 * A signed 16-bit big-endian VolumeTransformer
 */
export class VolumeTransformerS16BE extends VolumeTransformer {
	protected _bytes = 2;
	protected _extremum = 2 ** 15;

	protected _applyVolume(value: number): number {
		return VolumeTransformer.clamp(
			value * this.volume,
			-this._extremum, this._extremum - 1
		);
	}

	protected _readInt(buffer: Buffer, offset: number): number {
		return buffer.readInt16BE(offset);
	}

	protected _writeInt(buffer: Buffer, value: number, offset: number): void {
		buffer.writeInt16BE(value, offset);
	}
}
/**
 * A signed 32-bit big-endian VolumeTransformer
 */
export class VolumeTransformerS32BE extends VolumeTransformer {
	protected _bytes = 4;
	protected _extremum = 2 ** 31;

	protected _applyVolume(value: number): number {
		return VolumeTransformer.clamp(value * this.volume, -this._extremum, this._extremum - 1);
	}

	protected _readInt(buffer: Buffer, offset: number): number {
		return buffer.readInt32BE(offset);
	}

	protected _writeInt(buffer: Buffer, value: number, offset: number): void {
		buffer.writeInt32BE(value, offset);
	}
}
