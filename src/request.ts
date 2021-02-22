import { URL } from 'url';
import { request as httpRequest, RequestOptions, IncomingMessage, IncomingHttpHeaders } from 'http';
import { request as httpsRequest } from 'https';


interface RequestResponse {
    statusCode: number;
    headers: IncomingHttpHeaders;
    body: string;
}


interface PostRequest {
    data: any;
    headers?: IncomingHttpHeaders
}


const get = (url: string): Promise <RequestResponse> => {

    return new Promise ((resolve, reject) => {
        getStream (url)
        .then ((res: IncomingMessage) => {
            const result: RequestResponse = { statusCode: res.statusCode ?? 0, headers: res.headers, body: '' }
            // res.setEncoding ('utf8');
            res.on ('data', (chunk) => result.body += chunk);
            res.on ('end', () => resolve (result));
        })
        .catch (err => reject (err));
    });
}


const getStream = (url: string): Promise <IncomingMessage> => {

    return requestStream (url, 'GET');
}


const head = (url: string): Promise <RequestResponse> => {

    return new Promise ((resolve, reject) => {

        requestStream (url, 'HEAD')
        .then ((res: IncomingMessage) => {
            const result: RequestResponse = { statusCode: res.statusCode ?? 0, headers: res.headers, body: '' }
            // res.setEncoding ('utf8');
            resolve (result);
        })
        .catch (err => {
            reject (err);
        });
    });
}


function requestOptions (url: string, method: string): RequestOptions {

    const _url = new URL (url);

    return {
        hostname: _url.hostname,
        method:   method,
        path:     `${ _url.pathname }${ _url.search ?? '' }${ _url.hash ?? '' }`,
        port:     _url.port,
        protocol: _url.protocol
        // rejectUnauthorized: false
        // headers: {
        //     'Content-Type': 'application/json',
        //     'Content-Length': Buffer.byteLength (payload)
        // }
    }
}


function requestStream (url: string, method: string): Promise <IncomingMessage> {

    return new Promise ((resolve, reject) => {

        const options = requestOptions (url, method);

        const request = options.protocol == 'https:' ? httpsRequest : httpRequest;
        const req     = request (options, (res: IncomingMessage) => resolve (res));
        req.on ('error', (err) => reject (err));
        req.end ();
    })
}


const post = (urlString: string, options: PostRequest): Promise <RequestResponse> => {

    return new Promise ((resolve, reject) => {
        try {
            const payload = JSON.stringify (options.data);
            const url     = postRequestOptions (urlString, options, payload);
            const request = url.protocol == 'https:' ? httpsRequest : httpRequest;

            const req = request (url, (res: IncomingMessage) => {
                const result: RequestResponse = { statusCode: res.statusCode ?? 0, headers: res.headers, body: '' }
                res.setEncoding ('utf8');
                res.on ('data', (chunk) => result.body += chunk);
                res.on ('end', () => resolve (result));
            });
            req.on ('error', (err: Error) => reject (err));
            req.end (payload);
        } catch (err) {
            return reject (err);
        }
    });
}


function postRequestOptions (url: string, options: PostRequest, payload: string): RequestOptions {

    const _url = new URL (url);
    const headers: any = {};

    if (options.headers) Object.entries (options.headers).map (item => headers [item [0].toLowerCase ()] = item [1]);

    headers ['content-type']   = headers ['content-type'] ?? 'application/json';
    headers ['content-length'] = Buffer.byteLength (payload);

    return {
        hostname: _url.hostname,
        method:   'POST',
        path:     _url.pathname,
        port:     _url.port,
        protocol: _url.protocol,
        headers
    }
}


export {
    get,
    getStream,
    head,
    post,
    RequestResponse
}


/////////////////////////////////
/////////////////////////////////
/////////////////////////////////


