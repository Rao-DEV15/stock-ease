// app/api/delete-image/route.js

import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { public_id } = body;

    console.log('🔍 Received public_id:', public_id);

    if (!public_id) {
      return NextResponse.json({ success: false, error: 'Missing public_id' }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(public_id);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('🔥 Cloudinary delete error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
