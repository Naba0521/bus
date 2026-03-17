import { NextRequest, NextResponse } from "next/server";

const USCC_BASE = "http://app.uscc.mn";

export async function GET(request: NextRequest) {
  const busroute_id = request.nextUrl.searchParams.get("busroute_id");
  if (!busroute_id) {
    return NextResponse.json(
      { error: "busroute_id required" },
      { status: 400 }
    );
  }
  try {
    const res = await fetch(
      `${USCC_BASE}/uscc/ubbus/busmap/bus_list.json?busroute_id=${encodeURIComponent(busroute_id)}`
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("bus-locations api error:", e);
    return NextResponse.json(
      { error: "Failed to fetch bus locations" },
      { status: 502 }
    );
  }
}
