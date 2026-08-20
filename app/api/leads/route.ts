import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { LEAD_TYPES, LeadRow, toLead } from "@/lib/leads";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Request body must be a JSON object." },
      { status: 400 }
    );
  }

  const { name, phone, source, message, leadType } = body as Record<
    string,
    unknown
  >;

  if (typeof phone !== "string" || phone.trim() === "") {
    return NextResponse.json(
      { error: "\"phone\" is required." },
      { status: 400 }
    );
  }

  if (typeof leadType !== "string" || leadType.trim() === "") {
    return NextResponse.json(
      { error: "\"leadType\" is required." },
      { status: 400 }
    );
  }

  if (!LEAD_TYPES.includes(leadType as (typeof LEAD_TYPES)[number])) {
    return NextResponse.json(
      {
        error: `"leadType" must be one of: ${LEAD_TYPES.join(", ")}.`,
      },
      { status: 400 }
    );
  }

  const db = getDb();

  const insert = db.prepare(`
    INSERT INTO leads (name, phone, source, message, lead_type, status)
    VALUES (@name, @phone, @source, @message, @leadType, 'new')
  `);

  const result = insert.run({
    name: typeof name === "string" ? name : null,
    phone,
    source: typeof source === "string" ? source : null,
    message: typeof message === "string" ? message : null,
    leadType,
  });

  const row = db
    .prepare("SELECT * FROM leads WHERE id = ?")
    .get(result.lastInsertRowid) as LeadRow;

  return NextResponse.json(toLead(row), { status: 201 });
}

export async function GET() {
  const rows = getDb()
    .prepare("SELECT * FROM leads ORDER BY created_at DESC, id DESC")
    .all() as LeadRow[];

  return NextResponse.json(rows.map(toLead));
}
