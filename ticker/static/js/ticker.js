"use strict";

var JSON_URL = "/feed.json";
var VERSION_URL = "/version";

var IMAGE_TEMPLATE = 'background: linear-gradient( rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6) ), url({IMAGE_URL}); background-size: cover;';

var ITEM_TEMPLATE = '' +
'<div class="scroll-container">' +
  '<div class="card has-text-white" style="{IMAGE}">' +
    '<div class="card-content">' +
      '<div class="content">' +
        '<p>' +
          '<strong class="has-text-white">{TITLE}</strong>' +
          '<br />' +
          '<span class="tag is-pulled-right {COLOUR_CLASS}">{TAG}</span>' +
          '<small><em>{AUTHOR}</em></small>' +
          '<br />' +
          '<br />' +
          '{DESCRIPTION}' +
        '</p>' +
      '</div>' +
    '</div>' +
  '</div>' +
'</div>';

var app_version = null;
var current_index = 0;
var entries = [];
var root = get_root();
var skip_scroll = true;

function check_version() {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (app_version === null) {
        app_version = request.responseText;
        console.log("Current version:", app_version);
      } else {
        if (app_version !== request.responseText) {
          console.log("New version detected, reloading...", request.responseText);
          set_loader(true);

          setTimeout(function() {
            location.reload(true);
          }, 2000)  // 2 seconds
        }
      }
    }
  };

  request.open("GET", VERSION_URL);
  request.send();
}

function get_root() {
  return document.getElementById("content");
}

function set_loader(active) {
  var element = document.getElementById("loader");

  if (active) {
    element.classList.add("is-active");
  } else {
    element.classList.remove("is-active")
  }
}

function load_entries(callback) {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if (request.readyState === 4 && request.status === 200) {
      callback(JSON.parse(request.responseText));
    } else if (request.readyState === 4) {
      callback(null);
    }
  };

  request.open("GET", JSON_URL);
  request.send();
}

function loop() {
  console.log("Loading entries...");

  load_entries(function(data) {
    if (data === null) {
      console.error("Failed to load entries!");
      return;
    }

    var default_colour = data.tags.DEFAULT;

    if (entries.length > 0 && data.entries[0].published === entries[0].published) {
      console.log("Latest entry date matches, not recreating items");
      return;
    }

    set_loader(true);

    entries = data.entries;
    root.innerHTML = "";  // Remove old entries

    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var template = ITEM_TEMPLATE;

      if (entry.image) {
        var image_template = IMAGE_TEMPLATE.replace("{IMAGE_URL}", entry.image);
        template = template.replace("{IMAGE}", image_template);
      } else {
        template = template.replace("{IMAGE}", "");
      }

      template = template.replace("{TITLE}", entry.title);
      template = template.replace("{AUTHOR}", entry.author);
      template = template.replace("{DESCRIPTION}", entry.summary);

      var colour = default_colour;
      var tag = "";

      for (var j = 0; j < entry.tags.length; j++) {
        var entry_tag = entry.tags[j];

        if (entry_tag.toUpperCase() in data.tags) {
          colour = data.tags[entry_tag.toUpperCase()];
          tag = entry_tag;
          break;
        }
      }

      template = template.replace("{COLOUR_CLASS}", colour);
      template = template.replace("{TAG}", tag);

      var element = document.createElement("div");
      element.innerHTML = template;

      root.appendChild(element);
    }

    current_index = 0;
    var elements = document.getElementsByClassName("scroll-container");
    elements.item(current_index).scrollIntoView();
    skip_scroll = true;

    set_loader(false);
  });
}

function start() {
  console.log("Starting...");

  loop();
  do_scroll();
  check_version();

  setInterval(loop, 60000);  // Every minute
  setInterval(do_scroll, 10000);  // Every 10 seconds
  setInterval(check_version, 10000);  // Every 10 seconds
}

function do_scroll() {
  if (skip_scroll) {
    skip_scroll = false;
    return;
  }

  var elements = document.getElementsByClassName("scroll-container");
  var final_index = elements.length;

  if (final_index > 0) {
    elements.item(current_index).scrollIntoView();
    current_index++;

    if (current_index >= final_index) {
        current_index = 0;
    }
  }
}

start();
