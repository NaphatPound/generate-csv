declare module 'minio' {
  interface ClientOptions {
    endPoint: string;
    port?: number;
    useSSL?: boolean;
    accessKey: string;
    secretKey: string;
    region?: string;
    sessionToken?: string;
  }

  class Client {
    constructor(options: ClientOptions);
    putObject(bucket: string, name: string, stream: any, size?: number, metaData?: any): Promise<any>;
    getObject(bucket: string, name: string): Promise<any>;
    removeObject(bucket: string, name: string): Promise<void>;
    bucketExists(bucket: string): Promise<boolean>;
    makeBucket(bucket: string, region?: string): Promise<void>;
    presignedGetObject(bucket: string, name: string, expiry?: number): Promise<string>;
    presignedPutObject(bucket: string, name: string, expiry?: number): Promise<string>;
    listObjects(bucket: string, prefix?: string, recursive?: boolean): any;
    statObject(bucket: string, name: string): Promise<any>;
    [key: string]: any;
  }
}
