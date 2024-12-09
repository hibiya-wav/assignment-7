/*
  Daniel Santos Martinez
  UCID: ds73
  December 10, 2024
  ASSIGNMENT 7
*/

import React, {Component} from 'react';
import './App.css';
import FileUpload from "./FileUpload";
import SentimentSubjectivityPlot from './SentimentSubjectivityPlot';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
        };
    }

    set_data = (csv_data) => {
        this.setState({data: csv_data});
    };

    render() {
        return (
            <div>
                <FileUpload set_data={this.set_data}></FileUpload>
                <div className="parent">
                    <SentimentSubjectivityPlot csv_data={this.state.data}></SentimentSubjectivityPlot>
                </div>
            </div>
        );
    }
}

export default App;
