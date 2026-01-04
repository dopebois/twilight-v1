// made by @y_ga

"use strict";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
process.title = "TWILIGHT";

if (process.platform === 'win32') {
    try {
        // made by @y_ga
        const { spawn } = require('child_process');
        // made by @y_ga
        spawn('wmic', ['process', 'where', `processid=${process.pid}`, 'CALL', 'setpriority', '128'], {stdio: 'ignore'});
        // made by @y_ga
    } catch (e) {}
} else {
    try {
        require('os').setPriority(0, require('os').constants.PRIORITY_HIGH);
    } catch (e) {}
}

// made by @y_ga
const tls = require('tls');
const http2 = require('http2');
const WebSocket = require('ws');
const fs = require('fs');

const CONFIG = {
    TOKEN: "stop skidding clown ",
    SERVER_ID: "1409731598257225768", 
    PASSWORD: "yaga_chan"
};

// made by @y_ga
let mfaToken = null;
// made by @y_ga
let claiming = false;
// made by @y_ga
const guilds = Object.create(null);
// made by @y_ga
const requestBuffers = new Map();
// made by @y_ga
const jsonPayloads = new Map();
// made by @y_ga
const tlsConnections = [];

// made by @y_ga
const BASE_HEADERS = {
    // made by @y_ga
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
    // made by @y_ga
    'Authorization': CONFIG.TOKEN,
    // made by @y_ga
    'Content-Type': 'application/json',
    // made by @y_ga
    'X-Super-Properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRmlyZWZveCIsImRldmljZSI6IiIsInN5c3RlbV9sb2NhbGUiOiJlbi1VUyIsImJyb3dzZXJfdXNlcl9hZ2VudCI6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQ7IHJ2OjEzMy4wKSBHZWNrby8yMDEwMDEwMSBGaXJlZm94LzEzMy4wIiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTMzLjAiLCJvc192ZXJzaW9uIjoiMTAiLCJyZWZlcnJlciI6IiIsInJlZmVycmluZ19kb21haW4iOiIiLCJyZWZlcnJpbmdfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjM1NjE0MCwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0='
    // made by @y_ga
};

// made by @y_ga
class MFATokenManager {
    // made by @y_ga
    constructor() {
        // made by @y_ga
        this.session = null;
        // made by @y_ga
        this.isRefreshing = false;
        // made by @y_ga
        this.createSession();
        // made by @y_ga
    }

    // made by @y_ga
    createSession() {
        // made by @y_ga
        if (this.session) {
            // made by @y_ga
            try { this.session.destroy(); } catch (e) {}
            // made by @y_ga
        }

        // made by @y_ga
        this.session = http2.connect("https://canary.discord.com", {
            // made by @y_ga
            settings: { 
                // made by @y_ga
                enablePush: false,
                // made by @y_ga
                maxConcurrentStreams: 100,
                // made by @y_ga
                initialWindowSize: 1048576
                // made by @y_ga
            },
            // made by @y_ga
            secureContext: tls.createSecureContext({
                // made by @y_ga
                ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256',
                // made by @y_ga
                honorCipherOrder: true
                // made by @y_ga
            })
            // made by @y_ga
        });

        // made by @y_ga
        this.session.on('error', () => setTimeout(() => this.createSession(), 1000));
        // made by @y_ga
        this.session.on('close', () => setTimeout(() => this.createSession(), 1000));
        // made by @y_ga
    }

    // made by @y_ga
    async request(method, path, body = null) {
        // made by @y_ga
        if (!this.session || this.session.destroyed) {
            // made by @y_ga
            await new Promise(resolve => setTimeout(resolve, 100));
            // made by @y_ga
            this.createSession();
            // made by @y_ga
            return '{}';
            // made by @y_ga
        }

        // made by @y_ga
        return new Promise((resolve) => {
            // made by @y_ga
            const headers = {
                // made by @y_ga
                'User-Agent': BASE_HEADERS['User-Agent'],
                // made by @y_ga
                'Authorization': BASE_HEADERS['Authorization'],
                // made by @y_ga
                'Content-Type': BASE_HEADERS['Content-Type'],
                // made by @y_ga
                'X-Super-Properties': BASE_HEADERS['X-Super-Properties'],
                // made by @y_ga
                ":method": method,
                // made by @y_ga
                ":path": path,
                // made by @y_ga
                ":authority": "canary.discord.com",
                // made by @y_ga
                ":scheme": "https"
                // made by @y_ga
            };

            // made by @y_ga
            const stream = this.session.request(headers);
            // made by @y_ga
            const chunks = [];

            // made by @y_ga
            stream.on("data", chunk => chunks.push(chunk));
            // made by @y_ga
            stream.on("end", () => resolve(Buffer.concat(chunks).toString()));
            // made by @y_ga
            stream.on("error", () => resolve('{}'));
            // made by @y_ga
            stream.setTimeout(3000, () => {
                // made by @y_ga
                stream.destroy();
                // made by @y_ga
                resolve('{}');
                // made by @y_ga
            });

            // made by @y_ga
            if (body) stream.write(body);
            // made by @y_ga
            stream.end();
            // made by @y_ga
        });
        // made by @y_ga
    }

