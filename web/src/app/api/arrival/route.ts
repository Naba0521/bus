import { NextRequest, NextResponse } from "next/server";

const USCC_BASE = "http://app.uscc.mn";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const busstop_id = searchParams.get("busstop_id");
  const yyyymm = searchParams.get("yyyymm");
  const today = searchParams.get("today");

  if (!busstop_id || !yyyymm || !today) {
    return NextResponse.json(
      { error: "busstop_id, yyyymm, today required" },
      { status: 400 }
    );
  }

  try {
    const url = `${USCC_BASE}/uscc/ubbus/busmap/search_busroutebus_list.json?busstop_id=${encodeURIComponent(busstop_id)}&yyyymm=${yyyymm}&today=${today}`;
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("arrival api error:", e);
    return NextResponse.json(
      { error: "Failed to fetch arrival info" },
      { status: 502 }
    );
  }
}
