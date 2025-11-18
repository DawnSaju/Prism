import { Client, Users } from "node-appwrite";
import { NextRequest, NextResponse } from "next/server";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
  .setKey(process.env.APPWRITE_API_KEY || "");

const users = new Users(client);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is important" }, { status: 400 });
    }

    const user = await users.get(userId);

    const hasLabel = user.labels.some((label: string) =>
      ["free", "pro", "enterprise", "admin"].includes(label)
    );

    if (!hasLabel) {
      await users.updateLabels(userId, [...user.labels, "free"]);
      return NextResponse.json({ success: true, message: "Free label assigned" });
    }

    return NextResponse.json({ success: true, message: "User already has a plan label" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to assign label" },
      { status: 500 }
    );
  }
}
