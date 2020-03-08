import { FFmpeg, FFmpegInfo } from '../core/FFmpeg';
import { createReadStream } from 'fs';
import { collect } from './util/collect';

const VERSION_REGEX = /version (.+) Copyright/mi;

describe('Loading FFmpeg', () => {
	test('FFmpeg is available', () => {
		const info = FFmpeg.findFFmpeg();
		expect(info).toBeTruthy();
	});

	test('FFmpegInfo is available', () => {
		const info = FFmpeg.findFFmpeg() as FFmpegInfo;
		expect(typeof info.command).toBe('string');
		expect(info.command.length).toBeGreaterThan(0);
		expect(typeof info.output).toBe('string');
		expect(VERSION_REGEX.exec(info.output)).toBeTruthy();
	});
});

describe('Sanity tests', () => {
	test('Ogg -> raw', async () => {
		const transcoder = new FFmpeg({
			args: [
				'-analyzeduration', '0',
				'-loglevel', '0',
				'-f', 's16le',
				'-ar', '48000',
				'-ac', '2'
			]
		});
		expect((await collect(
			createReadStream('./src/test/audio/speech_orig.ogg').pipe(transcoder)
		)).length).toBe(2073600);
	});
});
