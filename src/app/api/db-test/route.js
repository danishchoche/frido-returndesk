
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT NOW() AS time");

    return NextResponse.json({
      success: true,
      message: "PostgreSQL connected successfully!",
      time: result.rows[0].time,
    });
  } catch (error) {
    console.error("Database error:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
      },
      { status: 500 }
    );
  }
}
