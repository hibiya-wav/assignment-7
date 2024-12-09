/*
  Daniel Santos Martinez
  UCID: ds73
  December 10, 2024
  ASSIGNMENT 7
*/

import React, {Component} from "react";

class FileUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
            jsonData: null,
        };
    }

    handleFileSubmit = (event) => {
        event.preventDefault();
        const {file} = this.state;

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    // done to parse the JSON data and only get the first 300 tweets in the data
                    const json = JSON.parse(text).slice(0, 300);
                    this.setState({jsonData: json});
                    this.props.set_data(json);
                    // console.log(json); // debuggin
                } catch (error) {
                    console.error("Error parsing JSON:", error); // debuggin
                }
            };
            reader.readAsText(file);
        }
    };

    render() {
        return (
            <div style={{backgroundColor: "#f0f0f0", padding: 20}}>
                <h2>Upload a JSON File</h2>
                <form onSubmit={this.handleFileSubmit}>
                    <input
                        type="file"
                        accept=".json" // accepts json files only for uploading, no csv like before
                        onChange={(event) =>
                            this.setState({file: event.target.files[0]})
                        }
                    />
                    <button type="submit">Upload</button>
                </form>
            </div>
        );
    }
}

export default FileUpload;