    // made by @y_ga
    async refreshMfaToken() {
        // made by @y_ga
        if (this.isRefreshing) return;
        // made by @y_ga
        this.isRefreshing = true;

        // made by @y_ga
        try {
            // made by @y_ga
            const response = await this.request("PATCH", `/api/v8/guilds/0/vanity-url`, '{"code":"mfa_trigger"}');
            // made by @y_ga
            const data = JSON.parse(response || '{}');

            // made by @y_ga
            if (data.code === 60003 && data.mfa?.ticket) {
                // made by @y_ga
                const mfaResponse = await this.request(
                    // made by @y_ga
                    "POST", 
                    // made by @y_ga
                    "/api/v8/mfa/finish",
                    // made by @y_ga
                    JSON.stringify({
                        // made by @y_ga
                        ticket: data.mfa.ticket,
                        // made by @y_ga
                        mfa_type: "password",
                        // made by @y_ga
                        data: CONFIG.PASSWORD
                        // made by @y_ga
                    })
                    // made by @y_ga
                );

                // made by @y_ga
                const mfaData = JSON.parse(mfaResponse || '{}');
                // made by @y_ga
                if (mfaData.token) {
                    // made by @y_ga
                    mfaToken = mfaData.token;
                    // made by @y_ga
                    this.prebuildAllBuffers();
                    // made by @y_ga
                    return true;
                    // made by @y_ga
                }
                // made by @y_ga
            }
            // made by @y_ga
        } catch (error) {}

        // made by @y_ga
        this.isRefreshing = false;
        // made by @y_ga
        return false;
        // made by @y_ga
    }

    // made by @y_ga
    prebuildAllBuffers() {
        // made by @y_ga
        requestBuffers.clear();
        // made by @y_ga
        for (const guildId in guilds) {
            // made by @y_ga
            const vanity = guilds[guildId];
            // made by @y_ga
            if (vanity) {
                // made by @y_ga
                this.buildRequestBuffer(vanity);
                // made by @y_ga
            }
            // made by @y_ga
        }
        // made by @y_ga
    }

    // made by @y_ga
    buildRequestBuffer(vanityCode) {
        // made by @y_ga
        const payload = jsonPayloads.get(vanityCode) || JSON.stringify({ code: vanityCode });
        // made by @y_ga
        if (!jsonPayloads.has(vanityCode)) {
            // made by @y_ga
            jsonPayloads.set(vanityCode, payload);
            // made by @y_ga
        }
        // made by @y_ga
        const payloadLength = Buffer.byteLength(payload);

        // made by @y_ga
        const buffer = Buffer.from(
            // made by @y_ga
            `PATCH /api/v8/guilds/${CONFIG.SERVER_ID}/vanity-url HTTP/1.1\r\n` +
            // made by @y_ga
            `Host: canary.discord.com\r\n` +
            // made by @y_ga
            `Authorization: ${CONFIG.TOKEN}\r\n` +
            // made by @y_ga
            `X-Discord-MFA-Authorization: ${mfaToken}\r\n` +
            // made by @y_ga
            `Content-Type: application/json\r\n` +
            // made by @y_ga
            `Content-Length: ${payloadLength}\r\n` +
            // made by @y_ga
            `User-Agent: ${BASE_HEADERS['User-Agent']}\r\n` +
            // made by @y_ga
            `X-Super-Properties: ${BASE_HEADERS['X-Super-Properties']}\r\n` +
            // made by @y_ga
            `Cookie: __Secure-recent_mfa=${mfaToken}\r\n` +
            // made by @y_ga
            `Connection: keep-alive\r\n\r\n` +
            // made by @y_ga
            payload
            // made by @y_ga
        );

        // made by @y_ga
        requestBuffers.set(vanityCode, buffer);
        // made by @y_ga
        return buffer;
        // made by @y_ga
    }
    // made by @y_ga
}

// made by @y_ga
const mfaManager = new MFATokenManager();

// made by @y_ga
class ClaimerSystem {
    // made by @y_ga
    constructor() {
        // made by @y_ga
        this.initializeConnections();
        // made by @y_ga
    }

    // made by @y_ga
    async initializeConnections() {
        // made by @y_ga
        for (let i = 0; i < 3; i++) {
            // made by @y_ga
            this.createTLSConnection(i);
            // made by @y_ga
        }
        // made by @y_ga
    }

