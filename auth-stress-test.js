import crypto from "node:crypto";
import http from "node:http";
import https from "node:https";

const TARGET_URL = process.env.TARGET_URL || "http://127.0.0.1:54321/functions/v1/telegram-proxy";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "test_bot_token";

console.log(`\n=== Starting Auth Edge Function Stress Test ===`);
console.log(`Targeting: ${TARGET_URL}`);
console.log(`Run with TARGET_URL and TELEGRAM_BOT_TOKEN environment variables to test other environments.`);
console.log(`Example: TARGET_URL=https://<project-ref>.supabase.co/functions/v1/telegram-proxy TELEGRAM_BOT_TOKEN=your_token node auth-stress-test.js\n`);

// Helper to generate a valid Telegram hash
function generateValidHash(data, botToken) {
    const checkString = Object.keys(data)
        .sort()
        .map((key) => `${key}=${data[key]}`)
        .join("\n");

    const secretKey = crypto.createHash("sha256").update(botToken).digest();
    return crypto.createHmac("sha256", secretKey).update(checkString).digest("hex");
}

function generateTelegramPayloads() {
    const payloads = [];
    const now = Math.floor(Date.now() / 1000);

    // 1. Perfect payload
    let data1 = {
        id: 1001,
        first_name: "John",
        last_name: "Doe",
        username: "johndoe",
        photo_url: "https://example.com/photo.jpg",
        auth_date: now.toString()
    };
    payloads.push({
        name: "Perfect Payload",
        payload: { telegramData: { ...data1, hash: generateValidHash(data1, BOT_TOKEN) } },
        expectedStatus: 200
    });

    // 2. Missing photo_url
    let data2 = {
        id: 1002,
        first_name: "Jane",
        last_name: "Smith",
        username: "janesmith",
        auth_date: now.toString()
    };
    payloads.push({
        name: "Missing photo_url",
        payload: { telegramData: { ...data2, hash: generateValidHash(data2, BOT_TOKEN) } },
        expectedStatus: 200
    });

    // 3. Invalid hash
    let data3 = {
        id: 1003,
        first_name: "Hacker",
        auth_date: now.toString()
    };
    payloads.push({
        name: "Invalid Hash",
        payload: { telegramData: { ...data3, hash: "1234567890abcdef1234567890abcdef" } },
        expectedStatus: 401
    });

    // 4. Missing hash
    let data4 = {
        id: 1004,
        first_name: "NoHash",
        auth_date: now.toString()
    };
    payloads.push({
        name: "Missing Hash",
        payload: { telegramData: data4 }, // No hash property
        expectedStatus: 400
    });

    // 5. Expired auth_date (> 24h old)
    let data5 = {
        id: 1005,
        first_name: "Expired",
        auth_date: (now - 90000).toString() // > 86400 seconds ago
    };
    payloads.push({
        name: "Expired auth_date",
        payload: { telegramData: { ...data5, hash: generateValidHash(data5, BOT_TOKEN) } },
        expectedStatus: 401
    });

    // 6. Extremely long name
    let data6 = {
        id: 1006,
        first_name: "A".repeat(500),
        last_name: "B".repeat(500),
        username: "longnameuser",
        auth_date: now.toString()
    };
    payloads.push({
        name: "Extremely Long Name",
        payload: { telegramData: { ...data6, hash: generateValidHash(data6, BOT_TOKEN) } },
        expectedStatus: 200
    });

    // 7. Missing required data wrapper
    payloads.push({
        name: "Missing telegramData wrapper",
        payload: { id: 1007, hash: "dummy" },
        expectedStatus: 400
    });

    // 8. Empty payload
    payloads.push({
        name: "Empty Payload",
        payload: {},
        expectedStatus: 400
    });

    // 9. Extra fields in data (should still pass if hash is valid)
    let data9 = {
        id: 1009,
        first_name: "Extra",
        auth_date: now.toString(),
        unexpected_field: "sneaky"
    };
    payloads.push({
        name: "Extra fields with valid hash",
        payload: { telegramData: { ...data9, hash: generateValidHash(data9, BOT_TOKEN) } },
        expectedStatus: 200
    });

    // 10. Wrong bot token
    let data10 = {
        id: 1010,
        first_name: "WrongToken",
        auth_date: now.toString()
    };
    payloads.push({
        name: "Wrong Bot Token Used For Signature",
        payload: { telegramData: { ...data10, hash: generateValidHash(data10, "wrong_token_123") } },
        expectedStatus: 401
    });

    return payloads;
}

function makeRequest(url, payload) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        const data = JSON.stringify(payload);

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = protocol.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    data: responseData
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

async function runTests() {
    const payloads = generateTelegramPayloads();
    let passed = 0;
    let failed = 0;
    let errors = 0;

    for (const testCase of payloads) {
        console.log(`\nTesting: ${testCase.name}`);
        console.log(`Expected Status: ${testCase.expectedStatus}`);

        try {
            const response = await makeRequest(TARGET_URL, testCase.payload);
            const status = response.status;

            if (status === testCase.expectedStatus) {
                console.log(`✅ PASS: Received expected status ${status}`);
                passed++;
            } else {
                console.log(`❌ FAIL: Expected ${testCase.expectedStatus}, but got ${status}`);
                console.log(`   Response body: ${response.data}`);
                failed++;
            }
        } catch (error) {
            console.log(`⚠️ ERROR: Request failed - ${error.message}`);
            // Do not fail the whole suite if endpoint is down since this script will be committed for QA engineers to run against actual environments.
            errors++;
        }
    }

    console.log(`\n=== Test Summary ===`);
    console.log(`Total Tests: ${payloads.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Errors (e.g. connection refused): ${errors}`);

    // We exit 0 even on connection errors so pre-commits pass in environments without Supabase local running.
    // Real failures against the endpoint should fail the process.
    if (failed > 0) {
        process.exit(1);
    }
}

runTests();
