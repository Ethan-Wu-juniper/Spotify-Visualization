import { DefaultDict, dropdownMenu, plot_types } from './utils.js'
import { renderScatter } from './scatter.js'
import { renderLineChart } from './linechart.js'
import { renderRidgeline } from './ridgeline.js'

let data;
let columns;
let Label = "id";
let plot_type = "ridgeline";
const plot = d3.select('.svg-plot');

const get_id = () => {
  let input = document.getElementById("id").value;
  console.log(input);
  out = data.filter((d) => {
    return d.artists.toLowerCase()
      .includes(input.toLowerCase())
  })
  console.log(out);
}

const onColumnClicked = column => {
  plot_type = column;
  // const innerPlot = d3.select(".InnerPlot");
  // innerPlot.selectAll("path").remove();
  // plot.selectAll("*").remove();
  d3.select("#plot").selectAll("div").remove();
  render();
};

const render = () => {

  d3.select('#column')
    .call(dropdownMenu, {
      options: plot_types,
      onOptionClicked: onColumnClicked,
      selectedOption: plot_type
    });
  
  if(plot_type == "scatter") {
    let scatter_data = {
      selection: plot,
      data: data,
      split_col: 'track_genre',
      xLabel: 'popularity',
      yLabel: 'danceability'
    };
    renderScatter(scatter_data);
  }

  if(plot_type == "linechart") {
    let line_data = {
      selection: plot,
      data: data,
      split_col: 'track_genre',
      cur_col: 'acoustic',
      Label: 'danceability',
    }
    renderLineChart(line_data);
  }

  if(plot_type == "ridgeline") {
    let ridge_data = {
      selection: plot,
      data: data,
      split_col: 'track_genre',
      Label: 'acoustic'
    }
    renderRidgeline(ridge_data);
  }

}

const show_col = (col) => {
  let stat = new DefaultDict(0);
  data.forEach(el => {
    stat[el[col]] += 1;
  });
  let stat_key = Object.keys(stat);
  console.log(col, stat);
  console.log(`len : ${stat_key.length}`);
  console.log(`max : ${Math.max(...stat_key)}`);
  console.log(`min : ${Math.min(...stat_key)}`);
}

d3.csv("archive/dataset.csv").then(loaddata => {
  data = loaddata;
  columns = data.columns.slice(1);
  render();
  // columns.forEach(col => {
  //   show_col(col);
  //   console.log(col);
  // })
})