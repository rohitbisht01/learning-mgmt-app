import { env } from "@/lib/env";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { S3 } from "@/lib/s3-client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import arcjet from "@/lib/arcjet";
import { detectBot, fixedWindow } from "@arcjet/next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const fileUploadSchema = z.object({
  fileName: z.string().min(1, { message: "File name is required" }),
  contentType: z.string().min(1, { message: "Content Type is required" }),
  size: z.number().min(1, { message: "Size is required" }),
  isImage: z.boolean(),
});

const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    })
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5,
    })
  );

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  try {
    const decision = await aj.protect(request, {
      fingerprint: session?.user.id as string,
    });

    if (decision.isDenied()) {
      return NextResponse.json({ error: "Not Good" }, { status: 429 });
    }

    const body = await request.json();
    const validation = fileUploadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
        },
        {
          status: 400,
        }
      );
    }

    const { fileName, contentType, size } = validation.data;
    const uniqueKey = `${uuidv4()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      ContentType: contentType,
      ContentLength: size,
      Key: uniqueKey,
    });

    const presignedUrl = await getSignedUrl(S3, command, {
      expiresIn: 360,
    });

    const response = {
      presignedUrl,
      key: uniqueKey,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      {
        error: "Failed to generate presigned URL",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  try {
    const decision = await aj.protect(request, {
      fingerprint: session?.user.id as string,
    });

    if (decision.isDenied()) {
      return NextResponse.json({ error: "Not Good" }, { status: 429 });
    }

    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        {
          error: "Missing or invalid key",
        },
        { status: 400 }
      );
    }

    const command = new DeleteObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: key,
    });

    await S3.send(command);
    return NextResponse.json(
      {
        message: "File deleted successfully",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Missing or invalid key" },
      { status: 500 }
    );
  }
}
