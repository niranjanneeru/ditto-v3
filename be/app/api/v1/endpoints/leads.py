from __future__ import annotations

from io import BytesIO
from typing import Optional, List, Tuple

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert
from openpyxl import load_workbook

from app.db.database import get_db_session
from app.db.models import Lead
from app.schemas.leads import LeadBulkInsertResponse

router = APIRouter()


def _normalize_header(s: Optional[str]) -> str:
    return (s or "").strip().lower()


def _extract_rows_from_sheet(ws) -> List[Tuple[str, str, Optional[str]]]:
    # Expect headers: Lead Name, Lead Email, Lead Mobile (case-insensitive)
    first_row = list(ws.iter_rows(min_row=1, max_row=1, values_only=True))[0]
    header_map = {}
    for idx, name in enumerate(first_row, start=1):
        header_map[_normalize_header(name)] = idx

    required = ["lead name", "lead email"]
    for r in required:
        if r not in header_map:
            raise HTTPException(status_code=400, detail=f"Missing required column: {r}")

    name_idx = header_map.get("lead name")
    email_idx = header_map.get("lead email")
    mobile_idx = header_map.get("lead mobile")

    rows: List[Tuple[str, str, Optional[str]]] = []
    for row in ws.iter_rows(min_row=2, values_only=True):
        name = (row[name_idx - 1] if name_idx else None) or ""
        email = (row[email_idx - 1] if email_idx else None) or ""
        mobile = (row[mobile_idx - 1] if mobile_idx else None) if mobile_idx else None
        if not str(name).strip() and not str(email).strip():
            # skip completely empty lines
            continue
        rows.append((str(name).strip(), str(email).strip(), str(mobile).strip() if mobile is not None else None))
    return rows


async def _bulk_insert_leads(rows: List[Tuple[str, str, Optional[str]]], db: AsyncSession) -> Tuple[int, int, int, List[str]]:
    total = len(rows)
    if total == 0:
        return 0, 0, 0, []

    payload = [
        {"name": name, "email": email, "mobile": mobile}
        for name, email, mobile in rows
        if email  # ensure email is present
    ]

    valid = len(payload)
    if valid == 0:
        return total, 0, 0, ["No valid rows with email found"]

    stmt = insert(Lead).values(payload)
    stmt = stmt.on_conflict_do_nothing(index_elements=[Lead.email]).returning(Lead.id)

    result = await db.execute(stmt)
    inserted_ids = result.fetchall()
    inserted = len(inserted_ids)
    duplicate = valid - inserted
    failed = total - valid

    return total, inserted, duplicate, []


@router.post("/bulk-insert", response_model=LeadBulkInsertResponse, status_code=status.HTTP_201_CREATED)
async def bulk_insert_leads(
    file: Optional[UploadFile] = File(None, description="Excel file to upload (.xlsx)"),
    file_path: Optional[str] = Form(None, description="Local server path to Excel file (.xlsx)"),
    db: AsyncSession = Depends(get_db_session),
):
    if not file and not file_path:
        raise HTTPException(status_code=400, detail="Either file or file_path must be provided")

    try:
        if file is not None:
            if file.filename and not file.filename.lower().endswith(".xlsx"):
                raise HTTPException(status_code=400, detail="Only .xlsx files are supported")
            content = await file.read()
            wb = load_workbook(filename=BytesIO(content), read_only=True, data_only=True)
        else:
            if not str(file_path).lower().endswith(".xlsx"):
                raise HTTPException(status_code=400, detail="Only .xlsx files are supported")
            wb = load_workbook(filename=file_path, read_only=True, data_only=True)

        ws = wb.active
        rows = _extract_rows_from_sheet(ws)
        total, inserted, duplicate, errors = await _bulk_insert_leads(rows, db)
        return LeadBulkInsertResponse(
            total_rows=total,
            inserted_count=inserted,
            duplicate_count=duplicate,
            failed_count=total - (inserted + duplicate),
            errors=errors,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process file: {e}")
