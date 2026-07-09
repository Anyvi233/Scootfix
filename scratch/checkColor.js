const sharp = require('sharp');
const path = require('path');

async function getPixelColor() {
  try {
    const imgPath = path.join(__dirname, '..', 'public', 'images', 'exploded', 'ezgif-frame-001.png');
    const image = sharp(imgPath);
    const metadata = await image.metadata();
    console.log('Channels:', metadata.channels);
    console.log('Format:', metadata.format);
    console.log('Has Alpha:', metadata.hasAlpha);
    
    const { data } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Top-left pixel (RGBA if channels is 4)
    const r = data[0];
    const g = data[1];
    const b = data[2];
    const a = metadata.hasAlpha ? data[3] : 255;
    
    console.log(`RGBA: ${r}, ${g}, ${b}, ${a}`);
    console.log(`HEX: #${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
  } catch (err) {
    console.error(err);
  }
}

getPixelColor();
