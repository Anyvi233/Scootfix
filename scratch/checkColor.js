const sharp = require('sharp');
const path = require('path');

async function getPixelColor() {
  try {
    const imgPath = path.join(__dirname, '..', 'public', 'images', 'exploded', 'ezgif-frame-001.jpg');
    const { data } = await sharp(imgPath)
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Top-left pixel (RGB)
    const r = data[0];
    const g = data[1];
    const b = data[2];
    
    console.log(`RGB: ${r}, ${g}, ${b}`);
    console.log(`HEX: #${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
  } catch (err) {
    console.error(err);
  }
}

getPixelColor();
