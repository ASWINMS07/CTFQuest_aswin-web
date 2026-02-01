# Secure Rite CTF: Proof of Concept / Writeup

**Challenge Name**: Secure Rite Solutions - Protocol Breach
**Difficulty**: Medium
**Objective**: Infiltrate the industrial control system and recover the two-part protocol flag.

---

## 1. Reconnaissance

### Initial Scan
We start by visiting the target application at `http://localhost:3000`. It appears to be a legitimate industrial door company website.

### Checking `robots.txt`
A standard check of `/robots.txt` reveals a hidden directory:

```bash
curl http://localhost:3000/robots.txt
# Output:
# User-agent: *
# Disallow: /admin/
# Disallow: /flags/
```

We navigate to `/flags/` and find a file named `/flags/flag1.enc`. The content is encrypted/garbled, confirming that obtaining the flag involves more than just finding this file.

---

## 2. Accessing the Decryption Unit

Exploration of the navbar leads to `/preview.html`, labeled "Beta Preview". This loads a "Decryption Unit" interface.
The interface asks for a **Decryption Key Sequence** and has two modes: **CHANNEL ALPHA** and **CHANNEL BETA**.

### Finding Key #1 (Alpha)
We inspect the client-side source code (`Ctrl+U` or F12). In the `<script>` section of `preview.html`, we find a leftover debug configuration:

```javascript
const _DEBUG_CONFIG = {
    version: '2.4.1',
    alpha_default: 'alpha_protocol_init', // <--- TARGET ACQUIRED
    retry_limit: 3
};
```

**Key Alpha**: `alpha_protocol_init`

---

## 3. Retrieving Flag Part 1

1. Return to the Decryption Unit (`/preview.html`).
2. Enter the key: `alpha_protocol_init`.
3. Ensure **CHANNEL ALPHA** is selected.
4. Click **INITIALIZE DECRYPTION**.
5. The system processes the request and downloads an image: `evidence_alpha_[timestamp].jpg`.

### Steganography Analysis
The downloaded image looks like a standard industrial photo. We check the strings and metadata.

```bash
exiftool evidence_alpha_....jpg
# ...
# User Comment : The Flag is: SECE{mr_h4ck3r_sr13shw4r
```

**Flag Part 1**: `SECE{mr_h4ck3r_sr13shw4r`

---

## 4. Finding Key #2 (Beta)

We try to use the "CHANNEL BETA" switch on the machine, but we don't have the key. The console output hints: *"HINT: Check Server Headers or API Status for Beta Key..."*

We check the network traffic or manually inspect common API endpoints. We inspect the response headers of `/api/status`:

```bash
curl -I http://localhost:3000/api/status
# HTTP/1.1 200 OK
# X-Powered-By: Express
# X-Beta-Protocol-Key: YmV0YV9wcm90b2NvbF9vdmVycmlkZQ==
# ...
```

The header `X-Beta-Protocol-Key` contains a Base64 string.
Decoding it: `echo YmV0YV9wcm90b2NvbF9vdmVycmlkZQ== | base64 -d`
**Result**: `beta_protocol_override`

---

## 5. Retrieving Flag Part 2

1. Return to the Decryption Unit.
2. Enter the key: `beta_protocol_override`.
3. Toggle the switch to **CHANNEL BETA**.
4. Click **INITIALIZE DECRYPTION**.
5. Download the second evidence image.

### Steganography Analysis
Running `exiftool` on this new image:

```bash
exiftool evidence_beta_....jpg
# ...
# User Comment : The Flag is: w3lc0m3s_y0u}
```

**Flag Part 2**: `w3lc0m3s_y0u}`

---

## FINAL FLAG
Combining the two parts found in the steganographic images:
**`SECE{mr_h4ck3r_sr13shw4rw3lc0m3s_y0u}`**
