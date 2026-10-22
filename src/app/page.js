
"use client";

import { useCallback, useEffect, useState } from "react";

const reasons = [
  "Damaged",
  "Wrong Item",
  "Size Issue",
  "Not As Described",
  "Changed Mind",
];

const statuses = [
  "Open",
  "In Review",
  "Approved",
  "Rejected",
  "Completed",
];

export default function Home() {
  const [returns, setReturns] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const [form, setForm] = useState({
    order_number: "",
    customer_name: "",
    item_name: "",
    quantity: "1",
    reason: "Damaged",
  });

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        search,
        status,
        reason,
        page: String(page),
        limit: "10",
      });

      const response = await fetch(
        `/api/returns?${params.toString()}`
      );
const responseText = await response.text();

let result;

try {
  result = JSON.parse(responseText);
} catch {
  throw new Error(
    `API returned an invalid or empty response (HTTP ${response.status}). Check your API route.`
  );
}
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Could not load return requests."
        );
      }

      const rows = Array.isArray(result.data) ? result.data : [];
      setReturns(rows);

      const total = Number(
        result.pagination?.total ?? rows.length
      );

      setPagination({
        total,
        totalPages: Number(
          result.pagination?.totalPages ??
            (total > 0 ? Math.ceil(total / 10) : 0)
        ),
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setReturns([]);
      setPagination({ total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [search, status, reason, page]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function updateForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleCreateRequest(event) {
    event.preventDefault();
    setSaving(true);
    setFormMessage("");

    try {
      const response = await fetch("/api/returns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
        }),
      });

   const responseText = await response.text();

let result;

try {
  result = JSON.parse(responseText);
} catch {
  throw new Error(
    `API returned an empty or invalid response. HTTP status: ${response.status}`
  );
}

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Could not create return request."
        );
      }

      setFormMessage("Return request created successfully!");

      setForm({
        order_number: "",
        customer_name: "",
        item_name: "",
        quantity: "1",
        reason: "Damaged",
      });

      setShowForm(false);
      setSearch("");
      setStatus("");
      setReason("");
      setPage(1);

      // Refresh the list after creating the request.
      // The filter state changes above will also trigger a refresh.
      await fetchReturns();
    } catch (err) {
      setFormMessage(
        err.message || "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 sm:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Page heading */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">ReturnDesk</h1>
            <p className="mt-2 text-gray-600">
              Manage and track customer return requests.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm((previous) => !previous);
              setFormMessage("");
            }}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ New Return Request"}
          </button>
        </header>

        {/* Create request form */}
        {showForm && (
          <section className="mb-6 rounded-xl bg-white p-5 shadow">
            <h2 className="mb-4 text-xl font-semibold">
              Create Return Request
            </h2>

            <form
              onSubmit={handleCreateRequest}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Order Number
                </label>
                <input
                  required
                  maxLength={100}
                  value={form.order_number}
                  onChange={(event) =>
                    updateForm("order_number", event.target.value)
                  }
                  placeholder="ORD-1002"
                  className="w-full rounded-lg border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Customer Name
                </label>
                <input
                  required
                  maxLength={150}
                  value={form.customer_name}
                  onChange={(event) =>
                    updateForm("customer_name", event.target.value)
                  }
                  placeholder="Customer name"
                  className="w-full rounded-lg border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Item Name
                </label>
                <input
                  required
                  maxLength={200}
                  value={form.item_name}
                  onChange={(event) =>
                    updateForm("item_name", event.target.value)
                  }
                  placeholder="Office Chair"
                  className="w-full rounded-lg border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Quantity
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={form.quantity}
                  onChange={(event) =>
                    updateForm("quantity", event.target.value)
                  }
                  className="w-full rounded-lg border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Return Reason
                </label>
                <select
                  required
                  value={form.reason}
                  onChange={(event) =>
                    updateForm("reason", event.target.value)
                  }
                  className="w-full rounded-lg border bg-white p-2"
                >
                  {reasons.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-green-600 px-4 py-2 font-medium text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Create Request"}
                </button>
              </div>
            </form>

            {formMessage && (
              <p
                role="status"
                className="mt-4 text-sm"
              >
                {formMessage}
              </p>
            )}
          </section>
        )}

        {!showForm && formMessage && (
          <p role="status" className="mb-4 text-sm text-green-700">
            {formMessage}
          </p>
        )}

        {/* Search and filters */}
        <section className="mb-6 grid gap-4 rounded-xl bg-white p-4 shadow sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Search
            </label>
            <input
              type="search"
              value={search}
              onChange={(event) =>
                changeFilter(setSearch, event.target.value)
              }
              placeholder="Customer, order or reference"
              className="w-full rounded-lg border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Filter by Status
            </label>
            <select
              value={status}
              onChange={(event) =>
                changeFilter(setStatus, event.target.value)
              }
              className="w-full rounded-lg border bg-white p-2"
            >
              <option value="">All statuses</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Filter by Reason
            </label>
            <select
              value={reason}
              onChange={(event) =>
                changeFilter(setReason, event.target.value)
              }
              className="w-full rounded-lg border bg-white p-2"
            >
              <option value="">All reasons</option>
              {reasons.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Requests list */}
        <section className="overflow-hidden rounded-xl bg-white shadow">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
            <h2 className="text-xl font-semibold">
              Return Requests
            </h2>
            <span className="text-sm text-gray-600">
              Total: {pagination.total}
            </span>
          </div>

          {loading && (
            <p className="p-8 text-center text-gray-600">
              Loading requests...
            </p>
          )}

          {!loading && error && (
            <div className="p-6 text-center">
              <p className="text-red-600">{error}</p>
              <button
                type="button"
                onClick={fetchReturns}
                className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-white"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="whitespace-nowrap p-3">Reference</th>
                      <th className="whitespace-nowrap p-3">Order</th>
                      <th className="whitespace-nowrap p-3">Customer</th>
                      <th className="whitespace-nowrap p-3">Item</th>
                      <th className="p-3">Qty</th>
                      <th className="whitespace-nowrap p-3">Reason</th>
                      <th className="whitespace-nowrap p-3">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {returns.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap p-3 font-medium">
                          {item.reference}
                        </td>
                        <td className="whitespace-nowrap p-3">
                          {item.order_number}
                        </td>
                        <td className="whitespace-nowrap p-3">
                          {item.customer_name}
                        </td>
                        <td className="p-3">{item.item_name}</td>
                        <td className="p-3">{item.quantity}</td>
                        <td className="whitespace-nowrap p-3">
                          {item.reason}
                        </td>
                        <td className="whitespace-nowrap p-3">
                          <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {returns.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-8 text-center text-gray-500"
                        >
                          No return requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
                <p className="text-sm text-gray-600">
                  Page {page} of {pagination.totalPages || 1}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() =>
                      setPage((current) => current - 1)
                    }
                    className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={
                      page >= (pagination.totalPages || 1) || loading
                    }
                    onClick={() =>
                      setPage((current) => current + 1)
                    }
                    className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

