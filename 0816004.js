import { DefaultDict, dropdownMenu, plot_types, clearWindow } from './utils.js'
import { renderRidgeline } from './charts/ridgeline.js'
import { renderBarChart } from './charts/barchart.js'
import { renderSpider } from './charts/track.js'
import { renderTrackList } from './charts/track_list.js'

let data;
let columns;
let Label = "id";
let plot_type;
const plot = d3.select('#plot');

// plot.attr('width', window.innerWidth);
// plot.attr('height', window.innerHeight-200);

const get_id = () => {
  let input = document.getElementById("id").value;
  console.log(input);
  out = data.filter((d) => {
    return d.artists.toLowerCase()
      .includes(input.toLowerCase())
  })
  console.log(out);
}

export const render = (type) => {
  clearWindow();
  plot_type = type;

  if(type == "homepage") {

  }

  if(type == "barchart") {
    let bar_data = {
      selection: plot,
      data: data,
      split_col: 'track_genre',
      cur_col: 'acoustic',
      Label: 'danceability',
    }
    renderBarChart(bar_data);
  }

  if(type == "ridgeline") {
    let ridge_data = {
      selection: plot,
      data: data,
      split_col: 'track_genre',
      Label: 'acoustic'
    }
    renderRidgeline(ridge_data);
  }

  if(type == "spider") {
    let spider_data = {
      selection: plot,
      data: data,
      track_id: 0,
      tracklist_data: null
    }
    renderSpider(spider_data);
  }

  if(type == "tracklist") {
    let tracklist_data = {
      selection: plot,
      data: data,
      track_name: '',
      page: 1
    }
    renderTrackList(tracklist_data);
  }

}

export const showTrack = (value) => {
  plot_type = "tracklist";
  clearWindow();
  
  let tracklist_data = {
    selection: plot,
    data: data,
    track_name: value,
    page: 1
  }
  renderTrackList(tracklist_data);
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
// d3.csv("http://vis.lab.djosix.com:2020/data/spotify_tracks.csv").then(loaddata => {
  data = loaddata;
  columns = data.columns.slice(1);
  render("homepage");
  mobileMenuSwitch();
  // columns.forEach(col => {
  //   show_col(col);
  //   console.log(col);
  // })
  
})