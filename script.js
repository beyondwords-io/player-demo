const settingsFunctions = {};
const timeUpdateFunctions = {};

const main = async () => {
  const data = await fetch("data.json").then(r => r.json());

  const prototypeSettings = document.getElementById("prototype-settings");
  const checkboxes = prototypeSettings.querySelectorAll("input[type='checkbox']");

  checkboxes.forEach(c => c.checked && applySetting(c, data));
  checkboxes.forEach(c => c.onchange = () => applySetting(c, data));

  const audioPlayer = document.getElementById("audio-player");
  audioPlayer.ontimeupdate = () => applyTimeUpdate(audioPlayer);
};

const applySetting = (checkbox, data) => {
  if (checkbox.checked) {
    settingsFunctions[`enable${checkbox.id}`](data);
  } else {
    settingsFunctions[`disable${checkbox.id}`](data);
  }
};

const applyTimeUpdate = (audioPlayer) => {
  Object.values(timeUpdateFunctions).forEach(f => f(audioPlayer));
};

settingsFunctions.enableButtonsBetweenParagraphs = async (data) => {
  const audioPlayer = document.getElementById("audio-player");
  const paragraphs = document.querySelectorAll("[data-beyondwords-paragraph-id]");

  paragraphs.forEach(paragraph => {
    const paragraphId = paragraph.dataset.beyondwordsParagraphId;
    const timestamp = data.timestamps[paragraphId];

    const playButton = document.createElement("button");
    playButton.classList.add("button-between-paragraphs");
    paragraph.parentNode.insertBefore(playButton, paragraph);

    const minutes = String(Math.floor(timestamp / 60)).padStart(2, "0");
    const seconds = String(Math.floor(timestamp % 60)).padStart(2, "0");

    playButton.innerText = `${minutes}:${seconds}`;
    playButton.onclick = () => {
      audioPlayer.currentTime = timestamp;
      audioPlayer.play();
    }
  });
};

settingsFunctions.disableButtonsBetweenParagraphs = () => {
  const playButtons = document.querySelectorAll(".button-between-paragraphs");
  playButtons.forEach(b => b.remove());
};

settingsFunctions.enableHighlightParagraph = (data) => {
  const paragraphs = document.querySelectorAll("[data-beyondwords-paragraph-id]");

  timeUpdateFunctions.highlightParagraph = (audioPlayer) => {
    paragraphs.forEach(paragraph => {
      paragraph.classList.remove("beyondwords-current");
    });

    let marker;
    for (const [key, value] of Object.entries(data.timestamps)) {
      if (value < audioPlayer.currentTime + 0.5) {
        marker = key;
      }  else {
        break;
      }
    }

    paragraphs.forEach(paragraph => {
      const paragraphId = paragraph.getAttribute("data-beyondwords-paragraph-id");
      if (paragraphId === marker) {
        paragraph.classList.add("beyondwords-current");
      }
    });
  }

  const audioPlayer = document.getElementById("audio-player");
  timeUpdateFunctions.highlightParagraph(audioPlayer);
};

settingsFunctions.disableHighlightParagraph = () => {
  delete timeUpdateFunctions.highlightParagraph;

  const paragraphs = document.querySelectorAll("[data-beyondwords-paragraph-id]");

  paragraphs.forEach(paragraph => {
    paragraph.classList.remove("beyondwords-current");
  });
};

main();
