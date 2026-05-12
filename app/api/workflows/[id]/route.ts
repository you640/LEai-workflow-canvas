import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

function asRows(result: unknown): Record<string, unknown>[] {
  return Array.isArray(result) ? (result as Record<string, unknown>[]) : [];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getDb();
    const workflowsRaw = await sql`
      SELECT * FROM workflows WHERE id = ${id}
    `;
    const workflows = asRows(workflowsRaw);

    if (workflows.length === 0) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json({ workflow: workflows[0] });
  } catch (error) {
    console.error("Error fetching workflow:", error);
    return NextResponse.json({ error: "Failed to fetch workflow" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, description, nodes, edges } = await request.json();

    const sql = getDb();
    const resultRaw = await sql`
      UPDATE workflows
      SET 
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        nodes = COALESCE(${JSON.stringify(nodes)}, nodes),
        edges = COALESCE(${JSON.stringify(edges)}, edges),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, name, description, created_at, updated_at
    `;
    const result = asRows(resultRaw);

    if (result.length === 0) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json({ workflow: result[0] });
  } catch (error) {
    console.error("Error updating workflow:", error);
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getDb();
    await sql`DELETE FROM workflows WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workflow:", error);
    return NextResponse.json({ error: "Failed to delete workflow" }, { status: 500 });
  }
}
