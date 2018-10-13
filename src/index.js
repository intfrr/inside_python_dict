import Bootstrap from 'bootstrap/dist/css/bootstrap.min.css';
import indexCss from './index.css';

import * as React from 'react';
import ReactDOM from 'react-dom';

import {Chapter1_SimplifiedHash} from './chapter1_simplified_hash.js';
import {Chapter2_HashTableFunctions} from './chapter2_hash_table_functions.js';
import {Chapter3_HashClass} from './chapter3_hash_class.js';
import {Chapter4_RealPythonDict} from './chapter4_real_python_dict.js';

import ReactCSSTransitionReplace from 'react-css-transition-replace';
import {MyErrorBoundary, initUxSettings} from './util';

function logViewportStats() {
    console.log('window: ' + window.innerWidth + 'x' + window.innerHeight);
    console.log(
        'document.documentElement: ' +
            document.documentElement.clientWidth +
            'x' +
            document.documentElement.clientHeight
    );
}

class CrossFade extends React.Component {
    render() {
        return (
            <ReactCSSTransitionReplace
                transitionName="cross-fade"
                transitionEnterTimeout={350}
                transitionLeaveTimeout={350}
            >
                {this.props.children}
            </ReactCSSTransitionReplace>
        );
    }
}

function GithubForkMe() {
    return (
        <a href="https://github.com/eleweek/inside_python_dict">
            <img
                style={{position: 'absolute', top: 0, right: 0, border: 0}}
                src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png"
                alt="Fork me on GitHub"
            />
        </a>
    );
}

export class App extends React.Component {
    constructor() {
        super();
        if (global.window) {
            this.state = {
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
            };
        } else {
            this.state = {
                windowWidth: null,
                windowHeight: null,
            };
        }
    }

    windowSizeChangeHandle = () => {
        console.log('App size changed');
        logViewportStats();
        console.log(this.state);
        if (this.state.windowWidth != window.innerWidth || this.state.windowHeight != window.innerHeight) {
            this.setState({
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
            });
            this.forceUpdate();
            fixStickyResize();
        }
    };

    componentDidMount() {
        window.addEventListener('resize', this.windowSizeChangeHandle);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.windowSizeChangeHandle);
    }

    render() {
        const {windowWidth, windowHeight} = this.state;
        return (
            <div className="app-container container-fluid">
                <GithubForkMe />

                <h1> Inside python dict &mdash; an explorable explanation</h1>
                <MyErrorBoundary>
                    <Chapter1_SimplifiedHash windowWidth={windowWidth} windowHeight={windowHeight} />
                </MyErrorBoundary>
                <MyErrorBoundary>
                    <Chapter2_HashTableFunctions windowWidth={windowWidth} windowHeight={windowHeight} />
                </MyErrorBoundary>
                <MyErrorBoundary>
                    <Chapter3_HashClass windowWidth={windowWidth} windowHeight={windowHeight} />
                </MyErrorBoundary>
                <MyErrorBoundary>
                    <Chapter4_RealPythonDict windowWidth={windowWidth} windowHeight={windowHeight} />
                </MyErrorBoundary>
            </div>
        );
    }
}

function fixSticky() {
    // Nudges react-stickynode just a little bit
    window.requestAnimationFrame(() => {
        window.scrollBy(0, -1);
        window.requestAnimationFrame(() => {
            window.scrollBy(0, 1);
        });
    });
}

function fixStickyResize() {
    // Generates a fake resize event that react-stickynode seems to listen to
    setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
}

if (typeof window !== 'undefined') {
    initUxSettings();

    document.addEventListener('DOMContentLoaded', () => {
        logViewportStats();
        const root = document.getElementById('root');
        const isSSR = root.hasChildNodes();

        if (isSSR) {
            ReactDOM.hydrate(<App />, root);
        } else {
            ReactDOM.render(<App />, root);
        }
        // Seems to fix stickynode not stickying on page reload
        fixSticky();
    });
}
