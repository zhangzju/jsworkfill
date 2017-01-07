/*****************************************************************************
 *         In the name of God the Most Beneficent the Most Merciful          *
 *___________________________________________________________________________*
 *   This program is free software: you can redistribute it and/or modify    *
 *   it under the terms of the GNU General Public License as published by    *
 *   the Free Software Foundation, either version 3 of the License, or       *
 *   (at your option) any later version.                                     *
 *___________________________________________________________________________*
 *   This program is distributed in the hope that it will be useful,         *
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of          *
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the           *
 *   GNU General Public License for more details.                            *
 *___________________________________________________________________________*
 *   You should have received a copy of the GNU General Public License       *
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.   *
 *___________________________________________________________________________*
 *                       Created by AliReza Ghadimi                          *
 *     <http://AliRezaGhadimi.ir>    LO-VE    <AliRezaGhadimy@Gmail.com>     *
 *****************************************************************************/
/**
 * impress.js
 *
 * impress.js is a presentation tool based on the power of CSS3 transforms and transitions
 * in modern browsers and inspired by the idea behind prezi.com.
 *
 *
 * This code is from the substep enabled fork:
 * https://github.com/tehfoo/impress.js
 *
 *
 * Copyright 2011-2012 Bartek Szopka (@bartaz)
 *
 * Released under the MIT and GPL Licenses.
 *
 * ------------------------------------------------
 *  author:  Bartek Szopka
 *  version: 0.5.3
 *  url:     http://bartaz.github.com/impress.js/
 *  source:  http://github.com/bartaz/impress.js/
 */

/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, latedef:true, newcap:true,
 noarg:true, noempty:true, undef:true, strict:true, browser:true */

// You are one of those who like to know how things work inside?
// Let me show you the cogs that make impress.js run...
(function( document, window ){
    var body = (document.getElementById('impress')).dataset;
    if(body.circle == "true"){
        var steps = document.getElementsByClassName("step");
        var r = steps.length * 200 - 200;
        for (var i = 0; i < steps.length; i++) {
            var theta = -i/(steps.length-1) * 2 * Math.PI;
            var x = r * Math.cos(theta);
            var y = r * Math.sin(theta);
            var rotation = theta/(2*Math.PI) * 360 - 90;

            steps[i].setAttribute("data-x", Math.round(x).toString());
            steps[i].setAttribute("data-y", Math.round(y).toString());
            steps[i].setAttribute("data-rotate-z", Math.round(rotation).toString());
        }
    }
})( document, window );

