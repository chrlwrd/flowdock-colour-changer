// ==UserScript==
// @name         Flowdock Colour Changer
// @version      0.1
// @description  Change the bloody Flow tab colours.
// @author       Charlie Ward
// @match        https://www.flowdock.com/*
// @require      https://code.jquery.com/jquery-3.3.1.slim.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
// ==/UserScript==

(function() {
    'use strict';

    // Store Flowdock's default colours on load so we can reset to "default" without reloading
    var coloursOnLoad = {};

    // Get list of flows from tab elements (janky, but unfortunately Flowdock's localStorage variables aren't helpful here)
    var init = function() {
        var flowTabs = $($(".org-flows")[1]).children();
        var flows = {};
        $.each(flowTabs, function(i, v) {
            var name = getName(v);
            var link = getLink(v);
            if (coloursOnLoad[link] == null) {
                coloursOnLoad[link] = getColour(v);
            }
            flows[link] = {
                "label": name,
                "type": "text",
                "default": "default"
            };
        });
        GM_config.init({
            "id": "flowdock-tab-colours",
            "title": "Flow Tab Colours",
            "fields": flows,
            "events": {
                "save": changeColours
            }
        });

        changeColours();
    }

    // Open preferences dialog
    var openColourPrefs = function() {
        GM_config.open();
    };

    // Get name of flow from its tab element
    var getName = function(element) {
        var ele = $(element).children()[0];
        return ele.title;
    };

    // Get URL of flow from its tab element
    var getLink = function(element) {
        var ele = $(element).children()[0];
        return ele.href;
    };

    // Get current colour of flow' tab element
    var getColour = function(element) {
        var ele = $(element).children()[0];
        return $(ele).find(".tab-avatar").css("background-color");
    };

    // Trigger colour change
    var changeColours = function() {
        var elements = $($(".org-flows")[1]).children();
        $.each(elements, function(i, v){
            var savedColour = GM_config.get(getLink(v));
            if (savedColour != "default") {
                $(v).find(".tab-avatar").css("background-color", savedColour);
            } else {
                var link = getLink(v);
                $(v).find(".tab-avatar").css("background-color", coloursOnLoad[link]);
            }
        });
    };

    // Wait for the menu to load before adding the option
    waitForKeyElements("menu.dropdown-menu.touch-scrollable", function() {
        $("menu.dropdown-menu.touch-scrollable").append("<ul class='dropdown-actions'><li><a id='change-colour'>Change tab colours</a></li></ul>");
        $("#change-colour").click(openColourPrefs);
    });

    // Wait for the flow tabs to load before using them to initialise
    waitForKeyElements(".tab-avatar", init);

})();
