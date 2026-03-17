import { NextRequest, NextResponse } from "next/server";

const USCC_BASE = "http://app.uscc.mn";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const yyyymm = searchParams.get("yyyymm");
  const today = searchParams.get("today");

  if (!yyyymm || !today) {
    return NextResponse.json(
      { error: "yyyymm and today required (YYYYMM, YYYYMMDD)" },
      { status: 400 }
    );
  }

  try {
    const url = `${USCC_BASE}/uscc/ubbus/busmap/busstop_list.json?yyyymm=${yyyymm}&today=${today}`;
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("bus-stops api error:", e);
    return NextResponse.json(
      { error: "Failed to fetch bus stops" },
      { status: 502 }
    );
  }
}
