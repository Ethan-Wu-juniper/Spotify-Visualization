import { render } from './0816004.js'

const homepage = (selection) => {
  selection
  .append('div')
    .style('position', 'relative')
    .style('top', '10%')
    .on('mouseover', function () {document.body.style.cursor = "default"})
  .append('h1')
    .style('font-size', '130px')
    .style('font-family', 'Arial,sans-serif')
    .text("Welcome");
  let icon = ["trophy", "bar-chart-line", "spotify"];
  let title = ["Tracks", "Genre", "Spotify"];
  let content = [
    "See the most popular tracks!",
    "Analysis on each genre",
    "Listen to your favorite song on Spotify"
  ]
  let onclickEvent = [
    function () {
      render("tracklist");
    },
    function() {
      render("ridgeline");
    },
    function() {
      window.open(
        'https://open.spotify.com/',
        '_blank'
      );
    }
  ]

  const firstEnter = (target) => (el) => {
    el.style('opacity', 0)
    .transition().duration(1000)
    .style('opacity', target)
  }

  const clickEvent = (original, hover, i) => (el) => {
    el.on("mouseover", function(_, d) {
      d3.select(this).style('opacity', hover);
      document.body.style.cursor = "pointer";
    })
    .on("mouseout", function(_, d) {
      d3.select(this).style('opacity', original);
      document.body.style.cursor = "default";
    })
    .on("click", function(_, d) {
      d3.select(this).style('opacity', original);
      document.body.style.cursor = "default";
      onclickEvent[i]();
    })
  }

  for(let i = 0; i < 3; i++) {
    let frame = selection.append('div')
      .attr('class', 'home-block');
    let intro = frame.append('div')
      .attr('class', 'intro-block');
    let iconDiv = intro.append('div')
      .attr('class', 'icon-div')
      .call(firstEnter(0.6))
      .call(clickEvent(0.6, 0.4, i));
    iconDiv.append('i')
      .attr('class', `bi bi-${icon[i]}`);

    let titleDiv = intro.append('div')
      .attr('class', 'title-div');
    titleDiv.append('h1')
      .text(title[i])
      .call(firstEnter(1))
      .call(clickEvent(1, 0.85, i));

    let contentDiv = intro.append('div')
      .attr('class', 'content-div')
      .call(firstEnter(1));
    contentDiv.append('text')
      .text(content[i]);
  }
}

export const renderHomepage = (props) => {
  const {
    selection
  } = props;
  d3.select('#plot').style('overflow-y', null);
  homepage(selection);
}