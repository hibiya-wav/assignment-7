/*
  Daniel Santos Martinez
  UCID: ds73
  December 10, 2024
  ASSIGNMENT 7
*/

import React, {Component} from "react";
import "./SentimentSubjectivityPlot.css";
import * as d3 from "d3";

class SentimentSubjectivityPlot extends Component {
    state = {
        selectedColor: "Sentiment",
        selectedPoint: [],
    };

    componentDidMount() {
        this.chartRender();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.csv_data !== this.props.csv_data || prevState.selectedColor !== this.state.selectedColor || prevState.selectedPoint !== this.state.selectedPoint) {
            this.chartRender();
        }
    }

    // create this event which runs to update each circle point in the chart to be surrounded by the black circle
    updateCircleStroke() {
        d3.selectAll("circle")
            .attr("stroke", d => this.state.selectedPoint.some(t => t.RawTweet === d.RawTweet) ? "#000000" : "none");
    }


    // made this event which is used to load up the data from the tweets that matches with the point on the graph we click on and
    // then insert it within an array, return it for it be displayed onto the web dom.
    handlePointTweetClickEvent = (tweet) => {
        this.setState(prevState => {
            const tweetIndex = prevState.selectedPoint.findIndex(t => t.RawTweet === tweet.RawTweet);
            if (tweetIndex === -1) {
                return {selectedPoint: [tweet, ...prevState.selectedPoint]};
            } else {
                return {
                    selectedPoint: prevState.selectedPoint.filter((_, i) => i !== tweetIndex)
                };
            }
        });
    };

    // event used to change the state based on a change of the dropdown value chosen
    dropdownChangeColor = (event) => {
        this.setState({selectedColor: event.target.value});
    };

    // the rendering of the chart
    chartRender() {

        const data = this.props.csv_data;

        // if there is no data loaded, don't load anything
        if (!data || data.length <= 0) {
            return;
        }

        // dimensions
        const width = 700;
        const height = 250;
        const margin = {top: 30, right: 150, bottom: 30, left: 100};

        d3.select(".SentimentSubjectivityPlot-visualization svg").remove();

        // instantiating the svg
        const svg = d3
            .select(".SentimentSubjectivityPlot-visualization")
            .append("svg")
            .attr("width", width + margin.left + margin.right + 500)
            .attr("height", (height + margin.top + margin.bottom) * 3 - 150)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // xScale instantiation based on the 1st dimension metric
        const xScale = d3
            .scaleLinear()
            .domain(d3.extent(data, (d) => d["Dimension 1"]))
            .range([0, width - 300]);

        // Group data by month for us to then filter later between specific months (march, april, may) and the tweets
        // tweeted there just like the visualization asks for
        const groupedDatabyMonth = d3.group(data, (d) => d.Month);

        // Draw points for each month
        ["March", "April", "May"].forEach((monthValue, index) => {
            const monthDatabySpecificMonth = groupedDatabyMonth.get(monthValue) || [];

            const selectMonthVizGroup = svg.append("g")
                .attr("transform", `translate(0, ${index * (height + margin.top)})`);

            // appended text of the Months in the visualization
            selectMonthVizGroup.append("text")
                .attr("x", -50)
                .attr("y", height / 2)
                .attr("text-anchor", "end")
                .style("font-size", "16px")
                .style("font-weight", "bold")
                .text(monthValue);

            // instantiating the color Scale based on the requirements for the sentiment plot visualization
            const sentimentColorScale = d3.scaleLinear()
                .domain([-1, 0, 1])
                .range(["#e41a1c", "#ECECEC", "#4daf4a"]);

            // instantiating the color Scale based on the requirements for the subjectivity plot visualization
            const subjectivityColorScale = d3.scaleLinear()
                .domain([0, 1])
                .range(["#ECECEC", "#4467C4"]);

            // this is what does the magic here with being able to measure the correct distance scaling between the
            // points and we provide the scales within their x and y axis of each month's tweets that get displayed on
            // screen here
            const simulationForceFormat = d3.forceSimulation(monthDatabySpecificMonth)
                .force("x", d3.forceX(d => xScale(d["Dimension 1"])).strength(1))
                .force("y", d3.forceY(height / 2).strength(0.1))
                .force("collide", d3.forceCollide(5).radius(6)) // this does the correct amt of spacing to ensure they don't overlap
                .tick(100)
                .stop();

            // instantiates and creates all of the plot values along side its styling and attributes
            selectMonthVizGroup.selectAll("circle")
                .data(monthDatabySpecificMonth)
                .enter()
                .append("circle")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", 5)
                .attr("fill", d => {
                    // point fill color based on selected drop down selection
                    return this.state.selectedColor === "Sentiment" ? sentimentColorScale(d.Sentiment) : subjectivityColorScale(d.Subjectivity);
                })
                .attr("stroke-width", 2)
                .attr("transform", "translate(200,0)")
                .style("cursor", "pointer")
                .on("click", (event, d) => {
                    this.handlePointTweetClickEvent(d);
                })
            this.updateCircleStroke();
        });

        // legend bar dimensions
        const legendWidth = 30;
        const legendHeight = height * 2;
        const blockHeight = legendHeight / 20;

        const legendSVG = svg
            .append("g")
            .attr("transform", `translate(${width + 100}, ${height / 2})`);

        // // Create legend blocks
        const legendBlocks = legendSVG.selectAll("rect")
            // this data seems crazy but all it does is ensure that the legend is broken down in proportion of the blocks
            // regarding the chosen dropdown option and matches the specifications of the assignment.
            .data(d3.range(0, 20).map(i => ({
                y: i * blockHeight,
                domain: this.state.selectedColor === "Sentiment" ? [-1 + i * 0.1, -0.9 + (i * 0.1)] : [i * 0.05, (i + 1) * 0.05]
            })))
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", d => d.y)
            .attr("width", legendWidth)
            .attr("height", blockHeight)
            .style("fill", d => {
                // fills the bars/legend with the color gradient based on the dropdown selection
                // and follows the legend visualization requirements

                // [-1, 0, 1] -> sentiment
                // [0, 1] -> subjectivity
                if (this.state.selectedColor === "Sentiment") {
                    return d3.scaleLinear()
                        .domain([1, 0, -1])
                        .range(["red", "#ECECEC", "green"])((d.domain[0] + d.domain[1]) / 2);
                } else {
                    return d3.scaleLinear()
                        .domain([1, 0])
                        .range(["#ECECEC", "#4467C4"])((d.domain[0] + d.domain[1]) / 2);
                }
            });

        // legend text rendering based on the selected dropdown selection. since they are different from oen another
        if (this.state.selectedColor === 'Sentiment') {
            // positive txt
            legendSVG
                .append("text")
                .attr("transform", `translate(${legendWidth + 40}, ${10})`)
                .style("text-anchor", "middle")
                .style("font-size", "14px")
                .style("font-weight", "bold")
                .text("Positive");

            // negative txt
            legendSVG
                .append("text")
                .attr("transform", `translate(${legendWidth + 40}, ${legendHeight})`)
                .style("text-anchor", "middle")
                .style("font-size", "14px")
                .style("font-weight", "bold")
                .text("Negative");
        } else {
            // subjective txt
            legendSVG
                .append("text")
                .attr("transform", `translate(${legendWidth + 40}, ${10})`)
                .style("text-anchor", "middle")
                .style("font-size", "14px")
                .style("font-weight", "bold")
                .text("Subjective");

            // Objective txt
            legendSVG
                .append("text")
                .attr("transform", `translate(${legendWidth + 40}, ${legendHeight})`)
                .style("text-anchor", "middle")
                .style("font-size", "14px")
                .style("font-weight", "bold")
                .text("Objective");
        }
    }

    render() {
        const selectedPlot = ["Sentiment", "Subjectivity"];

        return (<div className="SentimentSubjectivityPlot">
            <div className="color-dropdown">
                <span>
                    <strong>Color By: </strong>
                </span>
                <select
                    value={this.state.selectedColor}
                    onChange={this.dropdownChangeColor}
                >
                    {selectedPlot.map((selectedPlot) => (<option key={selectedPlot} value={selectedPlot}>
                        {selectedPlot}
                    </option>))}
                </select>
            </div>
            <div className="SentimentSubjectivityPlot-visualization"></div>
            <div className="tweet-text-data">
                {this.state.selectedPoint.map((tweet, index) => (<div key={index} className="tweetText">
                    {tweet.RawTweet}
                </div>))}
            </div>
        </div>);
    }
}

export default SentimentSubjectivityPlot;
