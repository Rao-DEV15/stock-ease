// api/delete-image.js

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


export default async function handler(req, res) {
  if (req.method === "POST") {
    const { public_id } = req.body;

    try {
      const result = await cloudinary.uploader.destroy(public_id);
      return res.status(200).json({ success: true, result });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
