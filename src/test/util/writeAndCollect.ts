import { Readable, ReadableOptions, Writable } from 'stream';

interface SingleWriteOptions extends ReadableOptions {
	data: Buffer;
}

class SingleWrite extends Readable {
	private readonly _writeData: Buffer;

	public constructor(options: SingleWriteOptions) {
		super(options);
		this._writeData = options.data;
	}

	public _read() {
		this.push(this._writeData);
		this.push(null);
	}
}

export function writeAndCollect(data: Buffer, stream: Writable): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const chunks: Array<Buffer> = [];
		new SingleWrite({ data }).pipe(stream);
		stream.on('data', chunk => chunks.push(chunk));
		stream.on('error', reject);
		stream.on('end', () => resolve(Buffer.concat(chunks)));
	});
}
