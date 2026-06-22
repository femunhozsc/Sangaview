import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DB_DIR = path.join(process.cwd(), "db_data");

async function ensureDir() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
  } catch {}
}

async function readCollectionFile(name: string): Promise<{ data: any[]; initialized: boolean }> {
  await ensureDir();
  const filePath = path.join(DB_DIR, `${name}.json`);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return { data: JSON.parse(content), initialized: true };
  } catch {
    return { data: [], initialized: false };
  }
}

async function writeCollectionFile(name: string, data: any[]) {
  await ensureDir();
  const filePath = path.join(DB_DIR, `${name}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const collectionName = searchParams.get("collection");

  if (!collectionName) {
    return NextResponse.json({ error: "Collection parameter required" }, { status: 400 });
  }

  const result = await readCollectionFile(collectionName);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const collectionName = searchParams.get("collection");

  if (!collectionName) {
    return NextResponse.json({ error: "Collection parameter required" }, { status: 400 });
  }

  try {
    const body = await request.json();

    // Caso de inicialização da coleção com os dados mockados padrão
    if (body && Array.isArray(body.initData)) {
      await writeCollectionFile(collectionName, body.initData);
      return NextResponse.json({ success: true, count: body.initData.length });
    }

    // Inserção normal de um único documento
    const { data } = await readCollectionFile(collectionName);
    
    const newDoc = {
      id: body.id || Math.floor(100000 + Math.random() * 900000).toString(),
      ...body,
      createdAt: body.createdAt || new Date().toISOString()
    };

    const updatedData = [newDoc, ...data];
    await writeCollectionFile(collectionName, updatedData);

    return NextResponse.json(newDoc);
  } catch (error) {
    console.error("Erro no POST /api/data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const collectionName = searchParams.get("collection");

  if (!collectionName) {
    return NextResponse.json({ error: "Collection parameter required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { id, fields } = body;

    if (!id || !fields) {
      return NextResponse.json({ error: "ID and fields parameters required" }, { status: 400 });
    }

    const { data, initialized } = await readCollectionFile(collectionName);
    
    if (!initialized) {
      return NextResponse.json({ error: "Collection not initialized" }, { status: 404 });
    }

    const updatedData = data.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...fields
        };
      }
      return item;
    });

    await writeCollectionFile(collectionName, updatedData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no PUT /api/data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const collectionName = searchParams.get("collection");
  const id = searchParams.get("id");

  if (!collectionName || !id) {
    return NextResponse.json({ error: "Collection and ID parameters required" }, { status: 400 });
  }

  try {
    const { data, initialized } = await readCollectionFile(collectionName);

    if (!initialized) {
      return NextResponse.json({ error: "Collection not initialized" }, { status: 404 });
    }

    const updatedData = data.filter(item => item.id !== id);
    await writeCollectionFile(collectionName, updatedData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no DELETE /api/data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
