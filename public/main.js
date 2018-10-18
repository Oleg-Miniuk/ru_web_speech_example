// Speech synthesis
const synth = window.speechSynthesis;

const inputForm = document.querySelector('form');
const inputTxt = document.querySelector('.text');
const voicesList = document.querySelector('select');

const pitch = document.querySelector('#pitch');
const pitchValue = document.querySelector('.value--pitch-value');
const rate = document.querySelector('#rate');
const rateValue = document.querySelector('.value--rate-value');

let voices = [];

window.onbeforeunload = function() {
  synth.cancel();
};

function populateVoiceList() {
  voices = synth.getVoices();
  const selectedIndex =
    voicesList.selectedIndex < 0 ? 0 : voicesList.selectedIndex;
  voicesList.innerHTML = '';
  for (i = 0; i < voices.length; i++) {
    const option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if (voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voicesList.appendChild(option);
  }
  voicesList.selectedIndex = selectedIndex;
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speak() {
  if (synth.speaking) {
    console.error('speechSynthesis.speaking');
    synth.cancel();
    setTimeout(speak, 300);
  } else if (inputTxt.value !== '') {
    const utterThis = new SpeechSynthesisUtterance(inputTxt.value);
    utterThis.onend = function(event) {
      console.log('SpeechSynthesisUtterance.onend');
    };
    utterThis.onerror = function(event) {
      console.error('SpeechSynthesisUtterance.onerror');
    };
    const selectedOption = voicesList.selectedOptions[0].getAttribute(
      'data-name'
    );
    for (i = 0; i < voices.length; i++) {
      if (voices[i].name === selectedOption) {
        utterThis.voice = voices[i];
      }
    }

    utterThis.onpause = function(event) {
      const char = event.utterance.text.charAt(event.charIndex);
      console.log(
        'Speech paused at character ' +
          event.charIndex +
          ' of "' +
          event.utterance.text +
          '", which is "' +
          char +
          '".'
      );
    };

    utterThis.pitch = pitch.value;
    utterThis.rate = rate.value;
    synth.speak(utterThis);
  }
}

inputForm.onsubmit = function(event) {
  event.preventDefault();

  speak();

  inputTxt.blur();
};

pitch.onchange = function() {
  pitchValue.textContent = pitch.value;
};

rate.onchange = function() {
  rateValue.textContent = rate.value;
};

voicesList.onchange = function() {
  speak();
};
// end of speech synthesis

// Speech recognition
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList =
  window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent =
  window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

const colors = {
  красный: 'red',
  оранжевый: 'orange',
  желтый: 'yellow',
  зеленый: 'green',
  голубой: 'blue',
  синий: 'darkblue',
  фиолетовый: 'violet'
};

const colorsList = Object.keys(colors);

const grammar =
  '#JSGF V1.0; grammar colors; public <color> = ' +
  colorsList.join(' | ') +
  ' ;';

const recognition = new SpeechRecognition();
const speechRecognitionList = new SpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1);
recognition.grammars = speechRecognitionList;
recognition.lang = 'ru-RU';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const microphoneIcon = document.querySelector('.microphone__image');
const microphoneWrapper = document.querySelector('.microphone-wrapper');
const audioRecordAnimation = document.querySelector('.audio-record-animation');
const speechRecognitionSection = document.querySelector(
  '.speech-recognition-section'
);
const recognitionTextResult = document.querySelector('.recognition-result');

function getColor(speechResult) {
  for (let index = 0; index < colorsList.length; index += 1) {
    if (speechResult.indexOf(colorsList[index]) !== -1) {
      const colorKey = colorsList[index];
      return [colorKey, colors[colorKey]];
    }
  }
  return null;
}

microphoneIcon.onclick = function() {
  recognition.start();
  console.log('Ready to receive a color command.');
};

recognition.onaudiostart = function() {
  microphoneWrapper.style.visibility = 'hidden';
  audioRecordAnimation.style.visibility = 'visible';
};

recognition.onresult = function(event) {
  const last = event.results.length - 1;
  const colors = getColor(event.results[last][0].transcript);

  recognitionTextResult.textContent = 'Результат: ' + colors[0];
  speechRecognitionSection.style.backgroundColor = colors[1];
  console.log('Confidence: ' + event.results[0][0].confidence);
};

recognition.onspeechend = function() {
  recognition.stop();
  microphoneWrapper.style.visibility = 'visible';
  audioRecordAnimation.style.visibility = 'hidden';
};

recognition.onnomatch = function(event) {
  alert("I didn't recognise that color.");
};

recognition.onerror = function(event) {
  alert(`Error occurred in recognition: ${event.error}`);
};
// end of speech recognition