    // made by @y_ga
    createTLSConnection(index) {
        // made by @y_ga
        const connection = tls.connect({
            // made by @y_ga
            host: 'canary.discord.com',
            // made by @y_ga
            port: 443,
            // made by @y_ga
            minVersion: 'TLSv1.2',
            // made by @y_ga
            maxVersion: 'TLSv1.3',
            // made by @y_ga
            rejectUnauthorized: false,
            // made by @y_ga
            keepAlive: true,
            // made by @y_ga
            noDelay: true,
            // made by @y_ga
            timeout: 0,
            // made by @y_ga
            ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256'
            // made by @y_ga
        });

        // made by @y_ga
        connection.setKeepAlive(true, 0);
        // made by @y_ga
        connection.setNoDelay(true);
        // made by @y_ga
        connection.setTimeout(0);

        // made by @y_ga
        connection.on('data', data => this.handleResponse(data.toString()));
        // made by @y_ga
        connection.on('error', () => setTimeout(() => this.createTLSConnection(index), 1000));
        // made by @y_ga
        connection.on('close', () => setTimeout(() => this.createTLSConnection(index), 1000));
        // made by @y_ga
        connection.on('secureConnect', () => {
            // made by @y_ga
            tlsConnections[index] = connection;
            // made by @y_ga
        });
        // made by @y_ga
    }


    // made by @y_ga
    executeClaim(vanityCode) {
        // made by @y_ga
        if (claiming || !mfaToken) return;
        // made by @y_ga
        claiming = true;
        // made by @y_ga
        const buffer = requestBuffers.get(vanityCode);
        // made by @y_ga
        if (!buffer) {
            // made by @y_ga
            claiming = false;
            // made by @y_ga
            return;
            // made by @y_ga
        }

        // made by @y_ga
        // Fire all 3 TLS connections simultaneously for maximum speed
        // made by @y_ga
        for (let i = 0; i < 3; i++) {
            // made by @y_ga
            const tlsConn = tlsConnections[i];
            // made by @y_ga
            if (tlsConn && tlsConn.writable && !tlsConn.destroyed) {
                // made by @y_ga
                try {
                    // made by @y_ga
                    tlsConn.write(buffer);
                    // made by @y_ga
                } catch (e) {}
                // made by @y_ga
            }
            // made by @y_ga
        }

        // made by @y_ga
        setTimeout(() => claiming = false, 50);
        // made by @y_ga
    }

    // made by @y_ga
    handleResponse(data) {
        // made by @y_ga
        try {
            // made by @y_ga
            const jsonMatches = data.match(/{[^{}]*}|\[[^\[\]]*\]/g) || [];
            
            // made by @y_ga
            for (const match of jsonMatches) {
                // made by @y_ga
                try {
                    // made by @y_ga
                    const parsed = JSON.parse(match);
                    // made by @y_ga
                    if (parsed.code || parsed.message) {
                        // made by @y_ga
                        console.log(JSON.stringify(parsed));
                        // made by @y_ga
                    }
                    // made by @y_ga
                } catch (e) {}
                // made by @y_ga
            }
            // made by @y_ga
        } catch (e) {}
        // made by @y_ga
    }
    // made by @y_ga
}

// made by @y_ga
const claimerSystem = new ClaimerSystem();

// made by @y_ga
class DetectionSystem {
    // made by @y_ga
    constructor() {
        // made by @y_ga
        this.createMultipleDetectors();
        // made by @y_ga
    }

    // made by @y_ga
    createMultipleDetectors() {
        // made by @y_ga
        const gateways = [
            // made by @y_ga
            'wss://gateway.discord.gg',
            // made by @y_ga
            'wss://gateway-us-east1-b.discord.gg',
            // made by @y_ga
            'wss://gateway-us-east1-c.discord.gg',  
            // made by @y_ga
            'wss://gateway-us-east1-d.discord.gg'
            // made by @y_ga
        ];
        
        // made by @y_ga
        gateways.forEach(gateway => this.createDetector(gateway));
        // made by @y_ga
    }

