# Secure Rite Solutions - CTF Complete Write-Up

This guide details the step-by-step procedure to find all 4 flags in the Secure Rite Solutions CTF.

## 🚩 Flag Part 1: "mr_h4ck3r"
**Challenge:** Access Control Bypass & Cryptography

1.  **Discovery**:
    - Looking at `server.js`, we see a hidden endpoint `/beta-preview`.
    - If you try to visit it, you get a "Access Denied" error.

2.  **Bypassing Access Control**:
    - The code shows `req.cookies.preview_mode !== 'true'`.
    - **Action**: Open your browser's Developer Tools (F12) -> Console.
    - **Command**: Run `document.cookie = "preview_mode=true; path=/"`.
    - **Result**: You can now access `/beta-preview`, but the content is encrypted!

3.  **Decrypting the Flag**:
    - The server uses "Double AES Encryption". We need two keys.
    - **Finding Hints**: The server sends hints in the HTTP response headers of `/api/status`.
    - **Crucial Step**: You must be logged in as **admin** (`admin`/`adminpass`) to see the second hint!
        - Hint 1 (Header `X-Integrity-Check`): `secure_rite_integrity`
        - Hint 2 (Header `X-Hardware-Layer`): `hardware_layer_key`
    - **Solution**:
        - Hash these hints using SHA-256 to get the keys.
        - Decrypt the data twice (Layer 2 then Layer 1).
    - **Flag**: `mr_h4ck3r`

---

## 🚩 Flag Part 2: "sr13shw4r"
**Challenge:** Hidden Client-Side Logic

1.  **Analysis**:
    - Open `public/preview.html` and look at the JavaScript code at the bottom.
    - There is a logic block that checks for a specific "Tier" and a URL parameter.

2.  **Requirements**:
    - Code: `if (decoded.tier === 'beta' && debug === 'true')`
    - You need to be a **Beta** user. The `admin` account is Tier: Beta.
    - You need `?debug=true` in the URL.

3.  **Execution**:
    - Log in as `admin`.
    - Navigate to: `http://localhost:3000/preview.html?debug=true`
    - **Result**: The code runs and reveals the flag (or you can just read it in the source code!).
    - **Flag**: `sr13shw4r`

---

## 🚩 Flag Part 3: "w3lc0m3s"
**Challenge:** Crypto Oracle / Key Reuse

1.  **Discovery**:
    - On the Preview page, there is a "Secure Message Echo" feature.
    - It sends your message to the server, and the server returns it **encrypted**.

2.  **Vulnerability**:
    - In `server.js`, inside `/api/message`, the server adds a hidden field `system_ref` containing the flag.
    - **Weakness**: It uses the **Primary AES Key** (from Flag Part 1) to encrypt this response.
    - Since we already found the key (`secure_rite_integrity`), we can decrypt this message too!

3.  **Solution**:
    - Send a message to `/api/message`.
    - Take the encrypted response.
    - Decrypt it using the Primary Key.
    - **Flag**: `w3lc0m3s`

---

## 🚩 Flag Part 4: "y0u"
**Challenge:** JWT Algorithm Confusion (`none` algorithm)

1.  **Discovery**:
    - In `server.js`, there is an endpoint `/api/export`.
    - It is protected by a JWT (JSON Web Token) check.

2.  **Vulnerability**:
    - The code explicitly allows the `none` algorithm:
      `jwt.verify(token, ..., { algorithms: ['HS256', 'none'] })`
    - This means we can create a fake "Admin" token without needing the secret password!

3.  **Exploitation**:
    - Create a JWT with:
        - Header: `{"alg": "none", "typ": "JWT"}`
        - Payload: `{"username": "hacker", "role": "admin", "debug": true}`
    - Access `/api/export` with this fake token.

4.  **Result**:
    - The server accepts the fake admin token.
    - It responds with an **RSA Private Key** and an **Encrypted Blob**.
    - Since it gave you the Private Key, you can simply decrypt the blob to get the final flag.
    - **Flag**: `y0u`

---

### 🏁 Final Flag Assembly
Putting it all together:
`mr_h4ck3r` + `sr13shw4r` + `w3lc0m3s` + `y0u`
