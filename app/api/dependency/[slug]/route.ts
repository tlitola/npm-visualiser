import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET(_request: any, { params }: { params: { slug: string } }) {
  return NextResponse.json({ foo: params.slug });
}