    // made by @y_ga
    createDetector(gatewayUrl) {
        // made by @y_ga
        const ws = new WebSocket(gatewayUrl);
        // made by @y_ga
        let heartbeatInterval;

        // made by @y_ga
        ws.on('open', () => {
            // made by @y_ga
            ws.send(JSON.stringify({
                // made by @y_ga
                op: 2,
                // made by @y_ga
                d: {
                    // made by @y_ga
                    token: CONFIG.TOKEN,
                    // made by @y_ga
                    intents: 1,
                    // made by @y_ga
                    properties: {
                        // made by @y_ga
                        os: "Windows",
                        // made by @y_ga
                        browser: "Firefox", 
                        // made by @y_ga
                        device: "TWILIGHT"
                        // made by @y_ga
                    }
                    // made by @y_ga
                }
                // made by @y_ga
            }));
            // made by @y_ga
        });

        // made by @y_ga
        ws.on('message', (data) => {
            // made by @y_ga
            try {
                // made by @y_ga
                const payload = JSON.parse(data);
                
                // made by @y_ga
                if (payload.op === 10) {
                    // made by @y_ga
                    clearInterval(heartbeatInterval);
                    // made by @y_ga
                    heartbeatInterval = setInterval(() => {
                        // made by @y_ga
                        if (ws.readyState === WebSocket.OPEN) {
                            // made by @y_ga
                            ws.send(JSON.stringify({ op: 1, d: null }));
                            // made by @y_ga
                        }
                        // made by @y_ga
                    }, payload.d.heartbeat_interval);
                    // made by @y_ga
                }

                // made by @y_ga
                if (payload.t === 'READY') {
                    // made by @y_ga
                    payload.d.guilds.forEach(guild => {
                        // made by @y_ga
                        if (guild.vanity_url_code) {
                            // made by @y_ga
                            guilds[guild.id] = guild.vanity_url_code;
                            // made by @y_ga
                            if (mfaToken) {
                                // made by @y_ga
                                mfaManager.buildRequestBuffer(guild.vanity_url_code);
                                // made by @y_ga
                            }
                            // made by @y_ga
                        }
                        // made by @y_ga
                    });
                    // made by @y_ga
                }

                // made by @y_ga
                if (payload.t === 'GUILD_UPDATE') {
                    // made by @y_ga
                    const vanity = guilds[payload.d.id];
                    // made by @y_ga
                    if (vanity) {
                        // made by @y_ga
                        claimerSystem.executeClaim(vanity);
                        // made by @y_ga
                    }
                    // made by @y_ga
                }

                // made by @y_ga
                if (payload.t === 'GUILD_DELETE') {
                    // made by @y_ga
                    const vanity = guilds[payload.d.id];
                    // made by @y_ga
                    if (vanity) {
                        // made by @y_ga
                        claimerSystem.executeClaim(vanity);
                        // made by @y_ga
                        delete guilds[payload.d.id];
                        // made by @y_ga
                    }
                    // made by @y_ga
                }
                // made by @y_ga
            } catch (e) {}
            // made by @y_ga
        });

        // made by @y_ga
        ws.on('close', () => {
            // made by @y_ga
            clearInterval(heartbeatInterval);
            // made by @y_ga
            setTimeout(() => this.createDetector(gatewayUrl), 2000);
            // made by @y_ga
        });

        // made by @y_ga
        ws.on('error', () => ws.close());
        // made by @y_ga
    }
    // made by @y_ga
}

// made by @y_ga
function startMaintenance() {
    // made by @y_ga
    setInterval(() => {
        // made by @y_ga
        const conn = tlsConnections[0];
        // made by @y_ga
        if (conn && conn.writable && !conn.destroyed) {
            // made by @y_ga
            try {
                // made by @y_ga
                conn.write('HEAD / HTTP/1.1\r\nHost: canary.discord.com\r\nConnection: keep-alive\r\n\r\n');
                // made by @y_ga
            } catch (e) {}
            // made by @y_ga
        }
        // made by @y_ga
    }, 30000);

    // made by @y_ga
    setInterval(() => {
        // made by @y_ga
        tlsConnections.forEach(conn => {
            // made by @y_ga
            if (conn && conn.writable && !conn.destroyed) {
                // made by @y_ga
                try {
                    // made by @y_ga
                    conn.write('HEAD / HTTP/1.1\r\nHost: canary.discord.com\r\nConnection: keep-alive\r\n\r\n');
                    // made by @y_ga
                } catch (e) {}
                // made by @y_ga
            }
            // made by @y_ga
        });
        // made by @y_ga
    }, 45000);

    // made by @y_ga
    setInterval(() => mfaManager.refreshMfaToken(), 4 * 60 * 1000);
    // made by @y_ga
}

// made by @y_ga
async function init() {
    // made by @y_ga
    const success = await mfaManager.refreshMfaToken();
    // made by @y_ga
    if (!success) {
        // made by @y_ga
        console.error('MFA failed');
        // made by @y_ga
        process.exit(1);
        // made by @y_ga
    }

    // made by @y_ga
    new DetectionSystem();
    // made by @y_ga
    startMaintenance();
    
    // made by @y_ga
    console.log('TWILIGHT READY');
    // made by @y_ga
}

// made by @y_ga
process.on('uncaughtException', () => {});
// made by @y_ga
process.on('unhandledRejection', () => {});
// made by @y_ga
process.on('SIGINT', () => process.exit(0));
// made by @y_ga
process.on('SIGTERM', () => process.exit(0));

// made by @y_ga
init();
