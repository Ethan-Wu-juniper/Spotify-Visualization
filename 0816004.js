import {DefaultDict, fn} from './utils.js'
import { renderScatter } from './scatter.js'
import { renderLineChart } from './linechart.js'

let data;
let columns;
let Label = "id";
let plot_type = "line_chart";
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

const dropdownMenu = (selection, props) => {
  const {
    options,
    onOptionClicked,
    selectedOption
  } = props;
  
  let select = selection.selectAll('select').data([null]);
  select = select.enter().append('select')
    .merge(select)
      .on('change', function() {
        onOptionClicked(this.value);
      });
  
  const option = select.selectAll('option').data(options);
  option.enter().append('option')
    .merge(option)
      .attr('value', d => d)
      .property('selected', d => d === selectedOption)
      .text(d => d);
};

const onColumnClicked = column => {
  Label = column;
  // render();
  show_col(column);
};

const render = () => {

  d3.select('#column')
    .call(dropdownMenu, {
      options: columns,
      onOptionClicked: onColumnClicked,
      selectedOption: Label
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

  if(plot_type == "line_chart") {
    let line_data = {
      selection: plot,
      data: data,
      split_col: 'track_genre',
      Label: 'loudness',
    }
    renderLineChart(line_data);
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