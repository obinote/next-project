import db from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
// import fs from "fs/promises";

export async function GET(
  req: NextRequest,
  {
    params: { downloadVerificationId },
  }: { params: { downloadVerificationId: string } }
) {
  const data = await db.downloadVerification.findUnique({
    where: { id: downloadVerificationId, expiresAt: { gt: new Date() } },
    select: { product: { select: { filePath: true, name: true } } },
  });

  if (data == null) {
    return NextResponse.redirect(
      new URL("/products/download/expired", req.url)
    );
  }
  // return console.log(data.product.filePath);

  // const { size } = await fs.stat(data.product.filePath);
  // const file = await fs.readFile(data.product.filePath);
  // const extension = data.product.filePath.split(".").pop();
  
  const response = await fetch(data.product.filePath);
  const extension = data.product.filePath.split(".").pop();
  
  if (!response.ok) {
    throw new Error('Failed to fetch image');
  }
  const imageData = await response.blob();

  // return NextResponse(imageData, )
  return new NextResponse(imageData, {
    headers: {
      "Content-Disposition": `attachment; filename="${data.product.name}.${extension}"`,
      // "Content-Length": size.toString(),
      // 'Content-Type': response.headers.get('Content-Type'),
    },
  });
}
