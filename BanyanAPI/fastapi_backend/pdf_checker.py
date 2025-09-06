# Simple PDF Checker: Verify at least 3 data matches

import PyPDF2
from io import BytesIO
from fastapi import UploadFile, File, HTTPException
from datetime import datetime

def check_pdf_data_matches(pdf_content: bytes, data_to_check: list) -> dict:
    """
    Check if uploaded PDF contains at least 3 pieces of your data
    Returns: match count and validation result
    """
    # Read PDF text
    pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_content))
    pdf_text = ""
    for page in pdf_reader.pages:
        pdf_text += page.extract_text().upper()
    
    matches_found = 0
    matched_values = []
    
    # Check each piece of data
    for data_item in data_to_check:
        data_value = str(data_item).upper().strip()
        if data_value in pdf_text:
            matches_found += 1
            matched_values.append(data_item)
    
    return {
        "matches_found": matches_found,
        "is_correct": matches_found >= 3,
        "matched_values": matched_values,
        "message": f"Found {matches_found} matches. {'PDF is correct!' if matches_found >= 3 else 'PDF is incorrect - need at least 3 matches.'}"
    }

@app.post("/check-pdf") # type: ignore
async def check_pdf_correctness(file: UploadFile = File(...)):
    """
    Upload PDF and check if it contains at least 3 matching data points
    """
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Please upload a PDF file")
    
    # Read PDF
    pdf_content = await file.read()
    
    # Data you expect to find in the PDF (replace with your actual data)
    expected_data = [
        "B10099368",           # Part number
        "FESTO",               # Manufacturer
        "CYLINDER ASSEMBLY",   # Description
        "63MM",                # Specification
        "B10054276",           # Another part number
        "NTN",                 # Another manufacturer
        "BEARING INSERT",      # Another description
        "30MM"                 # Another specification
    ]
    
    # Check status 
    result = check_pdf_data_matches(pdf_content, expected_data)
    
    return {
        "filename": file.filename,
        "check_result": result,
        "expected_data": expected_data,
        "timestamp": datetime.now().isoformat()
    }
