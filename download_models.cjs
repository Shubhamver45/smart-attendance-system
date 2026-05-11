const fs = require('fs');
const https = require('https');
const path = require('path');

const modelsDir = path.join(__dirname, 'public', 'models');
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

// Using a more reliable source for face-api models
const baseUrl = 'https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/models/';
const files = [
    'ssd_mobilenet_v1_model-weights_manifest.json',
    'ssd_mobilenet_v1_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1'
];

const downloadFile = (file) => {
    return new Promise((resolve, reject) => {
        const dest = path.join(modelsDir, file);
        if (fs.existsSync(dest)) {
            console.log(`Already exists: ${file}`);
            return resolve();
        }
        console.log(`Downloading ${file}...`);
        const fileStream = fs.createWriteStream(dest);
        https.get(baseUrl + file, (response) => {
            if (response.statusCode === 200) {
                response.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve();
                });
            } else {
                fileStream.close();
                fs.unlink(dest, () => {});
                reject(`Failed to download ${file}, status: ${response.statusCode}`);
            }
        }).on('error', (err) => {
            fileStream.close();
            fs.unlink(dest, () => {});
            reject(err.message);
        });
    });
};

const run = async () => {
    for (const file of files) {
        try {
            await downloadFile(file);
        } catch (err) {
            console.error(err);
        }
    }
    console.log('✅ All models downloaded.');
};

run();
