import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest , { params }: { params: Promise<{ slug: string}>}) {
  try {
    const { slug } = await params;

    // Dynamically import the corresponding loadedModule
    const loadedModule = await import(`@/modules/${slug}/api/route`);

    // Check if the GET handler exists
    if (loadedModule.GET) {
      return loadedModule.GET(req);
    }

    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid Module" }, { status: 404 });
  }
}

export async function POST(req: NextRequest , { params }: { params: Promise<{ slug: string}>}) {
  try {
    const { slug } = await params;

    // Dynamically import the corresponding loadedModule
    const loadedModule = await import(`@/modules/${slug}/api/route`);

    if (loadedModule.POST) {
      return loadedModule.POST(req);
    }

    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid Module" }, { status: 404 });
  }
}
