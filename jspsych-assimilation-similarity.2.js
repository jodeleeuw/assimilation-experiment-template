/*
* Example plugin template
*/

jsPsych.plugins["assimilation-similarity"] = (function() {

    var plugin = {};

    jsPsych.pluginAPI.registerPreload('assimilation-similarity', 'stimulus', 'audio');

    plugin.info = {
        name: 'assimilation-similarity',
        description: '',
        parameters: {
            stimulus: {
                type: jsPsych.plugins.parameterType.AUDIO,
                default: undefined
            },
            show_assimilation: {
                type: jsPsych.plugins.parameterType.BOOL,
                default: true
            },
            show_similarity: {
                type: jsPsych.plugins.parameterType.BOOL,
                default: true
            },
            top_message: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                default: "<p>Click the word with the vowel sound that is most similar to the one you have heard.<br>Then decide how similar or different the vowel was.</p>"
            },
            choice_btns_are_images: {
                type: jsPsych.plugins.parameterType.BOOL,
                default: false
            },
            correct_response: {
                type: jsPsych.plugins.parameterType.INT,
                default: undefined
            },
            show_feedback: {
                type: jsPsych.plugins.parameterType.BOOL,
                default: false
            },
            feedback_duration: {
                type: jsPsych.plugins.parameterType.INT,
                default: 2000
            },
            play_audio_feedback_correct: {
                type: jsPsych.plugins.parameterType.BOOL,
                default: false
            },
            play_audio_feedback_incorrect: {
                type: jsPsych.plugins.parameterType.BOOL,
                default: false
            },
            delay_before_sound: {
                type: jsPsych.plugins.parameterType.INT,
                default: 0
            },
            similarity_scale_divisions: {
                type: jsPsych.plugins.parameterType.INT,
                default: 6
            },
            similarity_low_label: {
                type: jsPsych.plugins.parameterType.STRING,
                default: "(different)"
            },
            similarity_high_label: {
                type: jsPsych.plugins.parameterType.STRING,
                default: "(similar)"
            }
            continue_button_label: {
                type: jsPsych.plugins.parameterType.STRING,
                default: "Next sound"
            },
            choice_btn_width: {
                type: jsPsych.plugins.parameterType.INT,
                default: 100
            },
            choice_btn_height: {
                type: jsPsych.plugins.parameterType.INT,
                default: 50
            },
            choice_btn_margin: {
                type: jsPsych.plugins.parameterType.INT,
                default: 30
            },
            display_width: {
                type: jsPsych.plugins.parameterType.INT,
                default: 640
            },
            allow_other: {
                type: jsPsych.plugins.parameterType.BOOL,
                default: true
            },
            other_btn_label: {
                type: jsPsych.plugins.parameterType.STRING,
                default: "Other"
            },
            allow_play_again: {
                type: jsPsych.plugins.parameterType.BOOL,
                default: false
            },
            play_again_btn_label: {
                type: jsPsych.plugins.parameterType.STRING,
                default: "Play audio again"
            } 
        }
    }

    plugin.trial = function(display_element, trial) {

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
        if(trial.show_assimilation){
        html += '<div style="display: flex; align-content: center; flex-direction: row; flex-wrap: wrap; justify-content: space-around; width: '+trial.display_width+'px;">';
        for(var i=0; i<trial.choices.length; i++){
            if(trial.choice_btns_are_images){
            html += '<button class="jspsych-assimilation-similarity-btn" data-vowel="'+trial.choices[i]+'"><img src="'+trial.choices[i]+'"></button>';
            } else {
            html += '<button class="jspsych-assimilation-similarity-btn" data-vowel="'+trial.choices[i]+'">'+trial.choices[i]+'</button>';
            }
        }
        html += '</div>';
        }

        // similarity buttons & "other" button

        html += '<div id="jspsych-assimilation-similarity-bottom" style="margin: 20px 0px; height: 50px;"><div style="position: relative; display: inline-block; ">';
        if(trial.allow_other){
        html += '<button id="jspsych-assimilation-similarity-btn-other" class="jspsych-assimilation-similarity-btn" data-vowel="other">'+trial.other_btn_label+'</button>';
        }
        if(trial.allow_play_again){
        html += '<button id="jspsych-assimilation-similarity-btn-again">'+trial.play_again_btn_label+'</button>';
        }
        if(trial.show_similarity){
        html += '<button class="jspsych-assimilation-similarity-sim-btn" data-sim="1">1 '+trial.similarity_low_label+'</button>';
        for(var i=2; i < trial.similarity_scale_divisions; i++){
            html += '<button class="jspsych-assimilation-similarity-sim-btn" data-sim="'+i+'">'+i+'</button>';
        }
        html += '<button class="jspsych-assimilation-similarity-sim-btn" data-sim="'+trial.similarity_scale_divisions+'">'+trial.similarity_scale_divisions+' '+trial.similarity_high_label+'</button>';
        }
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

        if(trial.show_assimilation){
        var btns = display_element.querySelectorAll('.jspsych-assimilation-similarity-btn');
        var btn_fn = function(e){
            var btns = display_element.querySelectorAll('.jspsych-assimilation-similarity-btn');
            for(var i = 0; i<btns.length; i++){
            btns[i].className = "jspsych-assimilation-similarity-btn";
            }
            e.currentTarget.className = "jspsych-assimilation-similarity-btn selected";
            which_vowel = e.currentTarget.dataset.vowel;
            if(similarity !== null || trial.show_similarity == false){
            display_element.querySelector('#jspsych-assimilation-similarity-next').style.visibility = 'visible';
            } else {
            display_element.querySelector('#jspsych-assimilation-similarity-next').style.visibility = 'hidden';
            }
            showSimilarityScale();
        }
        for(var i=0; i < btns.length; i++){
            btns[i].addEventListener('click', btn_fn);
        }
        }

        if(trial.show_similarity){
        var sim_btns = display_element.querySelectorAll('.jspsych-assimilation-similarity-sim-btn');
        var sim_btn_fn = function(e){
            var sim_btns = display_element.querySelectorAll('.jspsych-assimilation-similarity-sim-btn');
            for(var i = 0; i<sim_btns.length; i++){
            sim_btns[i].className = "jspsych-assimilation-similarity-sim-btn";
            }
            e.currentTarget.className = "jspsych-assimilation-similarity-sim-btn selected";
            similarity = e.currentTarget.dataset.sim;
            if(which_vowel !== null || trial.show_assimilation == false){
            display_element.querySelector('#jspsych-assimilation-similarity-next').style.visibility = 'visible';
            } else {
            display_element.querySelector('#jspsych-assimilation-similarity-next').style.visibility = 'hidden';
            }
        }
        for(var i=0; i < sim_btns.length; i++){
            sim_btns[i].addEventListener('click', sim_btn_fn);
        }
        }

        if(trial.allow_other){
        var other_btn = display_element.querySelector('#jspsych-assimilation-similarity-btn-other').addEventListener('click', function(){
            display_element.querySelector('#jspsych-assimilation-similarity-next').style.visibility = 'visible';
            hideSimilarityScale();
            similarity = null;
            var sim_btns = display_element.querySelectorAll('.jspsych-assimilation-similarity-sim-btn');
            for(var i = 0; i<sim_btns.length; i++){
            sim_btns[i].className = "jspsych-assimilation-similarity-sim-btn";
            }
        });
        }

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