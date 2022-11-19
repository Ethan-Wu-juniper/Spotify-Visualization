import { getElementSize } from "../utils";

const spiderChart = (selection, track_data) => {
  const { width, height } = getElementSize(selection.attr('id'));
  console.log(width, height);

  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;

  const InnerG = selection.selectAll('.InnerPlot').data([null]);
  const InnerPlot = InnerG.enter().append('g')
    .merge(InnerG)
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('class', 'InnerPlot');

  let center = { "x": innerWidth/2, "y": innerHeight/2 };
  const test_offset = 20;

  const SongTitle = InnerG.merge(InnerPlot)
    .selectAll("#song-name").data([null]);
  SongTitle.enter().append("text")
  .merge(SongTitle)
    .attr('id', 'song-name')
    .attr("x", center.x)
    .attr("y", test_offset / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text(track_data.track_name + " (" + track_data.album_name + ")");


  const ArtistName = InnerG.merge(InnerPlot)
    .selectAll("#artist-name").data([null]);
  ArtistName.enter().append("text")
  .merge(ArtistName)
    .attr('id', 'artist-name')
    .attr("x", center.x)
    .attr("y", test_offset / 2 + 20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text(track_data.artists);

  const circle_margin = {top: 50, down: 10};
  console.log(innerHeight - d3.sum(Object.values(circle_margin)));
  let radialScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, innerHeight - d3.sum(Object.values(circle_margin))]);
  let ticks = [0.2, 0.4, 0.6, 0.8, 1]

  // ticks.forEach(t =>
  //   svg.append("circle")
  //     .attr("cx", center.x)
  //     .attr("cy", center.y)
  //     .attr("fill", "none")
  //     .attr("stroke", "gray")
  //     .attr("r", radialScale(t))
  // );

  const CircleG = InnerG.merge(InnerPlot)
    .selectAll(".spider-circle").data(ticks);
  CircleG.enter().append('circle')
  .merge(CircleG)
    .attr('cx', center.x)
    .attr('cy', center.y)
    .attr('fill', 'none')
    .attr('stroke', 'gray')
    .attr('r', d => radialScale(d)/2);

  return;


  function angleToCoordinate(angle, value) {
    let x = Math.cos(angle) * radialScale(value);
    let y = Math.sin(angle) * radialScale(value);
    return { "x": center.x + x, "y": center.y - y };
  }

  function angleToTextCoordinate(angle, value) {
    let x = Math.cos(angle) * radialScale(value);
    let y = Math.sin(angle) * radialScale(value);
    if (x < 0) {
      x -= radialScale(0.15);
    }
    return { "x": center.x + x, "y": center.y - y };
  }

  for (var i = 0; i < features.length; i++) {
    let ft_name = features[i];
    let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
    let line_coordinate = angleToCoordinate(angle, 1);
    let label_coordinate = angleToTextCoordinate(angle, 1.1);

    //draw axis line
    svg.append("line")
      .attr("x1", center.x)
      .attr("y1", center.y)
      .attr("x2", line_coordinate.x)
      .attr("y2", line_coordinate.y)
      .attr("stroke", "black");

    //draw axis label
    svg.append("text")
      .attr("x", label_coordinate.x)
      .attr("y", label_coordinate.y)
      .attr("font-size", 10)
      .text(ft_name);
  }

  let line = d3.line()
    .x(d => d.x)
    .y(d => d.y);


  function getPathCoordinates(data_point) {
    let coordinates = [];
    for (var i = 0; i < features.length; i++) {
      let ft_name = features[i];
      let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
      coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
    }
    return coordinates;
  }


  let coordinates = getPathCoordinates(trackData[song]);

  coordinates.push(coordinates[0]);

  //draw the path element
  svg.append("path")
    .datum(coordinates)
    .transition()
    .ease(d3.easeLinear)
    .duration(200)
    .attr("d", line)
    .attr("stroke-width", 3)
    .attr("stroke", "#0000FF")
    .attr("fill", "#3333AA")
    .attr("stroke-opacity", 1)
    .attr("opacity", 0.5);

  return svg.node();
}

export const renderSpider = (props) => {
  const {
    selection,
    data,
    track_name
  } = props;

  if (chart_data.spider_data != props) {
    chart_data.spider_data = props;
  }
  let track_data = data.filter(d => d.track_name == track_name);
  if(track_data.length > 1) {
    track_data = track_data[0];
  }
  console.log(track_data);
  spiderChart(selection, track_data);
}