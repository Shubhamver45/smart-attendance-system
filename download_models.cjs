const fs = require('fs');
const https = require('https');
const path = require('path');

const modelsDir = path.join(__dirname, 'public', 'models');
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

// Using the original face-api.js weights repository
const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const files = [
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
    'ssd_mobilenetv1_model-shard2',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2'
];

const downloadFile = (file) => {
    return new Promise((resolve, reject) => {
        const dest = path.join(modelsDir, file);
        
        // If file exists and is not empty, skip
        if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
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
                    console.log(`✅ Downloaded ${file}`);
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
    console.log('🚀 Checking models...');
    for (const file of files) {
        try {
            await downloadFile(file);
        } catch (err) {
            console.error(`❌ ${err}`);
        }
    }
    console.log('\n✨ Done. Refresh your browser now.');
};

run();
