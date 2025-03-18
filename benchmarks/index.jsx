import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

const BundlingBenchmarks = () => {
  const [loadTimes, setLoadTimes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const iframeRef = useRef(null);

  const examples = [
    { name: "Webpack + React", url: "./../benchmarks/react.html", size: '40', caption:'', jsx: true, ts: true, sourceMaps: true, unbundled: false, intellisense: true },
    { name: "CDN + HTMX", url: "./../benchmarks/htmx.html", size: '20', caption:'', jsx: false, ts: false, sourceMaps: true, unbundled: true, intellisense: false },
    { name: "CDN + Preact", url: "preact.html", size: '6', caption:'', jsx: false, ts: false, sourceMaps: true, unbundled: true, intellisense: false },
    { name: "CDN + JQuery", url: "jquery.html", size: '32', caption:'', jsx: false, ts: false, sourceMaps: true, unbundled: true, intellisense: true },
    { name: "B.Acorn + Preact", url: "./../tests/acorn_preact.html", size: '40', caption:'', jsx: true, ts: false, sourceMaps: false, recommended: true, unbundled: true, intellisense: true },
    { name: "B.Meriyah + Preact", url: "./../tests/meriyah_preact.html", size: '45', caption:'', jsx: true, ts: false, sourceMaps: false, recommended: true, unbundled: true, intellisense: true },
    { name: "B.Meriyah + React", url: "./../tests/meriyah.html", size: '80', caption:'', jsx: true, ts: false, sourceMaps: false, recommended: true, unbundled: true, intellisense: true },
    { name: "B.Acorn + React", url: "./../tests/acorn.html", size: '75', caption:'Parses ECMA 2015 (ES6) and up. Used by Babel, ESLint, Prettier, Webpack, Rollup', jsx: true, ts: false, sourceMaps: false, unbundled: true, intellisense: true },
    { name: "B.Sucrase + React", url: "./../tests/sucrase.html", size: '90', caption:'Parses ECMA 2015 (ES6) and up. A simplified Babel fork.', jsx: true, ts: true, sourceMaps: true, recommended: true, unbundled: true, intellisense: true },
    { name: "B.Babel - Standalone + React", url: "./../tests/babel.html", size: '500', caption:'Parses ECMA (ES3) and up. Expansive ecosystem.', jsx: true, ts: true, sourceMaps: true, unbundled: true, intellisense: true },
  ];
  

  useEffect(() => { 

    const example = examples[currentIndex];
    const startTime = performance.now();
    
    const handleIframeLoad = () => {
      const loadTime = Math.max(0, performance.now() - startTime);
      setLoadTimes(prev => [
        ...prev, 
        { name: example.name, loadTime, size: example.size }
      ]);
      setCurrentIndex(prev => prev + 1);
    };

    if (iframeRef.current && example?.url) {
      console.log('Setting up iframe');
      console.log('iframeRef.current', iframeRef.current);
      console.log('example', example)
      iframeRef.current.onload = handleIframeLoad;
      iframeRef.current.src = example.url;
      return () => { 
          iframeRef.current.onload = null; 
      };
    }

    return () => { };
  }, [currentIndex]);
 
  // Sort and prepare results for rendering
  const sortedResults = [...loadTimes].sort((a, b) => a.loadTime - b.loadTime);
  const maxTime = sortedResults.length > 0 ? 
    sortedResults[sortedResults.length - 1].loadTime : 1000;

  return (
    <div> 
      <h1>Benchmarks</h1>  
      <p>Bundless allows web developers to transpile react code on the browser (optionally to Preact) without bundling it. Studies suggest that delays under 100ms are generally imperceptible to users.</p>
      <p>Below is the time it took your device to load a Multi-File 'Hello World' app using a variety of build approaches (Webpack, Bundless, Native) and libraries(React, Preact, HTMX).</p>
      <p>Notes: `B.Acorn + Preact` stands for "Bundless using its Acorn Parser to transpile React code for use with Preact at runtime". <br/>  
      </p>

      <table className="table">
        <thead>
          <tr>
            <th>Tool/ Library</th>
            <th>Load Time (ms)</th>
            <th>~ Size (kb)</th>
            <th>No Bundle</th>
            <th>Linter Support</th>
            <th>Source Maps</th>
            <th>JSX</th>
            <th>TS</th>
          </tr>
        </thead>
        <tbody>
          {examples.map((example, index) => {
            const result = loadTimes.find(r => r.name === example.name);
            const isLoading = !result;
            
            return (
              <tr key={example.name}>
                <td>
                  <a href={example.url} target="_blank" className="me-2 text-decoration-none">🔗</a>
                  {example.name}
                  <div className="small text-muted">{example.caption}</div>
                </td>
                <td>
                  <div className="align-items-center" style={{ flexDirection: 'column'}}>
                    {isLoading ? (
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <span className="me-2 text-nowrap" style={{width: "50px"}}>
                        {result.loadTime.toFixed(2)}
                      </span>
                    )}
                    <div className="progress w-100">
                      {!isLoading && (
                        <div 
                          className="progress-bar bg-primary" 
                          role="progressbar"
                          style={{width: `${(result.loadTime / maxTime) * 100}%`}}
                          aria-valuenow={result.loadTime}
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
                      {example.size}
                    </span>
                    <div className="progress w-100">
                      <div 
                        className="progress-bar bg-success" 
                        role="progressbar"
                        style={{width: `${(parseFloat(example.size) / 450) * 100}%`}}
                        aria-valuenow={example.size}
                        aria-valuemin="0"
                        aria-valuemax="450"
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="text-center">{example.unbundled ? '✔️' : '❌'}</td>
                <td className="text-center">{example.intellisense ? '✔️' : '❌'}</td>
                <td className="text-center">{example.sourceMaps ? '✔️' : '❌'}</td>
                <td className="text-center">{example.jsx ? '✔️' : '❌'}</td>
                <td className="text-center">{example.ts ? '✔️' : '❌'}</td>
              </tr>
            );
          })}
        </tbody> 
      </table> 
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


