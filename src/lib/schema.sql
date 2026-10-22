
CREATE TABLE IF NOT EXISTS return_requests (
    id SERIAL PRIMARY KEY,
    reference VARCHAR(20) UNIQUE NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason VARCHAR(30) NOT NULL CHECK (
        reason IN (
            'Damaged',
            'Wrong Item',
            'Size Issue',
            'Not As Described',
            'Changed Mind'
        )
    ),
    status VARCHAR(20) NOT NULL DEFAULT 'Open'
        CHECK (status IN (
            'Open',
            'In Review',
            'Approved',
            'Completed',
            'Rejected'
        )),
    resolution VARCHAR(20)
        CHECK (resolution IN ('Refund', 'Replacement', 'Store Credit')),
    refund_amount NUMERIC(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS return_notes (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL
        REFERENCES return_requests(id),
    note TEXT NOT NULL CHECK (LENGTH(TRIM(note)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_returns_status
    ON return_requests(status);

CREATE INDEX IF NOT EXISTS idx_returns_reason
    ON return_requests(reason);
