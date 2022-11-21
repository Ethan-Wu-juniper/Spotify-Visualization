import { getElementSize, nonNumeric_col, float_col, clearWindow } from "../utils.js";
import { renderTrackList } from "./track_list.js";

const spiderChart = (selection, track_data, track_results) => {
  const height = 780;
  const width = 1500;

  const svg = selection.selectAll('.svg-plot').data([null]);
  const svgEnter = svg.enter().append('svg')
  .merge(svg)
    .attr('class', 'svg-plot')
    .attr('height', height)
    .attr('width', width);

  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;

  const InnerG = svg.merge(svgEnter)
    .selectAll('.InnerPlot').data([null]);
  const InnerPlot = InnerG.enter().append('g')
    .merge(InnerG)
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('class', 'InnerPlot');

  let center = { "x": innerWidth/2, "y": innerHeight/2 };
  const text_offset = 70;

  const ArtistNameEl = d3.select('#artist-name');
  const circle_margin = {top: 40, down: 40};
  // const circle_offset = +ArtistNameEl.attr('y') + +ArtistNameEl.style('font-size').replace("px", "");
  const circle_offset = 0;
  let radialScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, (innerHeight - d3.sum(Object.values(circle_margin))- circle_offset)/2]);
  let ticks = [0.2, 0.4, 0.6, 0.8, 1]

  const CircleG = InnerG.merge(InnerPlot)
    .selectAll(".spider-circle").data(ticks);
  CircleG.enter().append('circle')
  .merge(CircleG)
    .attr('cx', center.x)
    .attr('cy', center.y+circle_offset)
    .attr('fill', 'none')
    .attr('stroke', 'gray')
    .attr('r', d => radialScale(d));

  function angleToCoordinate(angle, value) {
    let x = Math.cos(angle) * radialScale(value);
    let y = Math.sin(angle) * radialScale(value);
    return { "x": center.x + x, "y": center.y - y };
  }

  function angleToTextCoordinate(angle, value) {
    let x = Math.cos(angle) * radialScale(value);
    let y = Math.sin(angle) * radialScale(value);
    if (x <= 0) {
      x -= radialScale(0.25);
    }
    return { "x": center.x + x, "y": center.y - y };
  }

  let features = Object.keys(track_data).slice(1).filter(d => !nonNumeric_col.includes(d));

  for (let i = 0; i < features.length; i++) {
    let ft_name = features[i];
    let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
    let line_coordinate = angleToCoordinate(angle, 1);
    let label_coordinate = angleToTextCoordinate(angle, 1.05);

    const AxisG = InnerG.merge(InnerPlot)
      .selectAll(`#axis${i}`).data([null]);
    AxisG.enter().append('line')
    .merge(AxisG)
      .attr('id', `axis${i}`)
      .attr("x1", center.x)
      .attr("y1", center.y)
      .attr("x2", line_coordinate.x)
      .attr("y2", line_coordinate.y)
      .attr("stroke", "black");

    const LabelG = InnerG.merge(InnerPlot)
      .selectAll(`#label${i}`).data([null]);
    LabelG.enter().append('text')
    .merge(LabelG)
      .attr('id', `label${i}`)
      .attr("x", label_coordinate.x)
      .attr("y", label_coordinate.y)
      .attr("font-size", 20)
      .text(ft_name);
  }

  let line = d3.line()
    .x(d => d.x)
    .y(d => d.y);


  function getPathCoordinates(data_point) {
    let outRagngeFt = {
      "popularity": [0, 100],
      "duration_ms": [0, 5300000],
      "loudness": [-50, 5],
      "tempo": [0, 244]
    }
    const getFtScale = (name) => {
      return d3.scaleLinear()
        .domain(outRagngeFt[name])
        .range([0,1]);
    }
    let coordinates = [];
    for (let i = 0; i < features.length; i++) {
      let ft_name = features[i];
      let value = data_point[ft_name];
      if(Object.keys(outRagngeFt).includes(ft_name)) {
        value = getFtScale(ft_name)(value);
      }
      let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
      coordinates.push(angleToCoordinate(angle, value));
    }
    return coordinates;
  }
  let coordinates = getPathCoordinates(track_data);
  coordinates.push(coordinates[0]);

  let centerCoor = []
  for (let i = 0; i < features.length + 1; i++) {
    centerCoor.push({x: center.x, y: center.y})
  }

  const PathG = InnerG.merge(InnerPlot)
    .selectAll('path').data([coordinates]);
  PathG.enter().append("path")
    .attr("d", d => line(centerCoor))
    .attr("stroke-width", 3)
    .attr("stroke", "#0000FF")
    .attr("fill", "#3333AA")
    .attr("stroke-opacity", 1)
    .attr("opacity", 0.5)
  .merge(PathG)
  .transition()
  .ease(d3.easeLinear)
  .duration(700)
    .attr("d", d => line(d))
    .attr("stroke-width", 3)
    .attr("stroke", "#0000FF")
    .attr("fill", "#3333AA")
    .attr("stroke-opacity", 1)
    .attr("opacity", 0.5);

  const cur_idx = track_results.findIndex(d => d == track_data);
  console.log('cur_idx', cur_idx);

  const renderNeighbor = (prev) => {
    let next_idx
    if(prev)
      next_idx = cur_idx - 1;
    else
      next_idx = cur_idx + 1;

    d3.select("#plot").selectAll('div').remove();
    chart_data.spider_data.track_id = track_results[next_idx][""];
    chart_data.spider_data.tracklist_data.page = Math.ceil((next_idx+1)/10);
    console.log("passed page", chart_data.spider_data.tracklist_data.page);
    renderSpider(chart_data.spider_data);
  }

  const arrowOnclick = (prev) => (el) => {
    el.on("mouseover", function(_, d) {
      d3.select(this).attr('fill', 'blue');
      document.body.style.cursor = "pointer";
    })
    .on("mouseout", function(_, d) {
      d3.select(this).attr('fill', 'black');
      document.body.style.cursor = "default";
    })
    .on("click", function(_, d) {
      renderNeighbor(prev);
    })
  }

  if(cur_idx != 0) {  
    const PrevG = svg.merge(svgEnter)
      .selectAll('.Prev-group').data([null]);
    const Prev = PrevG.enter().append('g')
      .merge(PrevG)
      .attr('width', 30)
      .attr('transform', `translate(30, ${center.y})`)
      .attr('class', 'Prev-group');

    const PrevText = PrevG.merge(Prev)
      .selectAll('#prev-text').data([null]);
    PrevText.enter().append('text')
    .merge(PrevText)
      .attr('id', 'prev-text')
      .attr('font-size', '25px')
      .call(arrowOnclick(true))
      .text('Previous');
    
    const arrow = d3.line()
      .x(d => d[0])
      .y(d => d[1]);
    const PrevArrow = PrevG.merge(Prev)
      .selectAll('#prev-arrow').data([null]);
    PrevArrow.enter().append('path')
    .merge(PrevArrow)
      .attr('d', () => arrow([[100,20],[0,20],[10,30]]))
      .attr('fill', 'none')
      .attr('stroke', 'black')
  }
  else {
    document.body.style.cursor = "default";
    d3.selectAll('.Prev-group').remove();
  }


  if(cur_idx != track_results.length-1) {  
    const NextG = svg.merge(svgEnter)
      .selectAll('.Next-group').data([null]);
    const Next = NextG.enter().append('g')
      .merge(NextG)
      .attr('width', 30)
      .attr('transform', `translate(${width-170}, ${center.y})`)
      .attr('class', 'Next-group');

    const NextText = NextG.merge(Next)
      .selectAll('#next-text').data([null]);
    NextText.enter().append('text')
    .merge(NextText)
      .attr('id', 'next-text')
      .attr('font-size', '25px')
      .call(arrowOnclick(false))
      .text('Next');
    
    const arrow = d3.line()
      .x(d => d[0])
      .y(d => d[1]);
    const NextArrow = NextG.merge(Next)
      .selectAll('#next-arrow').data([null]);
    NextArrow.enter().append('path')
    .merge(NextArrow)
      .attr('d', () => arrow([[0,20],[100,20],[90,30]]))
      .attr('fill', 'none')
      .attr('stroke', 'black')
  }
  else {
    document.body.style.cursor = "default";
    d3.selectAll('.Next-group').remove();
  }
}

