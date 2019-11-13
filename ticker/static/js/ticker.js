"use strict";

const JSON_URL = "/feed.json";

const IMAGE_TEMPLATE = `
      <figure class="media-left">
        <div class="image">
          <img alt="{ALT_TEXT}" src="{IMAGE_URL}" />
        </div>
      </figure>
`;

const ITEM_TEMPLATE = `
<div class="scroll-container">
  <div class="notification {COLOUR_CLASS}"">
    <article class="media">
      {IMAGE}

      <div class="media-content">
        <div class="content">
          <p>
            <strong>{TITLE}</strong>
            <br />
            <small>{TAG} ({AUTHOR})</small>
            <br />
            <br />
            {DESCRIPTION}
          </p>
        </div>
      </div>
    </article>
  </div>
</div>
`;

let entries = [];
let root = get_root();

function get_root() {
  return document.getElementById("content");
}

function set_loader(active) {
  let element = document.getElementById("loader");

  if (active) {
    element.classList.add("is-active");
  } else {
    element.classList.remove("is-active")
  }
}

async function load_entries() {
  let response = await fetch(JSON_URL);
  return await response.json();
}

async function loop() {
  console.log("Loading entries...");
  let data = await load_entries();
  let default_colour = data.tags.DEFAULT;

  console.log("Entries:", data);

  if (data.entries === entries) {
    return;
  }

  set_loader(true);

  entries = data.entries;
  root.innerHTML = "";  // Remove old entries

  for (const entry of entries) {
    let template = ITEM_TEMPLATE;

    if (entry.image) {
      console.log("Image found.");
      let image_template = IMAGE_TEMPLATE.replace("{IMAGE_URL}", entry.image);

      if (entry.image_alt) {
        image_template = image_template.replace("{ALT_TEXT}", entry.image_alt);
      } else {
        image_template = image_template.replace("{ALT_TEXT}", "");
      }

      template = template.replace("{IMAGE}", image_template);
    } else {
      console.log("No image found.");
      template = template.replace("{IMAGE}", "");
    }

    template = template.replace("{TITLE}", entry.title);
    template = template.replace("{AUTHOR}", entry.author);
    template = template.replace("{DESCRIPTION}", entry.summary);

    let colour = default_colour;
    let tag = "";

    console.log("Tags:", entry.tags);

    for (const entry_tag of entry.tags) {
      if (entry_tag.toUpperCase() in data.tags) {
        colour = data.tags[entry_tag.toUpperCase()];
        tag = entry_tag;
        break;
      }
    }

    template = template.replace("{COLOUR_CLASS}", colour);
    template = template.replace("{TAG}", tag);

    let element = document.createElement("div");
    element.innerHTML = template;

    root.appendChild(element);
  }

  set_loader(false);
}

function start() {
  console.log("Starting...");

  loop();
  doScroll();

  let interval_id = setInterval(loop, 300_000);
}

start();

let current_index = 0;

function doScroll() {
    let elements = document.getElementsByClassName("scroll-container");
    let final_index = elements.length;

    if (final_index > 0) {
      elements.item(current_index).scrollIntoView();
      current_index++;

      if (current_index >= final_index) {
          current_index = 0;
      }
    }

    setTimeout(doScroll, 10_000);
}
