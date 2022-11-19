import { DefaultDict, dropdownMenu, plot_types } from './utils.js'
import { renderRidgeline } from './charts/ridgeline.js'
import { renderBarChart } from './charts/barchart.js'
import { renderSpider } from './charts/track.js'

let data;
let columns;
let Label = "id";
let plot_type = "ridgeline";
const plot = d3.select('#main-plot');

const get_id = () => {
  let input = document.getElementById("id").value;
  console.log(input);
  out = data.filter((d) => {
    return d.artists.toLowerCase()
      .includes(input.toLowerCase())
  })
  console.log(out);
}

export const render = (plot_type) => {
  plot.selectAll("*").remove();
  d3.select("#plot").selectAll("div").remove();

  if(plot_type == "homepage") {

  }

  if(plot_type == "barchart") {
    let bar_data = {
      selection: plot,
      data: data,
      split_col: 'track_genre',
      cur_col: 'acoustic',
      Label: 'danceability',
    }
    renderBarChart(bar_data);
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

  if(plot_type == "spider") {
    let spider_data = {
      selection: plot,
      data: data,
      track_name: 'Comedy'
    }
    renderSpider(spider_data);
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

const mobileMenuSwitch = () => {
  $("#show-sidebar").click(function () {
    let mobileMenu = $("#mobile-menu");
    if (mobileMenu.hasClass("hide-nav")) {
      setTimeout(function () {
        mobileMenu.addClass("show-nav").removeClass("hide-nav");
      }, 100)
    }
  });

  $("#hide-sidebar").click(function () {
    let mobileMenu = $("#mobile-menu");
    if (mobileMenu.hasClass("show-nav")) {
      setTimeout(function () {
        mobileMenu.addClass("hide-nav").removeClass("show-nav");
      }, 100)
    }
  });

  $(window).click(function() {
    let mobileMenu = $("#mobile-menu");
    if (mobileMenu.hasClass("show-nav")) {
      setTimeout(function () {
        mobileMenu.addClass("hide-nav").removeClass("show-nav");
      }, 100)
    }
  });
  
  $('#mobile-menu').click(function(event){
    event.stopPropagation();
  });
}

d3.csv("archive/dataset.csv").then(loaddata => {
  data = loaddata;
  columns = data.columns.slice(1);
  render("homepage");
  mobileMenuSwitch();
  // columns.forEach(col => {
  //   show_col(col);
  //   console.log(col);
  // })
  
})