const PlotTitle = (selection, track_data, tracklist_data) => {
  const TitleConfig = (size, offset, link) => (el) => {
    if(size != null) {
      el.attr("text-anchor", "middle")
      .style("font-size", `${size}px`)
    }
    if(offset != null) {
      el.style("position", "relative")
      .style('left', `${offset}px`)
    }
    if(link != null) {
      el.attr('href', link);
    }
  }

  const Title1Div = selection.append('div')
    .attr('id', 'title1');
  Title1Div.append("a")
    .call(TitleConfig(35, null, null))
    .text(track_data.track_name);

  // TitleDiv.append("a")
  // .call(TitleConfig(35, 10, null))
  //   .text("(" + track_data.album_name + ")");

  const Title2Div = selection.append('div')
    .attr('id', 'title2');
  Title2Div.append("label")
    .call(TitleConfig(25, null, null))
    .text(" by ");

  Title2Div.append("a")
    .call(TitleConfig(25, null, null))
    .text(track_data.artists);

  const ButtonDiv = selection.append('div')
    .style('position', 'fixed')
    .style('bottom', '0')
    .style('right', '0')
    .attr('id', 'button2');
  ButtonDiv.append('button')
    .attr('class', 'btn btn-secondary')
    .attr('id', 'back-to-list')
    .attr('style', 'position: relative; right: 200px; bottom: 10px; font-size: 1.5rem;')
    .on('click', function() {
      clearWindow()
      renderTrackList(tracklist_data);
    })
    .text('Back to list');
}

export const renderSpider = (props) => {
  const {
    selection,
    data,
    track_id,
    tracklist_data,
    track_results
  } = props;

  console.log('page', tracklist_data.page);

  if (chart_data.spider_data != props) {
    chart_data.spider_data = props;
  }
  d3.select('#plot').style('overflow-y', null);
  let track_data = data.filter(d => d[""] == track_id)[0];
  spiderChart(selection, track_data, track_results);
  PlotTitle(selection, track_data, tracklist_data);
}