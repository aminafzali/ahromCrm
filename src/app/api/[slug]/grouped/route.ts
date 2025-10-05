import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Dynamically import the corresponding module's grouped API
    const loadedModule = await import(`@/modules/${slug}/api/grouped/route`);

    // Check if the GET handler exists
    if (loadedModule.GET) {
      return loadedModule.GET(req);
    }

    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  } catch (error) {
    console.error("Error loading grouped module:", error);
    return NextResponse.json({ error: "Invalid Module" }, { status: 404 });
  }
}
