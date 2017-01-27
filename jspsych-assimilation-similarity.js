/*
 * Example plugin template
 */

jsPsych.plugins["assimilation-similarity"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('assimilation-similarity', 'stimulus', 'audio');

  plugin.trial = function(display_element, trial) {

    // set default values for parameters
    trial.top_message = trial.top_message || "<p>Click the word with the vowel sound that is most similar to the one you have heard.<br>Then decide how similar or different the vowel was.</p>";
    trial.choice_btns_are_images = typeof trial.choice_btns_are_images !== 'undefined' ? trial.choice_btns_are_images : false;
    trial.correct_response = trial.correct_response || undefined;
    trial.show_feedback = typeof trial.show_feedback !== 'undefined' ? trial.show_feedback : false;
    trial.feedback_duration = trial.feedback_duration || 2000;
    trial.play_audio_feedback_correct = typeof trial.play_audio_feedback_correct !== 'undefined' ? trial.play_audio_feedback_correct : false;
    trial.play_audio_feedback_incorrect = typeof trial.play_audio_feedback_incorrect !== 'undefined' ? trial.play_audio_feedback_incorrect : false;
    trial.delay_before_sound = trial.delay_before_sound || 0;
    trial.similarity_scale_divisions = trial.similarity_scale_divisions || 6;
    trial.similarity_low_label = trial.similarity_low_label || "(different)";
    trial.similarity_high_label = trial.similarity_high_label || "(similar)";
    trial.continue_button_label = trial.continue_button_label || "Next sound";
    trial.choice_btn_width = trial.choice_btn_width || 100;
    trial.choice_btn_height = trial.choice_btn_height || 50;
    trial.choice_btn_margin = trial.choice_btn_margin || 30;
    trial.display_width = trial.display_width || 640;
    trial.allow_other = typeof trial.allow_other !== 'undefined' ? trial.allow_other : true;
    trial.other_btn_label = trial.other_btn_label || "Other";
    trial.allow_play_again = typeof trial.allow_play_again !== 'undefined' ? trial.allow_play_again : false;
    trial.play_again_btn_label = trial.play_again_btn_label || "Play audio again";

    // allow variables as functions
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // render display //

    // add custom CSS rules
    var css = ".jspsych-assimilation-similarity-btn { width: "+trial.choice_btn_width+"px; height: "+trial.choice_btn_height+"px; margin: "+trial.choice_btn_margin+"px; border: 1px solid #ccc; background-color: #eee; font-size: 14px; cursor: pointer;}"+
      ".jspsych-assimilation-similarity-btn:focus, .jspsych-assimilation-similarity-sim-btn:focus, #jspsych-assimilation-similarity-btn-again:focus { outline: none; }"+
      ".jspsych-assimilation-similarity-btn:hover, .jspsych-assimilation-similarity-sim-btn:hover, #jspsych-assimilation-similarity-btn-again:hover { background-color: #f5f5f5; }"+
      ".jspsych-assimilation-similarity-sim-btn { margin: 0px; border: 1px solid #ccc; padding: 17px; background-color: #eee; font-size: 14px; cursor: pointer; }"+
      ".selected, .selected:hover { border: 1px solid #fcc; background-color: #fee; }"+
      "#jspsych-assimilation-similarity-btn-other { position: absolute; margin: 0px; width: inherit; height: inherit; padding: 17px; left: -"+(trial.choice_btn_width + trial.choice_btn_margin * 2)+"px; }"+
      "#jspsych-assimilation-similarity-btn-again { position: absolute; margin: 0px; right: -"+(trial.choice_btn_width + trial.choice_btn_margin * 2)+"px; }"+
      "#jspsych-assimilation-similarity-btn-again { margin: 0px; border: 1px solid #ccc; padding: 17px; background-color: #eee; font-size: 14px; cursor: pointer; }"+
      ".correct, .correct:hover { border: 1px solid #cfc; background-color: #efe; }"+
      "button { font-family: 'Open Sans'}";

    document.querySelector('head').insertAdjacentHTML('beforeend', '<style id="jspsych-assimilation-similarity-css">'+css+'</style>');

    // top instructions
    var html = trial.top_message;

    // button choices
    html += '<div style="display: flex; align-content: center; flex-direction: row; flex-wrap: wrap; justify-content: space-around; width: '+trial.display_width+'px;">';
    for(var i=0; i<trial.choices.length; i++){
      if(trial.choice_btns_are_images){
        html += '<button class="jspsych-assimilation-similarity-btn" data-vowel="'+trial.choices[i]+'"><img src="'+trial.choices[i]+'"></button>';
      } else {
        html += '<button class="jspsych-assimilation-similarity-btn" data-vowel="'+trial.choices[i]+'">'+trial.choices[i]+'</button>';
      }
    }
    html += '</div>';

    // similarity buttons & "other" button
    html += '<div id="jspsych-assimilation-similarity-bottom" style="margin: 20px 0px; height: 50px;"><div style="position: relative; display: inline-block; ">';
    if(trial.allow_other){
      html += '<button id="jspsych-assimilation-similarity-btn-other" class="jspsych-assimilation-similarity-btn" data-vowel="other">'+trial.other_btn_label+'</button>';
    }
    if(trial.allow_play_again){
      html += '<button id="jspsych-assimilation-similarity-btn-again">'+trial.play_again_btn_label+'</button>';
    }
    html += '<button class="jspsych-assimilation-similarity-sim-btn" data-sim="1">1 '+trial.similarity_low_label+'</button>';
    for(var i=2; i < trial.similarity_scale_divisions; i++){
      html += '<button class="jspsych-assimilation-similarity-sim-btn" data-sim="'+i+'">'+i+'</button>';
    }
    html += '<button class="jspsych-assimilation-similarity-sim-btn" data-sim="'+trial.similarity_scale_divisions+'">'+trial.similarity_scale_divisions+' '+trial.similarity_high_label+'</button>';
    html += '</div></div>';

    // continue button
    html += '<button id="jspsych-assimilation-similarity-next" class="jspsych-btn" style="visibility: hidden;">'+trial.continue_button_label+'</button>';

    display_element.innerHTML = html;

    // set up interactivity for display
    function showSimilarityScale() {
      var btns = display_element.querySelectorAll('.jspsych-assimilation-similarity-sim-btn');
      for(var i=0; i<btns.length;i++){
        btns[i].style.visibility = 'visible';
      }
    }

    function hideSimilarityScale() {
      var btns = display_element.querySelectorAll('.jspsych-assimilation-similarity-sim-btn');
      for(var i=0; i<btns.length;i++){
        btns[i].style.visibility = 'hidden';
      }
    }

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
      } else {
        display_element.querySelector('#jspsych-assimilation-similarity-next').style.visibility = 'hidden';
      }
      showSimilarityScale();
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
      } else {
        display_element.querySelector('#jspsych-assimilation-similarity-next').style.visibility = 'hidden';
      }
    }
    for(var i=0; i < sim_btns.length; i++){
      sim_btns[i].addEventListener('click', sim_btn_fn);
    }

    var other_btn = display_element.querySelector('#jspsych-assimilation-similarity-btn-other').addEventListener('click', function(){
      display_element.querySelector('#jspsych-assimilation-similarity-next').style.visibility = 'visible';
      hideSimilarityScale();
      similarity = null;
      var sim_btns = display_element.querySelectorAll('.jspsych-assimilation-similarity-sim-btn');
      for(var i = 0; i<sim_btns.length; i++){
        sim_btns[i].className = "jspsych-assimilation-similarity-sim-btn";
      }
    })

    display_element.querySelector('#jspsych-assimilation-similarity-next').addEventListener('click', next_stage);

    // play sound
    var play_count = 0;

    var context = jsPsych.pluginAPI.audioContext();
    if(context !== null){
      var source = context.createBufferSource();
    } else {
      var audio = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
    }

    function playSound(increment){
      if(increment) { play_count++; }

      if(context !== null){
        source = context.createBufferSource();
        source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
        source.connect(context.destination);
        startTime = context.currentTime;
        source.start(startTime);
      } else {
        audio = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
        audio.currentTime = 0;
        audio.play();
      }
    }

    if(trial.delay_before_sound > 0){
      jsPsych.pluginAPI.setTimeout(function(){
        playSound(true);
      }, trial.delay_before_sound);
    } else {
      playSound(true);
    }

    if(trial.allow_play_again){
      display_element.querySelector('#jspsych-assimilation-similarity-btn-again').addEventListener('click', function(){
        playSound(true);
      })
    }

    function next_stage() {
      if(trial.show_feedback == false) {
        end_trial();
      } else {
        display_element.querySelector('#jspsych-assimilation-similarity-next').style.visibility = 'hidden';
        var correct = trial.correct_response == which_vowel;
        if(correct) {
          var html = "<p>Correct!</p>";
          display_element.querySelector('[data-vowel="'+trial.correct_response+'"]').className += ' correct';
        } else {
          var html = "<p>Incorrect. The correct response is highlighted in green.</p>";
          display_element.querySelector('[data-vowel="'+trial.correct_response+'"]').className += ' correct';
        }
        display_element.querySelector('#jspsych-assimilation-similarity-bottom').innerHTML = html;
        if(correct && trial.play_audio_feedback_correct) { playSound(false); }
        if(!correct && trial.play_audio_feedback_incorrect) { playSound(false); }
        jsPsych.pluginAPI.setTimeout(end_trial, trial.feedback_duration);
      }
    }

    function end_trial() {

      jsPsych.pluginAPI.clearAllTimeouts();

      // data saving
      var trial_data = {
        audio: trial.stimulus,
        which_vowel: which_vowel,
        similarity: similarity,
        times_listened: play_count
      };

      if(typeof trial.correct_response !== 'undefined'){
        trial_data.correct = trial.correct_response == which_vowel;
      }

      console.log(JSON.stringify(trial_data));

      // stop the audio file if it is playing
      var context = jsPsych.pluginAPI.audioContext();
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
