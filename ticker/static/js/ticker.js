"use strict";

var JSON_URL = "/feed.json";

var IMAGE_TEMPLATE = '' +
'<figure class="media-left">' +
  '<div class="image">' +
    '<img alt="{ALT_TEXT}" src="{IMAGE_URL}" />' +
  '</div>' +
'</figure>';

var ITEM_TEMPLATE = '' +
'<div class="scroll-container">' +
  '<div class="notification {COLOUR_CLASS}"">' +
    '<article class="media">' +
      '{IMAGE}' +
      '<div class="media-content">' +
        '<div class="content">' +
          '<p>' +
            '<strong>{TITLE}</strong>' +
            '<br />' +
            '<small>{TAG} ({AUTHOR})</small>' +
            '<br />' +
            '<br />' +
            '{DESCRIPTION}' +
          '</p>' +
        '</div>' +
      '</div>' +
    '</article>' +
  '</div>' +
'</div>';

var entries = [];
var root = get_root();

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

        if (entry.image_alt) {
          image_template = image_template.replace("{ALT_TEXT}", entry.image_alt);
        } else {
          image_template = image_template.replace("{ALT_TEXT}", "");
        }

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

    set_loader(false);
  });
}

function start() {
  console.log("Starting...");

  loop();
  doScroll();

  setInterval(loop, 60_000);  // Every minute
  setInterval(doScroll, 10_000);  // Every 10 seconds
}

var current_index = 0;

function doScroll() {
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
