from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
import google.generativeai as genai
from datetime import datetime
import pandas as pd
import requests
from typing import List, Dict, Any, Optional
import re
from io import BytesIO

app = FastAPI(title="Search and Analysis API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini AI
GEMINI_API_KEY = "AIzaSyCS2rcQL7jsKst9bIx4RC7YwgF_faWj2lI"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# Data storage paths
DATA_DIR = "data"
RESULTS_FILE = os.path.join(DATA_DIR, "search_results.json")
EXCEL_RESULTS_FILE = os.path.join(DATA_DIR, "excel_analysis_results.json")
TRUSTED_SITES_FILE = os.path.join(DATA_DIR, "trusted_sites.json")
EXTRACTIONS_FILE = os.path.join(DATA_DIR, "data_extractions.json")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Initialize trusted sites
TRUSTED_SITES = [
    "stackoverflow.com",
    "github.com",
    "docs.python.org",
    "fastapi.tiangolo.com",
    "reactjs.org",
    "developer.mozilla.org",
    "w3schools.com",
    "geeksforgeeks.org"
]

class DataExtractionRequest(BaseModel):
    prompt: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "Extract industrial parts data"
            }
        }

class SearchRequest(BaseModel):
    prompt: str
    search_type: str  # "general", "trusted_site", "trusted_document"
    
    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "Python FastAPI tutorial",
                "search_type": "general"
            }
        }

class SearchResponse(BaseModel):
    query: str
    search_type: str
    results: List[Dict[str, Any]]
    ai_summary: str
    timestamp: str

class AnalysisResponse(BaseModel):
    filename: str
    analysis: Dict[str, Any]
    ai_insights: str
    timestamp: str

def save_to_json(data: Dict, filename: str):
    """Save data to JSON file"""
    try:
        if os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        else:
            existing_data = []
        
        existing_data.append(data)
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving to JSON: {e}")

def load_from_json(filename: str) -> List[Dict]:
    """Load data from JSON file"""
    try:
        if os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"Error loading from JSON: {e}")
        return []

def extract_sample_data(prompt: str) -> List[Dict[str, Any]]:
    """Extract sample data based on prompt using AI and return structured table data"""
    
    # Sample data structure based on your provided format
    sample_data = [
        {
            "partnum": "B10099368",
            "escn": "CYLINDER ASSEMBLY, LINEAR ACTUATING",
            "classtype": "BU",
            "property": "MANUFACTURER NAME 1",
            "value": "FESTO",
            "manufacturer": "FESTO INC"
        },
        {
            "partnum": "B10099368",
            "escn": "CYLINDER ASSEMBLY, LINEAR ACTUATING", 
            "classtype": "BU",
            "property": "MANUFACTURER NUMBER 1",
            "value": "1383588",
            "manufacturer": "FESTO INC"
        },
        {
            "partnum": "B10099368",
            "escn": "CYLINDER ASSEMBLY, LINEAR ACTUATING",
            "classtype": "INC", 
            "property": "BORE DIAMETER",
            "value": "63MM",
            "manufacturer": "FESTO INC"
        },
        {
            "partnum": "B10099368",
            "escn": "CYLINDER ASSEMBLY, LINEAR ACTUATING",
            "classtype": "INC",
            "property": "STROKE", 
            "value": "400MM",
            "manufacturer": "FESTO INC"
        },
        {
            "partnum": "B10054276",
            "escn": "BEARING INSERT",
            "classtype": "BU",
            "property": "MANUFACTURER NAME 1",
            "value": "NTN",
            "manufacturer": "NTN BEARING CORPORATION"
        },
        {
            "partnum": "B10054276", 
            "escn": "BEARING INSERT",
            "classtype": "INC",
            "property": "INSIDE DIAMETER",
            "value": "30MM",
            "manufacturer": "NTN BEARING CORPORATION"
        },
        {
            "partnum": "B10011511",
            "escn": "CALIPER, BRAKE",
            "classtype": "BU", 
            "property": "MANUFACTURER NAME 1",
            "value": "TOLOMATIC",
            "manufacturer": "TOLOMATIC"
        },
        {
            "partnum": "B10011511",
            "escn": "CALIPER, BRAKE",
            "classtype": "INC",
            "property": "TYPE",
            "value": "ASSEMBLY, PNEUMATIC", 
            "manufacturer": "TOLOMATIC"
        },
        {
            "partnum": "B10012022",
            "escn": "CONTACT, SET",
            "classtype": "BU",
            "property": "MANUFACTURER NAME 1", 
            "value": "SIEMENS",
            "manufacturer": "SIEMENS"
        },
        {
            "partnum": "B10012022",
            "escn": "CONTACT, SET",
            "classtype": "INC",
            "property": "STANDARDS",
            "value": "EAC, UKCA",
            "manufacturer": "SIEMENS"
        }
    ]
    
    try:
        # Use AI to generate additional relevant data based on the prompt
        ai_prompt = f"""Based on this prompt: "{prompt}"
        
        Generate 5 additional industrial parts data entries following this exact format:
        - partnum: Part number (format: B10XXXXXX where X are digits)
        - escn: Equipment classification name (e.g., VALVE, MOTOR, SENSOR, etc.)
        - classtype: Either "BU" (business unit info) or "INC" (technical specifications)
        - property: Property name (for BU: MANUFACTURER NAME 1, MANUFACTURER NUMBER 1; for INC: technical specs)
        - value: Property value
        - manufacturer: Manufacturer name
        
        Return ONLY a valid JSON array with no additional text or formatting."""
        
        response = model.generate_content(ai_prompt)
        
        # Try to parse AI response as JSON, fallback to sample data if failed
        try:
            # Clean up the response text
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]
            elif response_text.startswith('```'):
                response_text = response_text[3:-3]
            
            ai_data = json.loads(response_text)
            if isinstance(ai_data, list) and len(ai_data) > 0:
                # Validate structure and merge with sample data
                for item in ai_data[:5]:  # Take only first 5 AI generated items
                    if all(key in item for key in ["partnum", "escn", "classtype", "property", "value", "manufacturer"]):
                        sample_data.append(item)
        except Exception as parse_error:
            print(f"AI parsing failed: {parse_error}")
            pass  # Use sample data if AI parsing fails
            
    except Exception as e:
        print(f"AI generation failed: {e}")
    
    return sample_data

