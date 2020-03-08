declare module 'duplex-child-process' {
	import { Duplex } from 'stream';
	class DuplexChildProcess extends Duplex {
		public spawn(command: string, args?: ReadonlyArray<string>, options?: any): void;
	}
	export = DuplexChildProcess;
}
