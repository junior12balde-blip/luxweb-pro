import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { isValidClientSlug } from "@/lib/clientSite";

const CLIENTS_DIR = path.join(process.cwd(), "clients");

const MIME_TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

/**
 * Serves files straight out of clients/<slug>/images/ — keeps client assets
 * living in one place (their own folder) instead of requiring a copy step
 * into public/ for every new client.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ client: string; path: string[] }> }
) {
  const { client, path: pathSegments } = await params;

  if (!isValidClientSlug(client)) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (pathSegments.some((segment) => segment.includes("..") || segment.includes("/"))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const imagesRoot = path.join(CLIENTS_DIR, client, "images");
  const filePath = path.join(imagesRoot, ...pathSegments);

  if (!filePath.startsWith(imagesRoot) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";
  const file = fs.readFileSync(filePath);

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
