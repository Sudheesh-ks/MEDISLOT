declare module 'streamifier' {
  import { Readable } from 'stream';

  const streamifier: {
    createReadStream: (buffer: Buffer) => Readable;
  };

  export = streamifier;
}