var impress_load = function(){
    (function ( document, window ) {
        'use strict';
        // HELPER FUNCTIONS

        // `pfx` is a function that takes a standard CSS property name as a parameter
        // and returns it's prefixed version valid for current browser it runs in.
        // The code is heavily inspired by Modernizr http://www.modernizr.com/
        var pfx = (function () {

            var style = document.createElement('dummy').style,
                prefixes = 'Webkit Moz O ms Khtml'.split(' '),
                memory = {};

            return function ( prop ) {
                if ( typeof memory[ prop ] === "undefined" ) {

                    var ucProp  = prop.charAt(0).toUpperCase() + prop.substr(1),
                        props   = (prop + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' ');

                    memory[ prop ] = null;
                    for ( var i in props ) {
                        if ( style[ props[i] ] !== undefined ) {
                            memory[ prop ] = props[i];
                            break;
                        }
                    }

                }

                return memory[ prop ];
            };

        })();

        // `arraify` takes an array-like object and turns it into real Array
        // to make all the Array.prototype goodness available.
        var arrayify = function ( a ) {
            return [].slice.call( a );
        };

        // `css` function applies the styles given in `props` object to the element
        // given as `el`. It runs all property names through `pfx` function to make
        // sure proper prefixed version of the property is used.
        var css = function ( el, props ) {
            var key, pkey;
            for ( key in props ) {
                if ( props.hasOwnProperty(key) ) {
                    pkey = pfx(key);
                    if ( pkey !== null ) {
                        el.style[pkey] = props[key];
                    }
                }
            }
            return el;
        };

        // `toNumber` takes a value given as `numeric` parameter and tries to turn
        // it into a number. If it is not possible it returns 0 (or other value
        // given as `fallback`).
        var toNumber = function (numeric, fallback) {
            return isNaN(numeric) ? (fallback || 0) : Number(numeric);
        };

        // `byId` returns element with given `id` - you probably have guessed that ;)
        var byId = function ( id ) {
            return document.getElementById(id);
        };

        // `$` returns first element for given CSS `selector` in the `context` of
        // the given element or whole document.
        var $ = function ( selector, context ) {
            context = context || document;
            return context.querySelector(selector);
        };

        // `$$` return an array of elements for given CSS `selector` in the `context` of
        // the given element or whole document.
        var $$ = function ( selector, context ) {
            context = context || document;
            return arrayify( context.querySelectorAll(selector) );
        };

        // `triggerEvent` builds a custom DOM event with given `eventName` and `detail` data
        // and triggers it on element given as `el`.
        var triggerEvent = function (el, eventName, detail) {
            var event = document.createEvent("CustomEvent");
            event.initCustomEvent(eventName, true, true, detail);
            el.dispatchEvent(event);
        };

        // `translate` builds a translate transform string for given data.
        var translate = function ( t ) {
            return " translate3d(" + t.x + "px," + t.y + "px," + t.z + "px) ";
        };

        // `rotate` builds a rotate transform string for given data.
        // By default the rotations are in X Y Z order that can be reverted by passing `true`
        // as second parameter.
        var rotate = function ( r, revert ) {
            var rX = " rotateX(" + r.x + "deg) ",
                rY = " rotateY(" + r.y + "deg) ",
                rZ = " rotateZ(" + r.z + "deg) ";

            return revert ? rZ+rY+rX : rX+rY+rZ;
        };

        // `scale` builds a scale transform string for given data.
        var scale = function ( s ) {
            return " scale(" + s + ") ";
        };

        // `perspective` builds a perspective transform string for given data.
        var perspective = function ( p ) {
            return " perspective(" + p + "px) ";
        };

        // `getElementFromHash` returns an element located by id from hash part of
        // window location.
        var getElementFromHash = function () {
            // get id from url # by removing `#` or `#/` from the beginning,
            // so both "fallback" `#slide-id` and "enhanced" `#/slide-id` will work
            return byId( window.location.hash.replace(/^#\/?/,"") );
        };

        // `computeWindowScale` counts the scale factor between window size and size
        // defined for the presentation in the config.
        var computeWindowScale = function ( config ) {
            var hScale = window.innerHeight / config.height,
                wScale = window.innerWidth / config.width,
                scale = hScale > wScale ? wScale : hScale;

            if (config.maxScale && scale > config.maxScale) {
                scale = config.maxScale;
            }

            if (config.minScale && scale < config.minScale) {
                scale = config.minScale;
            }

            return scale;
        };

        // Simple helper to list any substeps within an element
        var getSubsteps = function (element) {
            return $$(".substep", element);
        };

        var getPresentSubstep = function (element) {
            return $(".present", element);
        };

        // Returns the first substep element marked as future
        // or false if there are no future substeps
        var getNextSubstep = function(element) {
            var result = false;
            var substeps = getSubsteps(element);
            if (substeps.length > 0) {
                var futureSubsteps = $$(".future", element);
                if (futureSubsteps.length > 0) {
                    result = futureSubsteps[0];
                }
            }
            return result;
        }

        // Returns the last substep element marked as past
        // or false if there are no past substeps
        var getPreviousSubstep = function(element) {
            var result = false;
            var substeps = getSubsteps(element);
            if (substeps.length > 0) {
                var pastSubsteps = $$(".past", element);
                if (pastSubsteps.length > 0) {
                    result = pastSubsteps[pastSubsteps.length - 1];
                }
            }
            return result;
        }

        // helper for navigation forward a substep
        var substepForward = function (element) {
            if (getPresentSubstep(element)) {
                var presentSubstep = getPresentSubstep(element);
                presentSubstep.classList.remove("present");
                presentSubstep.classList.add("past");
                triggerEvent(presentSubstep, "impress:substep-exit");
            }
            var nextSubstep = getNextSubstep(element);
            nextSubstep.classList.remove("future");
            nextSubstep.classList.add("present");
            nextSubstep.classList.add("active");
            // trigger events
            triggerEvent(nextSubstep, "impress:substep-active");
            triggerEvent(nextSubstep, "impress:substep-enter");
        }



        // helper for navigation back a substep
        var substepBackward = function (element) {
            var presentSubstep = getPresentSubstep(element);
            presentSubstep.classList.remove("present");
            presentSubstep.classList.add("future");
            presentSubstep.classList.remove("active");

            // trigger events
            triggerEvent(presentSubstep, "impress:substep-inactive");
            triggerEvent(presentSubstep, "impress:substep-exit");

            if (getPreviousSubstep(element)) {
                var previousSubstep = getPreviousSubstep(element);
                previousSubstep.classList.remove("past");
                previousSubstep.classList.add("present");
                triggerEvent(previousSubstep, "impress:substep-enter");
            }
        };


        // CHECK SUPPORT
        var body = document.body;

        var ua = navigator.userAgent.toLowerCase();
        var impressSupported =
            // browser should support CSS 3D transtorms
            ( pfx("perspective") !== null ) &&

                // and `classList` and `dataset` APIs
            ( body.classList ) &&
            ( body.dataset ) &&

                // but some mobile devices need to be blacklisted,
                // because their CSS 3D support or hardware is not
                // good enough to run impress.js properly, sorry...
            ( ua.search(/(iphone)|(ipod)|(android)/) === -1 );

        if (!impressSupported) {
            // we can't be sure that `classList` is supported
            body.className += " impress-not-supported ";
        } else {
            body.classList.remove("impress-not-supported");
            body.classList.add("impress-supported");
        }

        // GLOBALS AND DEFAULTS

        // This is where the root elements of all impress.js instances will be kept.
        // Yes, this means you can have more than one instance on a page, but I'm not
        // sure if it makes any sense in practice ;)
        var roots = {};

        // some default config values.
        var defaults = {
            width: 1024,
            height: 768,
            maxScale: 1,
            minScale: 0,

            perspective: 1000,

            transitionDuration: 1000
        };

        // it's just an empty function ... and a useless comment.
        var empty = function () { return false; };

        // IMPRESS.JS API

        // And that's where interesting things will start to happen.
        // It's the core `impress` function that returns the impress.js API
        // for a presentation based on the element with given id ('impress'
        // by default).
        var impress = window.impress = function ( rootId ) {

            // If impress.js is not supported by the browser return a dummy API
            // it may not be a perfect solution but we return early and avoid
            // running code that may use features not implemented in the browser.
            if (!impressSupported) {
                return {
                    init: empty,
                    goto: empty,
                    prev: empty,
                    next: empty
                };
            }

            rootId = rootId || "impress";

            // if given root is already initialized just return the API
            if (roots["impress-root-" + rootId]) {
                return roots["impress-root-" + rootId];
            }

            // data of all presentation steps
            var stepsData = {};

            // element of currently active step
            var activeStep = null;

            // current state (position, rotation and scale) of the presentation
            var currentState = null;

            // array of step elements
            var steps = null;

            // configuration options
            var config = null;

            // scale factor of the browser window
            var windowScale = null;

            // root presentation elements
            var root = byId( rootId );
            var canvas = document.createElement("div");

            var initialized = false;

            // STEP EVENTS
            //
            // There are currently two step events triggered by impress.js
            // `impress:stepenter` is triggered when the step is shown on the
            // screen (the transition from the previous one is finished) and
            // `impress:stepleave` is triggered when the step is left (the
            // transition to next step just starts).

            // reference to last entered step
            var lastEntered = null;

            // `onStepEnter` is called whenever the step element is entered
            // but the event is triggered only if the step is different than
            // last entered step.
            var onStepEnter = function (step) {
                if (lastEntered !== step) {
                    triggerEvent(step, "impress:stepenter");
                    lastEntered = step;
                }
            };

            // `onStepLeave` is called whenever the step element is left
            // but the event is triggered only if the step is the same as
            // last entered step.
            var onStepLeave = function (step) {
                if (lastEntered === step) {
                    triggerEvent(step, "impress:stepleave");
                    lastEntered = null;
                }
            };

            // `initStep` initializes given step element by reading data from its
            // data attributes and setting correct styles.
            var initStep = function ( el, idx ) {
                var data = el.dataset,
                    step = {
                        translate: {
                            x: toNumber(data.x),
                            y: toNumber(data.y),
                            z: toNumber(data.z)
                        },
                        rotate: {
                            x: toNumber(data.rotateX),
                            y: toNumber(data.rotateY),
                            z: toNumber(data.rotateZ || data.rotate)
                        },
                        scale: toNumber(data.scale, 1),
                        el: el
                    };

                if ( !el.id ) {
                    el.id = "step-" + (idx + 1);
                }

                stepsData["impress-" + el.id] = step;

                css(el, {
                    position: "absolute",
                    transform: "translate(-50%,-50%)" +
                    translate(step.translate) +
                    rotate(step.rotate) +
                    scale(step.scale),
                    transformStyle: "preserve-3d"
                });

                // need to prepare substeps with 'future'
                if (getSubsteps(el).length > 0) {
                    getSubsteps(el).forEach(
                        function(substep){
                            substep.classList.add("future");
                        }
                    );
                }
            };

            // `init` API function that initializes (and runs) the presentation.
            var init = function () {
                if (initialized) { return; }

                // First we set up the viewport for mobile devices.
                // For some reason iPad goes nuts when it is not done properly.
                var meta = $("meta[name='viewport']") || document.createElement("meta");
                meta.content = "width=device-width, minimum-scale=1, maximum-scale=1, user-scalable=no";
                if (meta.parentNode !== document.head) {
                    meta.name = 'viewport';
                    document.head.appendChild(meta);
                }

                // initialize configuration object
                var rootData = root.dataset;
                config = {
                    width: toNumber( rootData.width, defaults.width ),
                    height: toNumber( rootData.height, defaults.height ),
                    maxScale: toNumber( rootData.maxScale, defaults.maxScale ),
                    minScale: toNumber( rootData.minScale, defaults.minScale ),
                    perspective: toNumber( rootData.perspective, defaults.perspective ),
                    transitionDuration: toNumber( rootData.transitionDuration, defaults.transitionDuration )
                };

                windowScale = computeWindowScale( config );

                // wrap steps with "canvas" element
                arrayify( root.childNodes ).forEach(function ( el ) {
                    canvas.appendChild( el );
                });
                root.appendChild(canvas);

                // set initial styles
                document.documentElement.style.height = "100%";

                css(body, {
                    height: "100%",
                    overflow: "hidden"
                });

                var rootStyles = {
                    position: "absolute",
                    transformOrigin: "top left",
                    transition: "all 0s ease-in-out",
                    transformStyle: "preserve-3d"
                };

                css(root, rootStyles);
                css(root, {
                    top: "50%",
                    left: "50%",
                    transform: perspective( config.perspective/windowScale ) + scale( windowScale )
                });
                css(canvas, rootStyles);

                body.classList.remove("impress-disabled");
                body.classList.add("impress-enabled");

                // get and init steps
                steps = $$(".step", root);
                steps.forEach( initStep );

                // set a default initial state of the canvas
                currentState = {
                    translate: { x: 0, y: 0, z: 0 },
                    rotate:    { x: 0, y: 0, z: 0 },
                    scale:     1
                };

                initialized = true;

                triggerEvent(root, "impress:init", { api: roots[ "impress-root-" + rootId ] });
            };

            // `getStep` is a helper function that returns a step element defined by parameter.
            // If a number is given, step with index given by the number is returned, if a string
            // is given step element with such id is returned, if DOM element is given it is returned
            // if it is a correct step element.
            var getStep = function ( step ) {
                if (typeof step === "number") {
                    step = step < 0 ? steps[ steps.length + step] : steps[ step ];
                } else if (typeof step === "string") {
                    step = byId(step);
                }
                return (step && step.id && stepsData["impress-" + step.id]) ? step : null;
            };

            // used to reset timeout for `impress:stepenter` event
            var stepEnterTimeout = null;

            var onChangeFunction = function(el){};

            var onChange = function(func){
                onChangeFunction = func;
            };

            var background          = jQuery("body").css("background");
            var background_color    = jQuery("body").css("background-color");
            var background_image    = jQuery("body").css("background-image");
            var background_repeat   = jQuery("body").css("background-repeat");
            var background_size     = jQuery("body").css("background-size");

            // `goto` API function that moves to step given with `el` parameter (by index, id or element),
            // with a transition `duration` optionally given as second parameter.
            var goto = function ( el, duration ) {
                onChangeFunction(el);
                (function(el,$){

                    if($(el).attr("data-background") != undefined){
                        $("body").css("background",$(el).attr("data-background"));
                        if($(el).attr("data-change-all") == "true"){
                            background = $(el).attr("data-background");
                        }
                    }else{
                        $("body").css("background",background);
                    }

                    if($(el).attr("data-background-color") != undefined){
                        $("body").css("background-color",$(el).attr("data-background-color"));
                        if($(el).attr("data-change-all") == "true"){
                            background_color = $(el).attr("data-background-color");
                        }
                    }else{
                        $("body").css("background-color",background_color);
                    }

                    if($(el).attr("data-background-image") != undefined){
                        $("body").css("background-image","url(\""+$(el).attr("data-background-image")+"\")");
                        if($(el).attr("data-change-all") == "true"){
                            background_image = $(el).attr("data-background-image");
                        }
                    }else{
                        $("body").css("background-image",background_image);
                    }

                    if($(el).attr("data-background-repeat") != undefined){
                        $("body").css("background-repeat",$(el).attr("data-background-repeat"));
                        if($(el).attr("data-change-all") == "true"){
                            background_repeat = $(el).attr("data-background-repeat");
                        }
                    }else{
                        $("body").css("background-repeat",background_repeat);
                    }

                    if($(el).attr("data-background-size") != undefined){
                        $("body").css("background-size",$(el).attr("data-background-size"));
                        if($(el).attr("data-change-all") == "true"){
                            background_size = $(el).attr("data-background-size");
                        }
                    }else{
                        $("body").css("background-size",background_size);
                    }
                })(el,jQuery);
                if ( !initialized || !(el = getStep(el)) ) {
                    // presentation not initialized or given element is not a step
                    return false;
                }

                // Sometimes it's possible to trigger focus on first link with some keyboard action.
                // Browser in such a case tries to scroll the page to make this element visible
                // (even that body overflow is set to hidden) and it breaks our careful positioning.
                //
                // So, as a lousy (and lazy) workaround we will make the page scroll back to the top
                // whenever slide is selected
                //
                // If you are reading this and know any better way to handle it, I'll be glad to hear about it!
                window.scrollTo(0, 0);

                var step = stepsData["impress-" + el.id];

                if ( activeStep ) {
                    activeStep.classList.remove("active");
                    body.classList.remove("impress-on-" + activeStep.id);
                }
                el.classList.add("active");

                body.classList.add("impress-on-" + el.id);

                // compute target state of the canvas based on given step
                var target = {
                    rotate: {
                        x: -step.rotate.x,
                        y: -step.rotate.y,
                        z: -step.rotate.z
                    },
                    translate: {
                        x: -step.translate.x,
                        y: -step.translate.y,
                        z: -step.translate.z
                    },
                    scale: 1 / step.scale
                };

                // Check if the transition is zooming in or not.
                //
                // This information is used to alter the transition style:
                // when we are zooming in - we start with move and rotate transition
                // and the scaling is delayed, but when we are zooming out we start
                // with scaling down and move and rotation are delayed.
                var zoomin = target.scale >= currentState.scale;

                duration = toNumber(duration, config.transitionDuration);
                var delay = (duration / 2);

                // if the same step is re-selected, force computing window scaling,
                // because it is likely to be caused by window resize
                if (el === activeStep) {
                    windowScale = computeWindowScale(config);
                }

                var targetScale = target.scale * windowScale;

                // trigger leave of currently active element (if it's not the same step again)
                if (activeStep && activeStep !== el) {
                    onStepLeave(activeStep);
                }

                // Now we alter transforms of `root` and `canvas` to trigger transitions.
                //
                // And here is why there are two elements: `root` and `canvas` - they are
                // being animated separately:
                // `root` is used for scaling and `canvas` for translate and rotations.
                // Transitions on them are triggered with different delays (to make
                // visually nice and 'natural' looking transitions), so we need to know
                // that both of them are finished.
                css(root, {
                    // to keep the perspective look similar for different scales
                    // we need to 'scale' the perspective, too
                    transform: perspective( config.perspective / targetScale ) + scale( targetScale ),
                    transitionDuration: duration + "ms",
                    transitionDelay: (zoomin ? delay : 0) + "ms"
                });

                css(canvas, {
                    transform: rotate(target.rotate, true) + translate(target.translate),
                    transitionDuration: duration + "ms",
                    transitionDelay: (zoomin ? 0 : delay) + "ms"
                });

                // Here is a tricky part...
                //
                // If there is no change in scale or no change in rotation and translation, it means there was actually
                // no delay - because there was no transition on `root` or `canvas` elements.
                // We want to trigger `impress:stepenter` event in the correct moment, so here we compare the current
                // and target values to check if delay should be taken into account.
                //
                // I know that this `if` statement looks scary, but it's pretty simple when you know what is going on
                // - it's simply comparing all the values.
                if ( currentState.scale === target.scale ||
                    (currentState.rotate.x === target.rotate.x && currentState.rotate.y === target.rotate.y &&
                    currentState.rotate.z === target.rotate.z && currentState.translate.x === target.translate.x &&
                    currentState.translate.y === target.translate.y && currentState.translate.z === target.translate.z) ) {
                    delay = 0;
                }

                // store current state
                currentState = target;
                activeStep = el;

                // And here is where we trigger `impress:stepenter` event.
                // We simply set up a timeout to fire it taking transition duration (and possible delay) into account.
                //
                // I really wanted to make it in more elegant way. The `transitionend` event seemed to be the best way
                // to do it, but the fact that I'm using transitions on two separate elements and that the `transitionend`
                // event is only triggered when there was a transition (change in the values) caused some bugs and
                // made the code really complicated, cause I had to handle all the conditions separately. And it still
                // needed a `setTimeout` fallback for the situations when there is no transition at all.
                // So I decided that I'd rather make the code simpler than use shiny new `transitionend`.
                //
                // If you want learn something interesting and see how it was done with `transitionend` go back to
                // version 0.5.2 of impress.js: http://github.com/bartaz/impress.js/blob/0.5.2/js/impress.js
                window.clearTimeout(stepEnterTimeout);
                stepEnterTimeout = window.setTimeout(function() {
                    onStepEnter(activeStep);
                }, duration + delay);

                return el;
            };

            // `prev` API function goes to previous step (in document order)
            // or backs up one stubstep if a present substep is found
            var prev = function () {

                if (getPresentSubstep(activeStep)) {
                    // if this step has a substep in present state
                    // substepBackward. This is not exposed in API
                    // because substeps cannot be deep linked
                    substepBackward(activeStep);
                } else  {
                    // when no present substep goto previous step
                    var prev = steps.indexOf( activeStep ) - 1;
                    prev = prev >= 0 ? steps[ prev ] : steps[ steps.length-1 ];
                    return goto(prev);
                }
            };

            // `next` API function goes to next step (in document order)
            var next = function () {
                if (getNextSubstep(activeStep)) {
                    // if a future substep is found in this step
                    // substepForward.  This is not exposed in API
                    // because substeps cannot be deep linked
                    substepForward(activeStep);
                } else {
                    // when no future substeps are available goto next step
                    var next = steps.indexOf( activeStep ) + 1;
                    next = next < steps.length ? steps[ next ] : steps[ 0 ];
                    return goto(next);
                }
            };


            // Adding some useful classes to step elements.
            //
            // All the steps that have not been shown yet are given `future` class.
            // When the step is entered the `future` class is removed and the `present`
            // class is given. When the step is left `present` class is replaced with
            // `past` class.
            //
            // So every step element is always in one of three possible states:
            // `future`, `present` and `past`.
            //
            // There classes can be used in CSS to style different types of steps.
            // For example the `present` class can be used to trigger some custom
            // animations when step is shown.
            root.addEventListener("impress:init", function(){
                // STEP CLASSES
                steps.forEach(function (step) {
                    step.classList.add("future");
                });

                root.addEventListener("impress:stepenter", function (event) {
                    event.target.classList.remove("past");
                    event.target.classList.remove("future");
                    event.target.classList.add("present");
                }, false);

                root.addEventListener("impress:stepleave", function (event) {
                    event.target.classList.remove("present");
                    event.target.classList.add("past");
                }, false);

            }, false);

            // Adding hash change support.
            root.addEventListener("impress:init", function(){

                // last hash detected
                var lastHash = "";

                // `#/step-id` is used instead of `#step-id` to prevent default browser
                // scrolling to element in hash.
                //
                // And it has to be set after animation finishes, because in Chrome it
                // makes transtion laggy.
                // BUG: http://code.google.com/p/chromium/issues/detail?id=62820
                root.addEventListener("impress:stepenter", function (event) {
                    window.location.hash = lastHash = "#/" + event.target.id;
                }, false);

                window.addEventListener("hashchange", function () {
                    // When the step is entered hash in the location is updated
                    // (just few lines above from here), so the hash change is
                    // triggered and we would call `goto` again on the same element.
                    //
                    // To avoid this we store last entered hash and compare.
                    if (window.location.hash !== lastHash) {
                        goto( getElementFromHash() );
                    }
                }, false);

                // START
                // by selecting step defined in url or first step of the presentation
                goto(getElementFromHash() || steps[0], 0);
            }, false);

            body.classList.add("impress-disabled");

            // store and return API for given impress.js root element
            return (roots[ "impress-root-" + rootId ] = {
                init: init,
                goto: goto,
                next: next,
                prev: prev,
                onChange: onChange
            });

        };

        // flag that can be used in JS to check if browser have passed the support test
        impress.supported = impressSupported;

    })(document, window);
    impress().init();
};
// NAVIGATION EVENTS

// As you can see this part is separate from the impress.js core code.
// It's because these navigation actions only need what impress.js provides with
// its simple API.
//
// In future I think about moving it to make them optional, move to separate files
// and treat more like a 'plugins'.
(function ( document, window ) {
    'use strict';

    // throttling function calls, by Remy Sharp
    // http://remysharp.com/2010/07/21/throttling-function-calls/
    var throttle = function (fn, delay) {
        var timer = null;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    };

    // wait for impress.js to be initialized
    document.addEventListener("impress:init", function (event) {
        // Getting API from event data.
        // So you don't event need to know what is the id of the root element
        // or anything. `impress:init` event data gives you everything you
        // need to control the presentation that was just initialized.
        var api = event.detail.api;

        // KEYBOARD NAVIGATION HANDLERS

        //// Prevent default keydown action when one of supported key is pressed.
        //document.addEventListener("keydown", function ( event ) {
        //    if ( event.keyCode === 9 || ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {
        //        event.preventDefault();
        //    }
        //}, false);

        // Trigger impress action (next or prev) on keyup.

        // Supported keys are:
        // [space] - quite common in presentation software to move forward
        // [up] [right] / [down] [left] - again common and natural addition,
        // [pgdown] / [pgup] - often triggered by remote controllers,
        // [tab] - this one is quite controversial, but the reason it ended up on
        //   this list is quite an interesting story... Remember that strange part
        //   in the impress.js code where window is scrolled to 0,0 on every presentation
        //   step, because sometimes browser scrolls viewport because of the focused element?
        //   Well, the [tab] key by default navigates around focusable elements, so clicking
        //   it very often caused scrolling to focused element and breaking impress.js
        //   positioning. I didn't want to just prevent this default action, so I used [tab]
        //   as another way to moving to next step... And yes, I know that for the sake of
        //   consistency I should add [shift+tab] as opposite action...
/*        document.addEventListener("keyup", function ( event ) {
            if ( event.keyCode === 9 || ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {
                switch( event.keyCode ) {
                    case 33: // pg up
                    case 37: // left
                    case 38: // up
                        api.prev();
                        break;
                    case 9:  // tab
                    //case 32: // space
                    case 34: // pg down
                    case 39: // right
                    case 40: // down
                        api.next();
                        break;
                }

                event.preventDefault();
            }
        }, false);*/

        // touch handler to detect taps on the left and right side of the screen
        // based on awesome work of @hakimel: https://github.com/hakimel/reveal.js
        document.addEventListener("touchstart", function ( event ) {
            if (event.touches.length === 1) {
                var x = event.touches[0].clientX,
                    width = window.innerWidth * 0.3,
                    result = null;

                if ( x < width ) {
                    result = api.prev();
                } else if ( x > window.innerWidth - width ) {
                    result = api.next();
                }

                if (result) {
                    event.preventDefault();
                }
            }
        }, false);

        // rescale presentation when window is resized
        window.addEventListener("resize", throttle(function () {
            // force going to active step again, to trigger rescaling
            api.goto( document.querySelector(".step.active"), 500 );
        }, 250), false);

    }, false);

})(document, window);
// THAT'S ALL FOLKS!
//
// Thanks for reading it all.
// Or thanks for scrolling down and reading the last part.
//
// I've learnt a lot when building impress.js and I hope this code and comments
// will help somebody learn at least some part of it.



var load = function(){
    //!localStorage.slide
    if(!localStorage.slide){
        localStorage.slide = '<div class="step slide">' +
            '<div class="imprezi-editor" ></div>' +
            '</div>';
    }
    if(!localStorage.css){
        localStorage.css = "/** " +
            "*Insert your own css codes" +
            " */";
    }
    $("#user_style").html(localStorage.css);
    $("#impress").html(localStorage.slide);
    $("#editor-css-pre").val(localStorage.css);
};
var save = function(){
    ReloadImpress();
};

var ReadyEditor = function(){
    $("#impress .step .imprezi-editor").summernote({
        focus:false,
        airMode:true
    });
};
var ReloadImpress = function(){
    $(".note-air-layout").remove();
    $("#impress .step .imprezi-editor")
        .attr("contenteditable","false")
        .removeAttr("id")
        .removeClass("note-air-editor note-editable");
    $("#impress").attr("style","");
    var html = $("#impress div").first().html();
    $("#impress div").remove();
    $("#impress").html(html);
    /**
     * Save
     */
    localStorage.slide = html;
    localStorage.css   = $("#editor-css-pre").val();
    $("#user_style").html(localStorage.css);
    impress_load();
    ReadyEditor();
};
var bind_inputs = function(){
    $("#impress").bind("impress:stepenter",function(event){
        var step = $(event.target);
        //$("#transformer_num").val();
        $("#pos_x").val((step.data("x") == undefined) ? 0 : step.data("x"));
        $("#pos_y").val((step.data("y") == undefined) ? 0 : step.data("y"));
        $("#pos_z").val((step.data("z") == undefined) ? 0 : step.data("z"));

        $("#pos_rx").val((step.data("rotate-x") == undefined) ? 0 : step.data("rotate-x"));
        $("#pos_ry").val((step.data("rotate-y") == undefined) ? 0 : step.data("rotate-y"));
        $("#pos_rz").val((step.data("rotate-z") == undefined) ? ((step.data("rotate") == undefined) ? 0 : step.data("rotate")) : step.data("rotate-z"));

        $("#pos_scale").val((step.data("scale") == undefined) ? 1 : step.data("scale"));
        $(".popover.bottom.in").hide();
    });
    $("#icon").click(ReloadImpress);
    $("#pos_x").change(function(){
        $(".step.present").attr("data-x",$("#pos_x").val());
        ReloadImpress();
    });
    $("#pos_y").change(function(){
        $(".step.present").attr("data-y",$("#pos_y").val());
        ReloadImpress();
    });
    $("#pos_z").change(function(){
        $(".step.present").attr("data-z",$("#pos_z").val());
        ReloadImpress();
    });
    $("#pos_rx").change(function(){
        $(".step.present").attr("data-rotate-x",$("#pos_rx").val());
        ReloadImpress();
    });
    $("#pos_ry").change(function(){
        $(".step.present").attr("data-rotate-y",$("#pos_ry").val());
        ReloadImpress();
    });
    $("#pos_rz").change(function(){
        $(".step.present").attr("data-rotate-z",$("#pos_rz").val());
        ReloadImpress();
    });
    $("#pos_scale").change(function(){
        $(".step.present").attr("data-scale",$("#pos_scale").val());
        ReloadImpress();
    });
    $("#transformer_prev").click(function(){
        impress().prev();
    });
    $("#transformer_num").change(function(){
        impress().goto(parseInt($(this).val())-1);
        $(this).val("");
    });
    $("#transformer_next").click(function(){
        impress().next();
    });
    $("#save").click(save);
    $("#add").click(function(){
        var x, y, z,rx,ry,rz,el;
        el = $("#impress .step:last-child");
        x  = (el.data("x") == undefined) ? 0 : el.data("x");
        y  = (el.data("y") == undefined) ? 0 : el.data("y");
        z  = (el.data("z") == undefined) ? 0 : el.data("z");
        rx = (el.data("rotate-x") == undefined) ? 0 : el.data("rotate-x");
        ry = (el.data("rotate-y") == undefined) ? 0 : el.data("rotate-y");
        rz = (el.data("rotate-z") == undefined) ? 0 : el.data("rotate-z");

        $(".step:last-child").after('<div class="step slide" data-x="'+(x+1000)+'" data-y="'+(y)+'" data-z="'+z+'" data-rotate-x="'+rx+'" data-rotate-y="'+ry+'" data-rotate-z="'+rz+'">' +
            '<div class="imprezi-editor" ></div>' +
            '</div>');
        ReloadImpress();
        impress().goto($("#impress .step:last-child").attr("id"));
        el = null;
        x  = null;
        y  = null;
        z  = null;
        rx = null;
        ry = null;
        rz = null;
    });
    $("#hd-bg-color").click(function(){
        $("#bg-slide").hide("slow");
        $("#bg-color").toggle("slow");
    });
    $("#bg-color .note-color-btn").click(function(){
        $(".step.present").attr("data-background-color",$(this).css("background-color"));
        impress().goto($(".step.present"));
    });
    $("#bg-color .note-color-reset").click(function(){
        $(".step.present").removeAttr("data-background-color");
        $("body").css("background-color","#cfd8dc");
    });

    $("#hd-slide-color").click(function(){
        $("#bg-color").hide("slow");
        $("#bg-slide").toggle("slow");
    });
    $("#bg-slide .note-color-btn").click(function(){
        $(".step.present").css("background-color",$(this).css("background-color"));
    });
    $("#bg-slide .note-color-reset").click(function(){
        $(".step.present").css("background-color","transparent");
    });


    $("#editor-handle").click(function(){
        $("#editor-css").toggle("slow");
    });
};
