

import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const runtime = "nodejs";

// GET: Search, filter and paginate return requests
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";
    const reason = searchParams.get("reason") || "";

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 10)
    );

    const sort = searchParams.get("sort") || "created_at";
    const order =
      searchParams.get("order") === "asc" ? "ASC" : "DESC";

    const allowedSortColumns = [
      "created_at",
      "customer_name",
      "order_number",
      "status",
      "reference",
    ];

    const sortColumn = allowedSortColumns.includes(sort)
      ? sort
      : "created_at";

    const conditions = ["archived_at IS NULL"];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(
        `(reference ILIKE $${values.length}
          OR order_number ILIKE $${values.length}
          OR customer_name ILIKE $${values.length})`
      );
    }

    if (status) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    if (reason) {
      values.push(reason);
      conditions.push(`reason = $${values.length}`);
    }

    const whereClause = conditions.join(" AND ");

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM return_requests
       WHERE ${whereClause}`,
      values
    );

    const total = countResult.rows[0].total;
    const offset = (page - 1) * limit;

    const dataValues = [...values, limit, offset];

    const result = await pool.query(
      `SELECT id, reference, order_number, customer_name,
              item_name, quantity, reason, status, created_at
       FROM return_requests
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${order}
       LIMIT $${dataValues.length - 1}
       OFFSET $${dataValues.length}`,
      dataValues
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET returns error:", error);

    return NextResponse.json(
      { success: false, message: "Could not fetch return requests." },
      { status: 500 }
    );
  }
}

// POST: Create a new return request
export async function POST(request) {
  try {
    const body = await request.json();

    const order_number = body.order_number?.trim();
    const customer_name = body.customer_name?.trim();
    const item_name = body.item_name?.trim();
    const quantity = Number(body.quantity);
    const reason = body.reason;

    const allowedReasons = [
      "Damaged",
      "Wrong Item",
      "Size Issue",
      "Not As Described",
      "Changed Mind",
    ];

    if (
      !order_number ||
      !customer_name ||
      !item_name ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      !allowedReasons.includes(reason)
    ) {
      return NextResponse.json(
        { success: false, message: "Please provide valid return details." },
        { status: 400 }
      );
    }

    const reference = `RET-${Date.now()}`;

    const result = await pool.query(
      `INSERT INTO return_requests (
        reference, order_number, customer_name,
        item_name, quantity, reason, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'Open')
      RETURNING id, reference, order_number, customer_name,
                item_name, quantity, reason, status, created_at`,
      [
        reference,
        order_number,
        customer_name,
        item_name,
        quantity,
        reason,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Return request created successfully.",
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST returns error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not create return request.",
      },
      { status: 500 }
    );
  }
}