@app.post("/extract-data")
async def extract_data(request: DataExtractionRequest):
    """Extract and return structured data for table display"""
    try:
        if not request.prompt or request.prompt.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        
        extracted_data = extract_sample_data(request.prompt)
        
        result = {
            "prompt": request.prompt,
            "extracted_data": extracted_data,
            "total_records": len(extracted_data),
            "timestamp": datetime.now().isoformat()
        }
        
        # Save to JSON
        save_to_json(result, EXTRACTIONS_FILE)
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data extraction failed: {str(e)}")

def perform_general_search(query: str) -> List[Dict]:
    """Simulate general web search - in production, integrate with search APIs"""
    # This is a mock implementation. In production, integrate with Google Search API, Bing API, etc.
    mock_results = [
        {
            "title": f"Comprehensive Guide to {query}",
            "url": f"https://example.com/guide/{query.replace(' ', '-').lower()}",
            "snippet": f"This comprehensive guide covers everything you need to know about {query}, including best practices, examples, and implementation details.",
            "source": "General Web"
        },
        {
            "title": f"{query} - Complete Tutorial and Documentation",
            "url": f"https://tutorial-site.com/{query.replace(' ', '-').lower()}",
            "snippet": f"Step-by-step tutorial and complete documentation for {query} with practical examples and code snippets.",
            "source": "General Web"
        },
        {
            "title": f"Advanced {query} Techniques and Solutions",
            "url": f"https://advanced-tech.com/solutions/{query.replace(' ', '_').lower()}",
            "snippet": f"Explore advanced techniques and professional solutions for {query}. Learn from industry experts and real-world case studies.",
            "source": "General Web"
        }
    ]
    return mock_results

def perform_trusted_site_search(query: str) -> List[Dict]:
    """Search within trusted sites"""
    results = []
    for site in TRUSTED_SITES[:5]:  # Limit to top 5 trusted sites
        result = {
            "title": f"{query} - Official Documentation | {site.title()}",
            "url": f"https://{site}/docs/{query.replace(' ', '-').lower()}",
            "snippet": f"Official documentation and authoritative information about {query} from {site}. Trusted source with accurate and up-to-date content.",
            "source": site
        }
        results.append(result)
    return results

