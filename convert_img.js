const fs = require('fs');
const PNG = require('pngjs').PNG;
const jpeg = require('jpeg-js');

const src = 'public/assets/base_evidence.png';
const dst = 'public/assets/base_evidence.jpg';

fs.createReadStream(src)
    .pipe(new PNG({ filterType: 4 }))
    .on('parsed', function () {
        console.log('PNG Parsed. converting to JPEG...');
        const rawImageData = {
            data: this.data,
            width: this.width,
            height: this.height,
        };
        const jpegImageData = jpeg.encode(rawImageData, 80);
        fs.writeFileSync(dst, jpegImageData.data);
        console.log('Conversion successful: ' + dst);
    })
    .on('error', (err) => {
        console.error('PNG error:', err);
    });
