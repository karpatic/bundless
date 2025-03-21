import React from 'react';
import ReactDOM from 'react-dom';

// import Child from './Child.jsx';
import { Child } from './nested/Nested.jsx';

console.log('wahhaa');  




function App(){
    return ( 
        <div>
            <h1>test World</h1>
            This is a baseline JSX file. Check your console. 
            Sourcemaps are enabled. Connect to a chrome devtools workspace 
            <Child text={'child text'}/>
        </div>
    );

}
ReactDOM.render(<App />, document.getElementById('react-root')); 
