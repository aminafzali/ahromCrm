import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest , { params }: { params: Promise<{ id: number , slug: string}>}) {
  try {
    const { id , slug } = await params;
    // Dynamically import the corresponding loadedModule
    const loadedModule = await import(`@/modules/${slug}/api/id/route`);

    // Check if the GET handler exists
    if (loadedModule.GET) {
      return loadedModule.GET(req , id);
    }

    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid Module" }, { status: 404 });
  }
}
export async function POST(req: NextRequest , { params }: { params: Promise<{ id: number , slug: string}>}) {
  try {
    const { id , slug } = await params;
    // Dynamically import the corresponding loadedModule
    const loadedModule = await import(`@/modules/${slug}/api/id/route`);

    // Check if the GET handler exists
    if (loadedModule.POST) {
      return loadedModule.POST(req , id);
    }

    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid Module" }, { status: 404 });
  }
}




export async function PATCH(req: NextRequest , { params }: { params: Promise<{ id: number , slug: string}>}) {
  try {
    const { id , slug } = await params;
    // Dynamically import the corresponding loadedModule
    const loadedModule = await import(`@/modules/${slug}/api/id/route`);

    if (loadedModule.PATCH) {
      return loadedModule.PATCH(req, id);
    }

    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid Module" }, { status: 404 });
  }
}



export async function PUT(req: NextRequest , { params }: { params: Promise<{ id: number , slug: string}>}) {
  try {
    const { id , slug } = await params;
    // Dynamically import the corresponding loadedModule
    const loadedModule = await import(`@/modules/${slug}/api/id/route`);

    if (loadedModule.PUT) {
      return loadedModule.PUT(req, id);
    }

    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid Module" }, { status: 404 });
  }
}



export async function DELETE(req: NextRequest , { params }: { params: Promise<{ id: number , slug: string}>}) {
  try {
    const { id , slug } = await params;
    // Dynamically import the corresponding loadedModule
    const loadedModule = await import(`@/modules/${slug}/api/id/route`);

    if (loadedModule.DELETE) {
      return loadedModule.DELETE(req, id);
    }

    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid Module" }, { status: 404 });
  }
}
