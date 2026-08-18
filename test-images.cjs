const http = require('http');

const images = [
  '/images/products/blessed_model.jpg',
  '/images/products/blessed_flat.jpg',
  '/images/products/thorn_model.jpg',
  '/images/products/thorn_flat.jpg',
  '/images/products/starboy_front.jpg',
  '/images/products/starboy_back.jpg',
  '/images/products/spiderman_black.jpg',
  '/images/products/spiderman_cream.jpg',
  '/images/products/trust_eye.jpg',
  '/images/products/phantom_front.jpg'
];

async function checkImage(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      resolve({ path, statusCode: res.statusCode, contentType: res.headers['content-type'] });
    }).on('error', (err) => resolve({ path, error: err.message }));
  });
}

async function run() {
  let hasError = false;
  for (const img of images) {
    const res = await checkImage(img);
    if (res.statusCode !== 200) {
      console.error(`ERROR: ${img} returned ${res.statusCode}`);
      hasError = true;
    } else {
      console.log(`OK: ${img} (Content-Type: ${res.contentType})`);
    }
  }
  process.exit(hasError ? 1 : 0);
}

run();
