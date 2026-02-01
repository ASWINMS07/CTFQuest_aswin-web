const crypto = require('crypto');

async function solve() {
    // 1. Get Admin Session for Hint 2
    const login = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'adminpass' })
    });
    const { token } = await login.json();

    // 2. Get Hints from Headers
    const status = await fetch('http://localhost:3000/api/status', {
        headers: { 'Cookie': `session=${token}` }
    });

    const h1 = Buffer.from(status.headers.get('x-integrity-check'), 'base64').toString();
    const h2 = Buffer.from(status.headers.get('x-hardware-layer'), 'base64').toString();
    console.log(`[+] Hints recovered: ${h1}, ${h2}`);

    // 3. Derive Keys
    const k1 = crypto.createHash('sha256').update(h1).digest();
    const k2 = crypto.createHash('sha256').update(h2).digest();

    // 4. Get Encrypted Blob
    const preview = await fetch('http://localhost:3000/beta-preview', {
        headers: { 'Cookie': `session=${token}; preview_mode=true` }
    });
    const data = await preview.json();
    console.log(`[+] Encrypted blob: ${data.encrypted_access.substring(0, 20)}...`);

    // 5. Decrypt
    // Logic from server: encrypt(encrypt(payload, k1), k2)
    // Decrypt: decrypt(decrypt(blob, k2), k1)

    try {
        // Outer layer (K2)
        const d2 = crypto.createDecipheriv('aes-256-cbc', k2, Buffer.from(data.layer2_iv, 'hex'));
        let link = d2.update(data.encrypted_access, 'hex', 'utf8');
        link += d2.final('utf8');

        // Inner layer (K1)
        const d1 = crypto.createDecipheriv('aes-256-cbc', k1, Buffer.from(data.layer1_iv, 'hex'));
        let final = d1.update(link, 'hex', 'utf8');
        final += d1.final('utf8');

        console.log(`\n🎉 FLAG PART 1: ${final}`);
    } catch (e) {
        console.error("[-] Decryption failed:", e.message);
    }
}

solve();