def perform_document_search(query: str) -> List[Dict]:
    """Search for documents (PDF, Excel, Word, Images)"""
    # Mock document search results
    document_types = [
        {"type": "PDF", "ext": "pdf", "desc": "comprehensive manual"},
        {"type": "Excel", "ext": "xlsx", "desc": "data analysis workbook"}, 
        {"type": "Word", "ext": "docx", "desc": "detailed specification document"},
        {"type": "PowerPoint", "ext": "pptx", "desc": "presentation slides"}
    ]
    results = []
    
    for doc in document_types:
        result = {
            "title": f"{query} - {doc['desc'].title()}",
            "url": f"https://docs.repository.com/{doc['type'].lower()}/{query.replace(' ', '_').lower()}.{doc['ext']}",
            "snippet": f"A {doc['type']} {doc['desc']} containing detailed information, specifications, and analysis about {query}",
            "source": "Document Repository",
            "type": doc['type']
        }
        results.append(result)
    
    return results

def get_ai_summary(query: str, results: List[Dict]) -> str:
    """Get AI summary using Gemini"""
    try:
        context = f"Query: {query}\n\nSearch Results:\n"
        for i, result in enumerate(results[:3], 1):  # Use top 3 results for context
            context += f"{i}. Title: {result['title']}\n   Summary: {result['snippet']}\n   Source: {result['source']}\n\n"
        
        prompt = f"""Based on the following search results, provide a comprehensive and informative summary about the query: "{query}"

{context}

Please provide a helpful summary that:
1. Synthesizes the key information from these sources
2. Highlights the most important points
3. Provides actionable insights if applicable
4. Maintains accuracy based on the source information

Keep the summary concise but comprehensive (2-3 paragraphs)."""
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"AI summary unavailable: {str(e)}. However, the search results above provide relevant information about {query}."

@app.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    """Handle search requests"""
    try:
        if not request.prompt or request.prompt.strip() == "":
            raise HTTPException(status_code=400, detail="Search prompt cannot be empty")
        
        if request.search_type not in ["general", "trusted_site", "trusted_document"]:
            raise HTTPException(status_code=400, detail="Invalid search type. Must be 'general', 'trusted_site', or 'trusted_document'")
        
        # Perform search based on type
        if request.search_type == "general":
            results = perform_general_search(request.prompt)
        elif request.search_type == "trusted_site":
            results = perform_trusted_site_search(request.prompt)
        elif request.search_type == "trusted_document":
            results = perform_document_search(request.prompt)
        
        # Get AI summary
        ai_summary = get_ai_summary(request.prompt, results)
        
        # Prepare response
        response_data = {
            "query": request.prompt,
            "search_type": request.search_type,
            "results": results,
            "ai_summary": ai_summary,
            "timestamp": datetime.now().isoformat()
        }
        
        # Save to JSON
        save_to_json(response_data, RESULTS_FILE)
        
        return SearchResponse(**response_data)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

def analyze_excel_for_bu_inc(df: pd.DataFrame) -> Dict[str, Any]:
    """Analyze Excel data to detect BU and INC details"""
    analysis = {
        "total_rows": len(df),
        "columns": df.columns.tolist(),
        "column_count": len(df.columns),
        "bu_items": [],
        "inc_items": [],
        "summary": {},
        "sample_data": {}
    }
    
    # Get sample data (first 5 rows)
    sample_data = df.head(5).to_dict('records') if not df.empty else []
    analysis['sample_data'] = sample_data
    
    # Look for BU and INC patterns based on the provided example
    classtype_columns = [col for col in df.columns if 'classtype' in col.lower() or 'class_type' in col.lower() or 'type' in col.lower()]
    
    if classtype_columns:
        classtype_col = classtype_columns[0]
        try:
            bu_data = df[df[classtype_col].str.upper() == 'BU'] if classtype_col in df.columns else pd.DataFrame()
            inc_data = df[df[classtype_col].str.upper() == 'INC'] if classtype_col in df.columns else pd.DataFrame()
            
            analysis['bu_items'] = bu_data.head(10).to_dict('records') if not bu_data.empty else []
            analysis['inc_items'] = inc_data.head(10).to_dict('records') if not inc_data.empty else []
            
            analysis['summary'] = {
                "bu_count": len(bu_data),
                "inc_count": len(inc_data),
                "classtype_column": classtype_col
            }
        except Exception as e:
            print(f"Error processing classtype data: {e}")
    
    # Look for common columns
    partnum_columns = [col for col in df.columns if 'part' in col.lower() and 'num' in col.lower()]
    escn_columns = [col for col in df.columns if 'escn' in col.lower() or 'description' in col.lower()]
    
    if partnum_columns:
        analysis['summary']['unique_partnums'] = df[partnum_columns[0]].nunique()
        analysis['summary']['partnum_column'] = partnum_columns[0]
    
    if escn_columns:
        analysis['summary']['unique_escns'] = df[escn_columns[0]].nunique()
        analysis['summary']['escn_column'] = escn_columns[0]
    
    # Data quality metrics
    analysis['data_quality'] = {
        "null_counts": df.isnull().sum().to_dict(),
        "duplicate_rows": df.duplicated().sum(),
        "memory_usage": str(df.memory_usage(deep=True).sum()) + " bytes"
    }
    
    return analysis

