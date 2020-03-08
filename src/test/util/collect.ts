import { Readable } from 'stream';

export function collect(stream: Readable): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const chunks: Array<Buffer> = [];
		stream.on('data', chunk => chunks.push(chunk));
		stream.on('error', reject);
		stream.on('end', () => resolve(Buffer.concat(chunks)));
	});
}
