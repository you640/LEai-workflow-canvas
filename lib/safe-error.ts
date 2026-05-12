import { NextResponse } from "next/server";

export function safeError(status: number, errorCode: string, message: string) {
  return NextResponse.json(
    {
      errorCode,
      message,
      status,
    },
    { status }
  );
}
