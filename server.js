const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// ==================== CONFIG ====================
const FLAG_1_NAME = "evidence_part1.jpg";
const FLAG_2_NAME = "evidence_part2.jpg";
const SECRET_KEY = "super_secure_enterprise_secret_1337";

// ==================== MIDDLEWARE ====================
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// Anti-SQLi Middleware
app.use((req, res, next) => {
    const rawParams = JSON.stringify(req.body) + JSON.stringify(req.query);
    if (/('|")\s*OR\s*|UNION\s+SELECT|;\s*DROP\s+TABLE|--/.test(rawParams.toUpperCase())) {
        return res.redirect('/spam_error.html');
    }
    next();
});

// Authentication Middleware
const authenticate = (req, res, next) => {
    const token = req.cookies.session;
    if (!token) return res.status(401).json({ error: "Unauthorized. Please login." });

    try {
        // Explicitly allow 'none' algorithm for Flag Part 4 challenge
        const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ['HS256', 'none'] });
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid session." });
    }
};

// ==================== ROUTES ====================

// 1. Robots.txt
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Disallow: /beta-preview
Disallow: /admin-export
Disallow: /api/admin

# Secure Rite Solutions - Enterprise Access Security
# For support: 1-800-448-8979
# Version: 3.2.1-enterprise
`);
});

// 2. Serve the Encrypted Flag Files
app.get('/flags/flag1.enc', (req, res) => {
    res.sendFile(path.join(__dirname, 'flags/flag1.enc'));
});

// Accessing /server.js downloads the encrypted Part 2 flag
app.get('/server.js', (req, res) => {
    const flag2Path = path.join(__dirname, 'flags/flag2.enc');
    if (fs.existsSync(flag2Path)) {
        res.download(flag2Path, 'flag2.enc');
    } else {
        res.status(404).send('Resource not found.');
    }
});

// 3. API Endpoints
app.get('/api/status', authenticate, (req, res) => {
    res.json({ system: "Operational", version: "3.2.1-ent", node: "SRS-SERVER-01" });
});

app.get('/beta-preview', authenticate, (req, res) => {
    res.status(403).send("<h1>Access Denied</h1><p>Feature under maintenance.</p>");
});

app.post('/api/export', authenticate, (req, res) => {
    res.status(401).json({ error: "Access Denied: Debug mode disabled." });
});

// 3. The Decryption Machine Endpoint
app.post('/api/decrypt-mission', (req, res) => {
    const { key, channel } = req.body;

    if (!key) {
        return res.status(400).json({ error: "Key sequence missing." });
    }

    const EXPECTED_KEY_1 = "0xFlag";
    const EXPECTED_KEY_2 = "0xCTF";

    setTimeout(() => {
        let imageToServe = null;

        if (channel === 'alpha') {
            if (key.trim() === EXPECTED_KEY_1) {
                imageToServe = FLAG_1_NAME;
            }
        } else if (channel === 'beta') {
            if (key.trim() === EXPECTED_KEY_2) {
                imageToServe = FLAG_2_NAME;
            }
        }

        if (imageToServe) {
            const imgPath = path.join(__dirname, 'evidence_storage', imageToServe);
            if (fs.existsSync(imgPath)) {
                res.set('Content-Type', 'image/jpeg');
                res.set('Content-Disposition', `attachment; filename="${imageToServe}"`);
                return res.sendFile(imgPath);
            } else {
                return res.status(500).json({ error: "System Error: Asset missing in private storage." });
            }
        } else {
            return res.status(401).json({ error: "Invalid Decryption Key or Protocol Channel" });
        }
    }, 1500);
});

// Login Route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const users = {
        'admin': { password: 'adminpass', role: 'admin', tier: 'beta' }
    };

    const user = users[username];
    if (user && user.password === password) {
        const token = jwt.sign({
            username: username,
            role: user.role,
            tier: user.tier
        }, SECRET_KEY);

        res.cookie('session', token, { httpOnly: false }); // httpOnly false so client script can read it if needed
        return res.json({ success: true, redirect: '/dashboard.html', token: token });
    }

    res.status(401).json({ success: false, error: "Invalid credentials" });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`\n🔒 Secure Rite Solutions Server`);
    console.log(`   Running at http://localhost:${PORT}`);
    console.log(`   Press Ctrl+C to stop\n`);
});

