// services/s3service.js
const AWS = require('aws-sdk');
const dotenv = require("dotenv");
dotenv.config();

const uploadToS3 = (data, filename, mimetype) => {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

    console.log("Bucket Name:", BUCKET_NAME); //check env
    console.log("IAM Key:", IAM_USER_KEY ? "Loaded" : "Missing");
    
    const s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
        region: 'ap-south-2' // Ensure this matches your bucket's region
    });

    const params = {
        Bucket: BUCKET_NAME,
        // Best Practice: Use a folder to separate chat media from CSVs
        Key: `chat-media/${Date.now()}_${filename}`, 
        Body: data,
        ContentType: mimetype, // Dynamic mimetype (image/png, video/mp4, etc.)
        ACL: 'public-read'     // Allows the chat room to view the file URL
    };

    return new Promise((resolve, reject) => {
        s3bucket.upload(params, (err, s3response) => {
            if (err) {
                console.log('S3 Upload Error:', err);
                reject(err);
            } else {
                console.log("S3 Success:", s3response.Location);
                resolve(s3response.Location);
            }
        });
    });
}

module.exports = { uploadToS3 };