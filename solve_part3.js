const crypto = require('crypto');

async function solvePart3() {
    // 1. Re-derive the Key we found in Part 1
    // Hint was 'secure_rite_integrity'
    const HINT_STRING = 'secure_rite_integrity';
    const PRIMARY_AES_KEY = crypto.createHash('sha256').update(HINT_STRING).digest();
    const STATIC_IV = Buffer.alloc(16, 0); // From server.js line 19

    console.log('[+] Primary Key & IV ready.');

    // 2. Send a request to the Message API
    // We don't even need to be logged in for the encryption to happen (user defaults to 'guest')
    // But the flag is always there in 'system_ref'.
    console.log('[*] Sending message to /api/message...');

    try {
        const response = await fetch('http://localhost:3000/api/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Hello Flag 3' })
        });

        const data = await response.json();

        if (!data.enc_response) {
            console.error('[-] No encrypted response found:', data);
            return;
        }

        console.log(`[+] Received ciphertext: ${data.enc_response.substring(0, 20)}...`);

        // 3. Decrypt the response
        const decipher = crypto.createDecipheriv('aes-256-cbc', PRIMARY_AES_KEY, STATIC_IV);
        let decrypted = decipher.update(data.enc_response, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        console.log('\n[+] Decrypted Payload:');
        console.log(decrypted);

        const json = JSON.parse(decrypted);
        console.log(`\n🎉 FLAG PART 3: ${json.system_ref}`);

    } catch (err) {
        console.error('[-] Error:', err.message);
    }
}

solvePart3();
