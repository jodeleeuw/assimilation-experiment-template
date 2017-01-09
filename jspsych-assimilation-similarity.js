/*
 * Example plugin template
 */

jsPsych.plugins["assimilation-similarity"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('assimilation-similarity', 'stimulus', 'audio');

  plugin.trial = function(display_element, trial) {

    // set default values for parameters
    trial.parameter = trial.parameter || 'default value';
    trial.top_message = trial.top_message || "<p>Click the word with the vowel sound that is most similar to the one you have heard.<br>Then decide how similar or different the vowel was.</p>";
    trial.similarity_scale_divisions = trial.similarity_scale_divisions || 6;
    trial.continue_button_label = trial.continue_button_label || "Next sound";
    trial.choice_btn_width = trial.choice_btn_width || 100;
    trial.choice_btn_height = trial.choice_btn_height || 50;
    trial.choice_btn_margin = trial.choice_btn_margin || 50;
    trial.display_width = trial.display_width || '95%';

    // allow variables as functions
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // render display //

    // add custom CSS rules
    var css = ".jspsych-assimilation-similarity-btn { width: "+trial.choice_btn_width+"px; height: "+trial.choice_btn_height+"px; margin: "+trial.choice_btn_margin+"px; border: 1px solid #ccc; background-color: #eee; font-size: 14px; cursor: pointer;}"+
      ".jspsych-assimilation-similarity-btn:focus, .jspsych-assimilation-similarity-sim-btn:focus { outline: none; }"+
      ".jspsych-assimilation-similarity-btn:hover, .jspsych-assimilation-similarity-sim-btn:hover { background-color: #f5f5f5; }"+
      ".jspsych-assimilation-similarity-sim-btn { margin: 0px; border: 1px solid #ccc; padding: 20px; background-color: #eee; font-size: 14px; cursor: pointer; }"+
      ".selected { border: 1px solid #fcc; background-color: #fee; }"+
      "button { font-family: 'Open Sans'}";

    document.querySelector('head').insertAdjacentHTML('beforeend', '<style id="jspsych-assimilation-similarity-css">'+css+'</style>');

    // top instructions
    var html = trial.top_message;

    // button choices
    html += '<div style="display: flex; align-content: center; flex-direction: row; flex-wrap: wrap; justify-content: space-around; width: '+trial.display_width+'">';
    for(var i=0; i<trial.choices.length; i++){
      html += '<button class="jspsych-assimilation-similarity-btn" data-vowel="'+trial.choices[i]+'">'+trial.choices[i]+'</button>';
    }
    html += '</div>';

    // similarity buttons
    html += '<div style="margin: 20px 0px;">';
    html += '<button class="jspsych-assimilation-similarity-sim-btn" data-sim="1">1 (different)</button>';
    for(var i=2; i < trial.similarity_scale_divisions; i++){
      html += '<button class="jspsych-assimilation-similarity-sim-btn" data-sim="'+i+'">'+i+'</button>';
    }
    html += '<button class="jspsych-assimilation-similarity-sim-btn" data-sim="'+trial.similarity_scale_divisions+'">'+trial.similarity_scale_divisions+' (similar)</button>';
    html += '</div>';

    // continue button
    html += '<button id="jspsych-assimilation-similarity-next" class="jspsych-btn" style="visibility: hidden;">'+trial.continue_button_label+'</button>';

    display_element.innerHTML = html;

    // set up interactivity for display
    var which_vowel = null;
    var similarity = null;

    var btns = display_element.querySelectorAll('.jspsych-assimilation-similarity-btn');
    var btn_fn = function(e){
      var btns = display_element.querySelectorAll('.jspsych-assimilation-similarity-btn');
      for(var i = 0; i<btns.length; i++){
        btns[i].className = "jspsych-assimilation-similarity-btn";
      }
      e.currentTarget.className = "jspsych-assimilation-similarity-btn selected";
      which_vowel = e.currentTarget.dataset.vowel;
      if(similarity !== null){
        display_element.querySelector('#jspsych-assimilation-similarity-next').style.visibility = 'visible';
      }
    }
    for(var i=0; i < btns.length; i++){
      btns[i].addEventListener('click', btn_fn);
    }

    var sim_btns = display_element.querySelectorAll('.jspsych-assimilation-similarity-sim-btn');
    var sim_btn_fn = function(e){
      var sim_btns = display_element.querySelectorAll('.jspsych-assimilation-similarity-sim-btn');
      for(var i = 0; i<sim_btns.length; i++){
        sim_btns[i].className = "jspsych-assimilation-similarity-sim-btn";
      }
      e.currentTarget.className = "jspsych-assimilation-similarity-sim-btn selected";
      similarity = e.currentTarget.dataset.sim;
      if(which_vowel !== null){
        display_element.querySelector('#jspsych-assimilation-similarity-next').style.visibility = 'visible';
      }
    }
    for(var i=0; i < sim_btns.length; i++){
      sim_btns[i].addEventListener('click', sim_btn_fn);
    }

    display_element.querySelector('#jspsych-assimilation-similarity-next').addEventListener('click', end_trial);

    // play sound
    var context = jsPsych.pluginAPI.audioContext();
    if(context !== null){
      var source = context.createBufferSource();
      source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
      source.connect(context.destination);
      startTime = context.currentTime + 0.1;
      source.start(startTime);
    } else {
      var audio = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
      audio.currentTime = 0;
      audio.play();
    }

    function end_trial() {
      // data saving
      var trial_data = {
        which_vowel: which_vowel,
        similarity: similarity
      };

      // stop the audio file if it is playing
      if(context !== null){
        source.stop();
      } else {
        audio.pause();
      }

      display_element.innerHTML = '';
      document.querySelector('#jspsych-assimilation-similarity-css').remove();

      // end trial
      jsPsych.finishTrial(trial_data);
    }
  };

  return plugin;
})();
