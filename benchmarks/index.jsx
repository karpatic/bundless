import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';


const BundlingBenchmarks = () => {
  const [loadTimes, setLoadTimes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const iframeRef = useRef(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  // Add sort state variables
  const [sortField, setSortField] = useState('loadTime');
  const [sortDirection, setSortDirection] = useState('asc');

  const examples = [
    { name: "HTML Inline", url: "./html.html", size: '1', caption:'', jsx: false, ts: false },
    { name: "Script Inline ", url: "./vanilla.html", size: '1', caption:'', jsx: false, ts: false },
    { name: "Script Src ", url: "./vanilla_src.html", size: '1', caption:'', jsx: false, ts: false },
    { name: "Module Inline", url: "./module.html", size: '1', caption:'', jsx: false, ts: false },
    { name: "Module Src", url: "./module_src.html", size: '1', caption:'', jsx: false, ts: false },
    { name: "Module Import", url: "./module_import.html", size: '1', caption:'', jsx: false, ts: false },
    
    { name: "Webpack + React", url: "./react.html", size: '40', caption:'Bundled with Babel', jsx: true, ts: true, highlight: '#f8f9fa' },
    { name: "Vite + React", url: "./vite.html", size: '46', caption:'Bundled with ESBuild', jsx: true, ts: true },

    { name: "CDN + HTMX", url: "./../benchmarks/htmx.html", size: '20', caption:'', jsx: false, ts: false },    
    { name: "CDN + Preact", url: "preact.html", size: '6', caption:'', jsx: false, ts: false, highlight: '#f8f9fa' },
    { name: "CDN + JQuery", url: "jquery.html", size: '32', caption:'', jsx: false, ts: false },
    { name: "CDN + React", url: "babel.html", size: '500', caption:'Using Babel-Standalone', jsx: false, ts: false },

    { name: "B.Acorn + Preact", url: "./../examples/acorn_preact.html", size: '40', caption:'', jsx: true, ts: false, recommended: true, highlight: '#fffbea' },
    { name: "B.Meriyah + Preact", url: "./../examples/meriyah_preact.html", size: '45', caption:'', jsx: true, ts: false, recommended: true },
    { name: "B.Babel + React", url: "./../examples/babel.html", size: '500', caption:'Parses ECMA (ES3) and up. Expansive ecosystem.', jsx: true, ts: true },
    { name: "B.Meriyah + React", url: "./../examples/meriyah.html", size: '80', caption:'', jsx: true, ts: false, recommended: true }, 
    { name: "B.Acorn + React", url: "./../examples/acorn.html", size: '75', caption:'Parses ECMA 2015 (ES6) and up. Used by Babel, ESLint, Prettier, Webpack, Rollup', jsx: true, ts: false },
    { name: "B.Sucrase + React", url: "./../examples/sucrase.html", size: '90', caption:'Parses ECMA 2015 (ES6) and up. A simplified Babel fork.', jsx: true, ts: true, recommended: true }, 
    { name: "B.Sucrase + Preact", url: "./../examples/sucrase_preact.html", size: '50', caption:'Parses ECMA 2015 (ES6) and up. A simplified Babel fork.', jsx: true, ts: true, recommended: true, highlight: '#fffbea' }, 
  ];

  useEffect(() => {  

    const example = examples[currentIndex]; 
    const startTime = performance.now();
    
    const handleIframeLoad = () => {
      console.log('Iframe loaded:', example.name);
      const loadTime = Math.max(0, performance.now() - startTime);
      setLoadTimes(prev => [
        ...prev, 
        { name: example.name, loadTime, size: example.size }
      ]);
      setCurrentIndex(prev => prev + 1);
    };
 
    if (iframeRef.current && example?.url) { 
      iframeRef.current.onload = handleIframeLoad;
      iframeRef.current.src = example.url;
      return () => { 
          iframeRef.current.onload = null; 
      };
    }

    return () => { };
  }, [currentIndex]);
  
  // Fetch HTML content from URL 
  // Handle chain icon click
  const handleChainClick = async (e, url) => {
    e.preventDefault();
    setSelectedUrl(url);
    setPopupOpen(true);
    console.log('Fetching HTML:', url);
    const response = await fetch(url);
    const html = await response.text();
    console.log('Fetched HTML:', html);
    setHtmlContent(html);
  };
  
  // Add sort handler function
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field again
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
 
  // Sort and prepare results for rendering
  const sortedResults = [...loadTimes].sort((a, b) => a.loadTime - b.loadTime);
  const maxTime = sortedResults.length > 0 ? 
    sortedResults[sortedResults.length - 1].loadTime : 1000;

  // Prepare data for the table with sorting
  const tableData = useMemo(() => {
    const data = examples.map(example => {
      const result = loadTimes.find(r => r.name === example.name);
      return {
        ...example,
        loadTime: result ? result.loadTime : null
      };
    });
    
    // Apply sorting based on current sortField and sortDirection
    return [...data].sort((a, b) => {
      // Handle null values (always put them at the end)
      if (a[sortField] === null) return 1;
      if (b[sortField] === null) return -1;
       
      let comparison;
      
      // Handle different data types appropriately
      if (typeof a[sortField] === 'boolean') {
        // Sort booleans (true first for ascending)
        comparison = a[sortField] === b[sortField] ? 0 : a[sortField] ? -1 : 1;
      } else if (sortField === 'size') {
        // Handle size specifically as it's stored as a string but represents a number
        comparison = parseFloat(a[sortField]) - parseFloat(b[sortField]);
      } else if (typeof a[sortField] === 'number') {
        // Sort numbers
        comparison = a[sortField] - b[sortField];
      } else {
        // Sort strings
        comparison = String(a[sortField]).localeCompare(String(b[sortField]));
      }
      
      // Apply sort direction
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [examples, loadTimes, sortField, sortDirection]);
 

  return (
    <div> 
      <div style={{ marginBottom: '20px' }}>
      <a href="https://bundless.dev" className="text-decoration-none">← Back to Home</a>
      <a href="https://bundless.dev/examples/playground.html" className="text-decoration-none">← Try it out</a>
      <a href="https://bundless.dev/examples/index.html" className="text-decoration-none">← Examples</a>
      </div>
      <h1>Bundless Benchmarks</h1>  
      <p>Below is the time it took your device to load a 'Hello World' app using a variety of build tools and libraries.</p> 
      <p>For Reference: "<b style={{display:'inline'}}>B.Acorn + Preact</b>" stands for "Bundless.Acorn (transpiling React code for use) with Preact ". <br/>  
      </p> 
      
      {/* DataTable implementation */}
      <table id="myTable" className="table">
        <thead>
          <tr>
            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
              Build Method {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
            </th>
            <th onClick={() => handleSort('loadTime')} style={{ cursor: 'pointer' }}>
              Load Time (ms) {sortField === 'loadTime' && (sortDirection === 'asc' ? '▲' : '▼')}
            </th>
            <th onClick={() => handleSort('size')} style={{ cursor: 'pointer' }}>
              ~ Size (kb) {sortField === 'size' && (sortDirection === 'asc' ? '▲' : '▼')}
            </th>
            <th onClick={() => handleSort('jsx')} style={{ cursor: 'pointer' }}>
              JSX {sortField === 'jsx' && (sortDirection === 'asc' ? '▲' : '▼')}
            </th>
            <th onClick={() => handleSort('ts')} style={{ cursor: 'pointer' }}>
              TS {sortField === 'ts' && (sortDirection === 'asc' ? '▲' : '▼')}
            </th>
            <th>More Information</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((item, index) => (
            <tr 
              key={index} 
              style={item.highlight ? { backgroundColor: item.highlight } : {}}
            >
              <td>
                {item.name}
                <div className="small text-muted">{item.caption}</div>
              </td>
              <td>
                <div className="align-items-center" style={{ flexDirection: 'column'}}>
                  {!item.loadTime ? (
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <span className="me-2 text-nowrap" style={{width: "50px"}}>
                      {item.loadTime.toFixed(2)}
                    </span>
                  )}
                  <div className="progress w-100">
                    {item.loadTime && (
                      <div 
                        className="progress-bar bg-primary" 
                        role="progressbar"
                        style={{width: `${(item.loadTime / maxTime) * 100}%`}}
                        aria-valuenow={item.loadTime}
                        aria-valuemin="0"
                        aria-valuemax={maxTime}
                      ></div>
                    )}
                  </div>
                </div>
              </td>
              <td>
                <div className="d-flex align-items-center" style={{ flexDirection: 'column'}}>
                  <span className="me-2 text-nowrap" style={{width: "30px"}}>
                    {item.size}
                  </span>
                  <div className="progress w-100">
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar"
                      style={{width: `${(parseFloat(item.size) / 100) * 100}%`}}
                      aria-valuenow={item.size}
                      aria-valuemin="0"
                      aria-valuemax="200"
                    ></div>
                  </div>
                </div>
              </td>
              <td className="text-center">{item.jsx ? '✔️' : '❌'}</td>
              <td className="text-center">{item.ts ? '✔️' : '❌'}</td>
              <td className="text-center">
                <a href="#" onClick={(e) => handleChainClick(e, item.url)} className="text-decoration-none">Show</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* HTML Preview Popup */}
      {popupOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }} 
          onClick={() => setPopupOpen(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '5px',
              width: '80%',
              height: '80%',
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3>Preview: {selectedUrl.split('/').pop().replace('.html','')}</h3>
              <div>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setPopupOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              border: '1px solid #ddd',
              padding: '10px',
              backgroundColor: '#f8f9fa'
            }}>
              <pre style={{whiteSpace: 'pre-wrap'}}>{htmlContent}</pre>
            </div>
            <div style={{
              marginTop: '15px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button 
                className="btn btn-primary" 
                onClick={() => window.open(selectedUrl, '_blank')}
              >
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
      )}
      
      <iframe 
        ref={iframeRef}
        id="benchmark-frame"
        style={{ display: 'none' }} // Hide the iframe
      />
    </div>
  );
};

const rootElement = document.getElementById('react-root');  
ReactDOM.render(<BundlingBenchmarks />, rootElement);


