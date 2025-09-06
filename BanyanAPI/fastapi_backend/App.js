import React, { useState } from 'react';

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [searchType, setSearchType] = useState('general');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [excelResults, setExcelResults] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [extractLoading, setExtractLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  // Mock search function that simulates API responses
  const mockSearch = async (query, type) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
   
    const searchResults = {
      general: {
        ai_summary: `Based on your query "${query}", here are the key findings: This search covers general information across multiple sources and databases. The results include comprehensive data about industrial components, specifications, and related technical documentation.`,
        results: [
          {
            title: `Industrial Parts Database - ${query}`,
            snippet: `Comprehensive database containing specifications for ${query}. Includes manufacturer details, technical specifications, and compatibility information for industrial applications.`,
            url: `https://example-industrial-db.com/search?q=${encodeURIComponent(query)}`,
            source: "Industrial Parts Database",
            type: "general"
          },
          {
            title: `Technical Specifications for ${query}`,
            snippet: `Detailed technical documentation and specifications. Contains engineering drawings, material properties, and installation guidelines for optimal performance.`,
            url: `https://tech-specs.com/${query.replace(/\s+/g, '-')}`,
            source: "Technical Documentation Portal",
            type: "general"
          },
          {
            title: `Manufacturer Catalog - ${query}`,
            snippet: `Official manufacturer documentation and product catalogs. Includes pricing information, availability, and authorized distributor networks.`,
            url: `https://manufacturer-catalog.com/products/${query}`,
            source: "Manufacturer Directory",
            type: "general"
          }
        ]
      },
      trusted_site: {
        ai_summary: `Search results from trusted and verified industrial sites for "${query}". These sources have been vetted for accuracy and reliability in the industrial parts and manufacturing sector.`,
        results: [
          {
            title: `${query} - Official Engineering Standards`,
            snippet: `Official engineering standards and compliance documentation from certified sources. Includes ISO standards, safety certifications, and quality assurance protocols.`,
            url: `https://engineering-standards.org/standards/${query}`,
            source: "Engineering Standards Organization",
            type: "trusted_site"
          },
          {
            title: `Verified Supplier Database - ${query}`,
            snippet: `Verified supplier information from trusted industrial partners. Contains supplier ratings, certifications, and performance metrics for reliable sourcing.`,
            url: `https://verified-suppliers.com/search/${query}`,
            source: "Verified Supplier Network",
            type: "trusted_site"
          }
        ]
      },
      trusted_document: {
        ai_summary: `Document search results for "${query}" from verified technical documents and manuals. These documents have been authenticated and are from official sources.`,
        results: [
          {
            title: `Technical Manual - ${query}`,
            snippet: `Official technical manual and installation guide. Contains step-by-step procedures, troubleshooting guides, and maintenance schedules for optimal operation.`,
            url: `https://technical-docs.com/manuals/${query}.pdf`,
            source: "Official Technical Documentation",
            type: "trusted_document"
          },
          {
            title: `Safety Data Sheet - ${query}`,
            snippet: `Comprehensive safety data sheet with handling instructions, storage requirements, and emergency procedures. Compliant with international safety standards.`,
            url: `https://safety-docs.com/sds/${query}.pdf`,
            source: "Safety Documentation Center",
            type: "trusted_document"
          }
        ]
      }
    };

    return searchResults[type] || searchResults.general;
  };

  // Generate sample industrial parts data
  const generateSampleData = () => {
    const sampleParts = [
      {
        partnum: "B10099368",
        escn: "CYLINDER ASSEMBLY, LINEAR ACTUATING",
        entries: [
          { classtype: "BU", property: "MANUFACTURER NAME 1", value: "FESTO", manufacturer: "FESTO" },
          { classtype: "BU", property: "MANUFACTURER NUMBER 1", value: "DSBC-63-400-PPVA-N3", manufacturer: "FESTO" },
          { classtype: "BU", property: "VENDOR NAME 1", value: "APPLIED INDUSTRIAL TECHNOLOGIES", manufacturer: "FESTO" },
          { classtype: "BU", property: "STATUS (CLEANSED/ENRICHED/NEED MORE INFO)", value: "ENRICHED", manufacturer: "FESTO" },
          { classtype: "INC", property: "SERIES", value: "DSBC", manufacturer: "FESTO" },
          { classtype: "INC", property: "BORE DIAMETER", value: "63MM", manufacturer: "FESTO" },
          { classtype: "INC", property: "STROKE", value: "400MM", manufacturer: "FESTO" },
          { classtype: "INC", property: "TYPE", value: "DOUBLE ACTING", manufacturer: "FESTO" },
          { classtype: "INC", property: "OPERATING PRESSURE", value: "10 BAR MAX", manufacturer: "FESTO" }
        ]
      },
      {
        partnum: "B10054276",
        escn: "BEARING, BALL BEARING INSERT",
        entries: [
          { classtype: "BU", property: "MANUFACTURER NAME 1", value: "NTN", manufacturer: "NTN" },
          { classtype: "BU", property: "MANUFACTURER NUMBER 1", value: "UC206D1", manufacturer: "NTN" },
          { classtype: "BU", property: "VENDOR NAME 1", value: "MOTION INDUSTRIES", manufacturer: "NTN" },
          { classtype: "BU", property: "STATUS (CLEANSED/ENRICHED/NEED MORE INFO)", value: "CLEANSED", manufacturer: "NTN" },
          { classtype: "INC", property: "INSIDE DIAMETER", value: "30MM", manufacturer: "NTN" },
          { classtype: "INC", property: "OUTSIDE DIAMETER", value: "62MM", manufacturer: "NTN" },
          { classtype: "INC", property: "WIDTH", value: "16MM", manufacturer: "NTN" },
          { classtype: "INC", property: "LOAD CAPACITY", value: "9500N", manufacturer: "NTN" },
          { classtype: "INC", property: "SEAL TYPE", value: "CONTACT SEAL", manufacturer: "NTN" }
        ]
      },
      {
        partnum: "B10087432",
        escn: "SWITCH, LIMIT SWITCH ELECTRICAL",
        entries: [
          { classtype: "BU", property: "MANUFACTURER NAME 1", value: "OMRON", manufacturer: "OMRON" },
          { classtype: "BU", property: "MANUFACTURER NUMBER 1", value: "D4V-8108Z", manufacturer: "OMRON" },
          { classtype: "BU", property: "VENDOR NAME 1", value: "DIGI-KEY ELECTRONICS", manufacturer: "OMRON" },
          { classtype: "BU", property: "STATUS (CLEANSED/ENRICHED/NEED MORE INFO)", value: "ENRICHED", manufacturer: "OMRON" },
          { classtype: "INC", property: "TYPE", value: "ENCLOSED LIMIT SWITCH", manufacturer: "OMRON" },
          { classtype: "INC", property: "POTENTIAL", value: "250V AC", manufacturer: "OMRON" },
          { classtype: "INC", property: "CURRENT", value: "10A", manufacturer: "OMRON" },
          { classtype: "INC", property: "CONTACT ARRANGEMENT", value: "SPDT", manufacturer: "OMRON" },
          { classtype: "INC", property: "ACTUATOR TYPE", value: "ROLLER PLUNGER", manufacturer: "OMRON" }
        ]
      },
      {
        partnum: "B10023891",
        escn: "BRAKE CALIPER ASSEMBLY",
        entries: [
          { classtype: "BU", property: "MANUFACTURER NAME 1", value: "WABCO", manufacturer: "WABCO" },
          { classtype: "BU", property: "MANUFACTURER NUMBER 1", value: "4254210012", manufacturer: "WABCO" },
          { classtype: "BU", property: "VENDOR NAME 1", value: "BENDIX COMMERCIAL SOLUTIONS", manufacturer: "WABCO" },
          { classtype: "BU", property: "STATUS (CLEANSED/ENRICHED/NEED MORE INFO)", value: "NEED MORE INFO", manufacturer: "WABCO" },
          { classtype: "INC", property: "PISTON DIAMETER", value: "57MM", manufacturer: "WABCO" },
          { classtype: "INC", property: "MOUNTING TYPE", value: "BOLT-ON", manufacturer: "WABCO" },
          { classtype: "INC", property: "BRAKE TYPE", value: "DISC BRAKE", manufacturer: "WABCO" },
          { classtype: "INC", property: "OPERATING PRESSURE", value: "8.5 BAR", manufacturer: "WABCO" }
        ]
      },
      {
        
        partnum: "B10067354",
        escn: "CONTACT, ELECTRICAL CONTACT ASSEMBLY",
        entries: [
          { classtype: "BU", property: "MANUFACTURER NAME 1", value: "SCHNEIDER ELECTRIC", manufacturer: "SCHNEIDER ELECTRIC" },
          { classtype: "BU", property: "MANUFACTURER NUMBER 1", value: "LA1KN31", manufacturer: "SCHNEIDER ELECTRIC" },
          { classtype: "BU", property: "VENDOR NAME 1", value: "REXEL USA", manufacturer: "SCHNEIDER ELECTRIC" },
          { classtype: "BU", property: "STATUS (CLEANSED/ENRICHED/NEED MORE INFO)", value: "ENRICHED", manufacturer: "SCHNEIDER ELECTRIC" },
          { classtype: "INC", property: "CONTACT TYPE", value: "AUXILIARY CONTACT", manufacturer: "SCHNEIDER ELECTRIC" },
          { classtype: "INC", property: "POLE CONFIGURATION", value: "1NO + 1NC", manufacturer: "SCHNEIDER ELECTRIC" },
          { classtype: "INC", property: "RATED VOLTAGE", value: "690V AC", manufacturer: "SCHNEIDER ELECTRIC" },
          { classtype: "INC", property: "RATED CURRENT", value: "10A", manufacturer: "SCHNEIDER ELECTRIC" }
        ]
      }
    ];

    // Flatten the data structure
    const flatData = [];
    sampleParts.forEach(part => {
      part.entries.forEach(entry => {
        flatData.push({
          partnum: part.partnum,
          escn: part.escn,
          classtype: entry.classtype,
          property: entry.property,
          value: entry.value,
          manufacturer: entry.manufacturer
        });
      });
    });

    return flatData;
  };

  const handleDataExtraction = async () => {
    setExtractLoading(true);
    setShowTable(false);
    
    try {
      // Simulate data extraction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate sample data
      const extractedData = generateSampleData();
      
      setTableData(extractedData);
      setShowTable(true);
      
      // Save to JSON file
      saveToJSON(extractedData);
      
    } catch (error) {
      console.error('Data extraction error:', error);
      alert('Data extraction failed. Please try again.');
    } finally {
      setExtractLoading(false);
    }
  };

  const saveToJSON = (data) => {
    const jsonOutput = {
      metadata: {
        timestamp: new Date().toISOString(),
        extractionSource: 'Sample Data Generator',
        totalRecords: data.length,
        uniquePartNumbers: [...new Set(data.map(item => item.partnum))].length,
        buCount: data.filter(item => item.classtype === 'BU').length,
        incCount: data.filter(item => item.classtype === 'INC').length
      },
      extractedData: data
    };
    
    const dataStr = JSON.stringify(jsonOutput, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `extracted_parts_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSearch = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      // Use mock search instead of real API
      const searchResults = await mockSearch(prompt, searchType);
      setResults({
        search_type: searchType,
        ...searchResults
      });
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async () => {
    if (!excelFile) return;

    setExcelLoading(true);
    try {
      // Simulate Excel analysis with realistic data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis = {
        analysis: {
          total_rows: 247,
          summary: {
            bu_count: 68,
            inc_count: 179,
            unique_partnums: 23
          },
          bu_items: [
            { property: "MANUFACTURER NAME 1", value: "FESTO", classtype: "BU" },
            { property: "VENDOR NAME 1", value: "APPLIED INDUSTRIAL TECHNOLOGIES", classtype: "BU" },
            { property: "STATUS (CLEANSED/ENRICHED/NEED MORE INFO)", value: "ENRICHED", classtype: "BU" },
            { property: "MANUFACTURER NAME 1", value: "NTN", classtype: "BU" },
            { property: "VENDOR NAME 1", value: "MOTION INDUSTRIES", classtype: "BU" }
          ],
          inc_items: [
            { property: "BORE DIAMETER", value: "63MM", classtype: "INC" },
            { property: "STROKE", value: "400MM", classtype: "INC" },
            { property: "OPERATING PRESSURE", value: "10 BAR MAX", classtype: "INC" },
            { property: "INSIDE DIAMETER", value: "30MM", classtype: "INC" },
            { property: "LOAD CAPACITY", value: "9500N", classtype: "INC" }
          ]
        },
        ai_insights: `Analysis of ${excelFile.name} reveals a well-structured dataset with ${68} business unit (BU) entries and ${179} incremental (INC) technical specifications across ${23} unique part numbers. The data shows good coverage of manufacturer information with 85% of parts having complete vendor details. Technical specifications are comprehensive, particularly for hydraulic cylinders and bearing assemblies. Recommended actions: Review 12% of entries marked as "NEED MORE INFO" status for data completion.`
      };
      
      setExcelResults(mockAnalysis);
    } catch (error) {
      console.error('Excel analysis error:', error);
      alert('Excel analysis failed. Please try again.');
    } finally {
      setExcelLoading(false);
    }
  };

  const getSearchTypeIcon = (type) => {
    switch (type) {
      case 'general': return '🌐';
      case 'trusted_site': return '🛡️';
      case 'trusted_document': return '📄';
      default: return '🔍';
    }
  };

  const getSearchTypeColor = (type) => {
    switch (type) {
      case 'general': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'trusted_site': return 'bg-green-100 text-green-800 border-green-300';
      case 'trusted_document': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 relative">
        {/* Extract Data Button - Top Right Corner */}
        <button
          onClick={handleDataExtraction}
          disabled={extractLoading}
          className="fixed top-4 right-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors z-10 flex items-center"
        >
          {extractLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Extracting...
            </>
          ) : (
            <>
              <span className="mr-2">⚡</span>
              Extract Data
            </>
          )}
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🤖 AI-Powered Search & Analysis Platform
          </h1>
          <p className="text-lg text-gray-600">
            Search intelligently and analyze Excel data with mock AI insights
          </p>
          <div className="mt-2 text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-lg inline-block">
            ⚠️ Demo Mode: Using mock data and simulated responses
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Search Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🔍</span>
              Smart Search
            </h2>
            
            {/* Search Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'general', label: 'General', icon: '🌐' },
                  { value: 'trusted_site', label: 'Trusted Sites', icon: '🛡️' },
                  { value: 'trusted_document', label: 'Documents', icon: '📄' }
                ].map(({ value, label, icon }) => (
                  <button
                    key={value}
                    onClick={() => setSearchType(value)}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg border transition-all ${
                      searchType === value
                        ? getSearchTypeColor(value)
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-sm mr-1">{icon}</span>
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your search query (e.g., 'hydraulic cylinder', 'ball bearing', 'limit switch')..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading || !prompt.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <span className="mr-2">🔍</span>
                  Search
                </>
              )}
            </button>
          </div>

          {/* Excel Analysis Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">📊</span>
              Excel Analysis
            </h2>
            
            <p className="text-sm text-gray-600 mb-4">
              Upload an Excel file to simulate BU and INC classification analysis
            </p>

            {/* File Upload */}
            <div className="mb-4">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setExcelFile(e.target.files[0])}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Upload Button */}
            <button
              onClick={handleExcelUpload}
              disabled={excelLoading || !excelFile}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {excelLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <span className="mr-2">📤</span>
                  Analyze Excel
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {results && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Search Results</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSearchTypeColor(results.search_type)}`}>
                <span className="mr-1">{getSearchTypeIcon(results.search_type)}</span>
                <span>{results.search_type.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>

            {/* AI Summary */}
            {results.ai_summary && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">AI Summary</h4>
                <p className="text-blue-700 leading-relaxed">{results.ai_summary}</p>
              </div>
            )}

            {/* Search Results List */}
            <div className="space-y-4">
              {results.results?.map((result, index) => (
                <div key={index} className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-gray-800 mb-1">
                    <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                      {result.title}
                    </span>
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">{result.snippet}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Source: {result.source}</span>
                    {result.type && <span>Type: {result.type}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Excel Analysis Results */}
        {excelResults && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Excel Analysis Results</h3>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {excelResults.analysis.summary.bu_count || 0}
                </div>
                <div className="text-sm text-blue-800">BU Items</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {excelResults.analysis.summary.inc_count || 0}
                </div>
                <div className="text-sm text-green-800">INC Items</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {excelResults.analysis.total_rows}
                </div>
                <div className="text-sm text-purple-800">Total Rows</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {excelResults.analysis.summary.unique_partnums || 0}
                </div>
                <div className="text-sm text-orange-800">Unique Parts</div>
              </div>
            </div>

            {/* AI Insights */}
            {excelResults.ai_insights && (
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-800 mb-2">AI Insights</h4>
                <p className="text-green-700 leading-relaxed">{excelResults.ai_insights}</p>
              </div>
            )}

            {/* Data Sample */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {excelResults.analysis.bu_items.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">BU Items Sample</h4>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-gray-600">
                      {JSON.stringify(excelResults.analysis.bu_items.slice(0, 3), null, 2)}
                    </pre>
                  </div>
                </div> 
              )}
              
              {excelResults.analysis.inc_items.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">INC Items Sample</h4>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-gray-600">
                      {JSON.stringify(excelResults.analysis.inc_items.slice(0, 3), null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
               
        {/* Data Extraction Table */}
        {showTable && tableData.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Extracted Data Table</h3>
              <button
                onClick={() => setShowTable(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Part Number</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">ESCN</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Class Type</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Property</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Value</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Manufacturer</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">{row.partnum}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">{row.escn}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          row.classtype === 'BU' 
                            ? 'bg-blue-100 text-blue-800' 
                            : row.classtype === 'INC'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {row.classtype}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">{row.property}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">{row.value}</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">{row.manufacturer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {tableData.length} extracted records
              </div>
              <div className="text-xs text-gray-500">
                BU: {tableData.filter(item => item.classtype === 'BU').length} | 
                INC: {tableData.filter(item => item.classtype === 'INC').length} | 
                Parts: {[...new Set(tableData.map(item => item.partnum))].length}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          
        </div>
      </div>
    </div>
  );
};

export default App;
                