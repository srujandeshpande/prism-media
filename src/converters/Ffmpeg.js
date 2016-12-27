const ChildProcess = require('child_process');
const FfmpegProcess = require('./FfmpegProcess');

const ffmpegSources = [
  'ffmpeg',
  'avconv',
  './ffmpeg',
  './avconv',
  'node_modules/ffmpeg-binaries/bin/ffmpeg',
  'node_modules\\ffmpeg-binaries\\bin\\ffmpeg',
];

const defaultArguments = [
  '-analyzeduration', '0',
  '-loglevel', '0',
  '-i', '-',
  '-f', 's16le',
  '-ar', '48000',
  '-ac', '2',
  'pipe:1',
];

class FfmpegConverter {
  constructor(audioConverter) {
    this.audioConverter = audioConverter;
    this.command = FfmpegConverter.selectFfmpegCommand();
    this.processes = [];
  }

  convert(options) {
    const inputStream = options.stream;
    const proc = this.spawnProcess(options.arguments, inputStream);
    this.processes.push(proc);
    return proc;
  }

  spawnProcess(args = [], stream) {
    if (!this.command) this.command = FfmpegConverter.selectFfmpegCommand();
    return new FfmpegProcess(this, defaultArguments.concat(args), stream);
  }

  static selectFfmpegCommand() {
    for (const command of ffmpegSources) {
      if (!ChildProcess.spawnSync(command, ['-h']).error) return command;
    }
    throw new Error('FFMPEG not found');
  }
}

module.exports = FfmpegConverter;