@app.post("/analyze-excel", response_model=AnalysisResponse)
async def analyze_excel(file: UploadFile = File(...)):
    """Analyze uploaded Excel file for BU and INC details"""
    try:
        # Validate file type
        if not file.filename.lower().endswith(('.xlsx', '.xls')):
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload an Excel file (.xlsx or .xls)")
        
        # Read Excel file using BytesIO to avoid the deprecation warning
        contents = await file.read()
        excel_buffer = BytesIO(contents)
        
        try:
            df = pd.read_excel(excel_buffer)
        except Exception as read_error:
            raise HTTPException(status_code=400, detail=f"Error reading Excel file: {str(read_error)}")
        
        if df.empty:
            raise HTTPException(status_code=400, detail="The Excel file appears to be empty")
        
        # Analyze the data
        analysis = analyze_excel_for_bu_inc(df)
        
        # Get AI analysis
        ai_prompt = f"""Analyze this Excel data structure and provide insights:
        
        Filename: {file.filename}
        Total rows: {analysis['total_rows']}
        Total columns: {analysis['column_count']}
        Columns: {', '.join(analysis['columns'][:10])}{'...' if len(analysis['columns']) > 10 else ''}
        
        Summary data:
        - BU items: {analysis['summary'].get('bu_count', 'Not detected')}
        - INC items: {analysis['summary'].get('inc_count', 'Not detected')}
        - Unique part numbers: {analysis['summary'].get('unique_partnums', 'Not detected')}
        - Unique ESCNs: {analysis['summary'].get('unique_escns', 'Not detected')}
        
        Please provide insights about:
        1. What this data structure represents
        2. What BU and INC classifications might mean in this context
        3. Data quality observations
        4. Potential use cases for this data
        5. Any recommendations for data processing or analysis"""
        
        try:
            ai_response = model.generate_content(ai_prompt)
            ai_analysis = ai_response.text
        except Exception as ai_error:
            ai_analysis = f"AI analysis unavailable due to: {str(ai_error)}. However, the data has been successfully processed and analyzed."
        
        result = {
            "filename": file.filename,
            "analysis": analysis,
            "ai_insights": ai_analysis,
            "timestamp": datetime.now().isoformat()
        }
        
        # Save to JSON
        save_to_json(result, EXCEL_RESULTS_FILE)
        
        return AnalysisResponse(**result)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing Excel file: {str(e)}")

@app.get("/search-history")
async def get_search_history():
    """Get search history"""
    try:
        history = load_from_json(RESULTS_FILE)
        return {
            "history": history,
            "total_searches": len(history),
            "message": "Search history retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving search history: {str(e)}")

@app.get("/excel-analysis-history")
async def get_excel_analysis_history():
    """Get Excel analysis history"""
    try:
        history = load_from_json(EXCEL_RESULTS_FILE)
        return {
            "history": history,
            "total_analyses": len(history),
            "message": "Excel analysis history retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving Excel analysis history: {str(e)}")

@app.get("/extraction-history")
async def get_extraction_history():
    """Get data extraction history"""
    try:
        history = load_from_json(EXTRACTIONS_FILE)
        return {
            "history": history,
            "total_extractions": len(history),
            "message": "Data extraction history retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving extraction history: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "message": "Search and Analysis API is running smoothly"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Search and Analysis API is running",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "search": "/search (POST)",
            "extract_data": "/extract-data (POST)", 
            "analyze_excel": "/analyze-excel (POST)",
            "search_history": "/search-history (GET)",
            "excel_history": "/excel-analysis-history (GET)",
            "extraction_history": "/extraction-history (GET)"
        }
    }

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {
        "error": "Not Found",
        "message": "The requested endpoint was not found",
        "available_endpoints": [
            "/", "/health", "/docs", "/search", "/extract-data", 
            "/analyze-excel", "/search-history", "/excel-analysis-history"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)