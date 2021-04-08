// export interface AjaxOptions {
//     url: string;
//     type: "GET" | "POST";
//     dataType?: string;
//     headers?: Record<string, string>;
//     success?: (data: any) => void;
//     error?: (ev: ProgressEvent) => any | null;
//     data?: any;
//     timeout?: number;
// }

function ajax(options) {
    const { url } = options;
    const type = options.type || "GET";
    const dataType = options.dataType || "json";
    const onsuccess = options.success || null;
    const onerror = options.error || null;

    const xhr = new XMLHttpRequest();
    xhr.open(type, url, true);
    if (options.timeout) {
        xhr.timeout = options.timeout;
        xhr.ontimeout = function (e) {
            // XMLHttpRequest 超时。在此做某事。
            onerror(e);
        };
    }
    if (options.headers) {
        // eslint-disable-next-line no-restricted-syntax
        for (const p in options.headers) {
            if (options.headers[p]) {
                xhr.setRequestHeader(p, options.headers[p]);
            }
        }
    }
    xhr.onload = function onload(ev) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
            if (dataType === "json") {
                onsuccess(JSON.parse(xhr.responseText));
            } else {
                onsuccess(xhr.responseText);
            }
        } else {
            onerror(ev);
        }
    };
    // xhr.withCredentials = true;
    xhr.onerror = onerror;
    if (type === "POST") {
        xhr.send(JSON.stringify(options.data || {}));
    } else {
        xhr.send();
    }
}

module.exports = ajax;