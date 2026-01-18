import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const hasToken = !!process.env.UPLOADTHING_TOKEN;
    const tokenLength = process.env.UPLOADTHING_TOKEN?.length || 0;
    const tokenPrefix = process.env.UPLOADTHING_TOKEN?.substring(0, 10) || "NOT_SET";

    return NextResponse.json({
        hasUploadThingToken: hasToken,
        tokenLength: tokenLength,
        tokenPrefix: tokenPrefix + "...",
        nodeEnv: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
        timestamp: new Date().toISOString()
    });
}
