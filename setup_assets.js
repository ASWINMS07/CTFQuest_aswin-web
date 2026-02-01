const fs = require('fs');
const path = require('path');

function setup() {
    console.log('Creating flags directory...');
    if (!fs.existsSync('flags')) {
        fs.mkdirSync('flags');
    }

    // Part 1
    const encryptedFlag1 = "0xFlag";
    fs.writeFileSync('flags/flag1.enc', encryptedFlag1);
    console.log(`Flag 1 File updated with: ${encryptedFlag1}`);

    // Part 2
    const encryptedFlag2 = "0xCTF";
    fs.writeFileSync('flags/flag2.enc', encryptedFlag2);
    console.log(`Flag 2 File updated with: ${encryptedFlag2}`);

    console.log('Flag files updated successfully.');
}

setup();
