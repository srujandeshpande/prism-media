import DuplexChildProcess from 'duplex-child-process';
import { spawnSync } from 'child_process';
import { DuplexOptions } from 'stream';

/**
 * The available information after trying to find a valid FFmpeg installation
 */
export interface FFmpegInfo {
	/**
	 * The command that can be executed to spawn an FFmpeg process
	 */
	command: string;
	/**
	 * The output of running `<command> -h`
	 */
	output: string;
}

/**
 * The options that can be provided when instantiating an FFmpeg stream
 */
export interface FFmpegOptions extends DuplexOptions {
	args: string[];
}

const idS = (s: string) => () => s;

// A list of functions that return strings to possible FFmpeg paths
const FFmpegSources = [
	() => (require('ffmpeg-static') as string),
	idS('ffmpeg'),
	idS('avconv'),
	idS('./ffmpeg'),
	idS('./avconv')
];

/**
 * An FFmpeg transform stream that pipes data to an FFmpeg process and forwards its output
 */
export class FFmpeg extends DuplexChildProcess {
	/**
	 * The information found about the FFmpeg installation, or null if it could not be found
	 */
	public static info: FFmpegInfo;

	public constructor(options: FFmpegOptions) {
		super();
		this.spawnProcess(options.args);
	}

	/**
	 * Tries to find a valid FFmpeg command.
	 * @param refresh When true, will try to find an FFmpeg command even if one has already been found
	 * @returns Either valid information, or null if FFmpeg could not be found
	 */
	public static findFFmpeg(refresh = false): FFmpegInfo | null {
		if (FFmpeg.info && !refresh) return FFmpeg.info;
		for (const source of FFmpegSources) {
			try {
				const command = source();
				const result = spawnSync(command, ['-h'], { windowsHide: true, encoding: 'utf8' });
				if (result.error) throw result.error;
				FFmpeg.info = {
					command,
					output: result.output.join('\n')
				};
				return FFmpeg.info;
			} catch {}
		}
		return null;
	}

	/**
	 * Spawns the FFmpeg process for this stream
	 * @param args The arguments to provide to FFmpeg (input is set to be piped in by default)
	 */
	private spawnProcess(args: string[]): void {
		if (!args.includes('-i')) args = ['-i', '-', ...args];
		if (!FFmpeg.findFFmpeg()) {
			throw new Error('FFmpeg/avconv not found!');
		}
		this.spawn(FFmpeg.info.command, [...args, 'pipe:1'], { windowsHide: true });
	}
}
