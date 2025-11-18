import { NextRequest, NextResponse } from "next/server";
import { Client, Storage } from "node-appwrite";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is important" },
        { status: 400 }
      );
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
      .setKey(process.env.APPWRITE_API_KEY || "");

    const storage = new Storage(client);
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "";

    const fileContent = await storage.getFileDownload(bucketId, fileId);

    const textContent = Buffer.from(fileContent).toString("utf-8");

    return new NextResponse(textContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch file content" },
      { status: 500 }
    );
  }
}
