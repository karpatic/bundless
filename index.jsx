import marked from 'marked';
import React from 'react';
import ReactDOM from 'react-dom';

function App(){
    let [markdown, setMarkdown] = React.useState('# Hello World');
    let [html, setHtml] = React.useState(marked(markdown));
    
    React.useEffect(() => {
        setHtml(marked(markdown));
    }, [markdown]);
    
    React.useEffect(() => {
        fetch('./README.MD')
            .then(res => res.text())
            .then(text => {
                setMarkdown(text);
            });
    }, []);

    return ( 
        <div className="container mt-5">
            <div
                dangerouslySetInnerHTML={{ __html: html }}
                className="p-3 border rounded bg-light text-dark"
                style={{ 
                    animation: 'backgroundAnimation 10s infinite', 
                    fontFamily: 'Arial, sans-serif' 
                }}
            />  
        </div>
    );

}

ReactDOM.render(<App />, document.getElementById('react-root'));

 