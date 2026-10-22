
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT id, reference, order_number, customer_name,
             item_name, quantity, reason, status, created_at
      FROM return_requests
      WHERE archived_at IS NULL
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Database error details:", {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      stack: error?.stack,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Could not fetch return requests",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const orderNumber =
    typeof body?.order_number === "string" ? body.order_number.trim() : "";
  const customerName =
    typeof body?.customer_name === "string" ? body.customer_name.trim() : "";
  const itemName =
    typeof body?.item_name === "string" ? body.item_name.trim() : "";
  const quantity = Number(body?.quantity);
  const reason = body?.reason;
  const validReasons = [
    "Damaged",
    "Wrong Item",
    "Size Issue",
    "Not As Described",
    "Changed Mind",
  ];

  if (
    !orderNumber ||
    orderNumber.length > 50 ||
    !customerName ||
    customerName.length > 100 ||
    !itemName ||
    itemName.length > 100 ||
    !Number.isInteger(quantity) ||
    quantity <= 0 ||
    !validReasons.includes(reason)
  ) {
    return NextResponse.json(
      { success: false, message: "Please enter valid request details." },
      { status: 400 }
    );
  }

  const reference = `RET-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

  try {
    const result = await pool.query(
      `INSERT INTO return_requests
        (reference, order_number, customer_name, item_name, quantity, reason)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, reference, order_number, customer_name,
                 item_name, quantity, reason, status, created_at`,
      [reference, orderNumber, customerName, itemName, quantity, reason]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST returns error:", {
      message: error?.message,
      code: error?.code,
    });

    if (error?.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          message: "A return request with this reference already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Could not create return request." },
      { status: 500 }
    );
  }
}

