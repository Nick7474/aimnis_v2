import sizeOf from 'image-size';
import https from 'https';

function checkImage(url) {
  https.get(url, (response) => {
    const chunks = [];
    response.on('data', (chunk) => chunks.push(chunk));
    response.on('end', () => {
      const buffer = Buffer.concat(chunks);
      try {
        const dimensions = sizeOf(buffer);
        console.log(`${url}: ${dimensions.width}x${dimensions.height}`);
      } catch (e) {
        console.error('Error parsing image:', e);
      }
    });
  });
}

checkImage("https://cdn.imweb.me/upload/S20220215d5bc0d1f16d2a/ca2e0ced6fe68.png");
checkImage("https://cdn.imweb.me/upload/S20220215d5bc0d1f16d2a/7c21a54f52c29.png");
