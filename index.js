const express = require("express");
const cors = require('cors'); // Add this line
const path = require("path");
const app = express();
const router = express.Router();
app.use(express.json()); 

app.use(cors()); // Add this line

app.use(router);

var options = {
  dotfiles: "ignore",
  etag: false,
  extensions: ["htm", "html", "css", "js", "ico", "jpg", "jpeg", "png", "svg"],
  index: ["index.html"],
  maxAge: "1m",
  redirect: false,
};
app.use(express.static("public", options));

// About page route.

const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const BUCKET_NAME = "raednusairat";

const REGION = "eu-north-1";

const ACCESS_KEY_ID = "AKIA3FLD6BREV3OZTGDC";

const SECRET_ACCESS_KEY = "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";

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY
  }
});

router.post("/presigned", async (req, res) => {
    const file_name = req.body.name
    const file_type = req.body.type
    const { url, fields } = await createPresignedPost(s3, {
        Bucket: BUCKET_NAME,
        Key: `uploads/${file_name}`,
        Fields : {
            'Content-Type': file_type
        }
    });

  return res.json({
    url,
    fields,
  }); 
}); 

router.post("/download", async (req, res) => {
    let key = req.body.Key
    let download_url = await getSignedUrl(s3, new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
    })) 
    console.log(download_url)
    return res.send({download_url});
});

router.post("/delete", async (req, res) => {
    let key = req.body.Key
    let result = await s3.send(new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
    })) 
    return res.send({result});
});

router.get("/list_uploads", async (req, res) => {
    let bucket_data = await s3.send(new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: 'uploads'
    }));
    let bucket_contents = bucket_data.Contents || []

    return res.json(bucket_contents);
});

router.get("/list_uploads/presigned", async (req, res) => {
    let bucket_data = await s3.send(new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: 'uploads'
    }));

    let bucket_contents = bucket_data.Contents || []
    bucket_contents = await Promise.all(bucket_contents.map(async f=>{
        f.presigned_url = await getSignedUrl(s3, new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: f.Key,
        })) 
        return f
    }))

    bucket_contents = bucket_contents.sort((a,b) => b.LastModified - a.LastModified);


    return res.json(bucket_contents);
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
