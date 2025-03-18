import React from 'react';
import ReactDOM from 'react-dom';
 

console.log('wahhaa'); 

function App(){
    return ( 
        <div>
            <h1>Hello World</h1>
            This is a baseline JSX file. Check your console.
            Sourcemaps are enabled. Connect to a chrome devtools workspace
        </div>
    );

}
ReactDOM.render(<App />, document.getElementById('react-root'));

intentionalError;