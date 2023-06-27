
    var storymap;
    var storymap_url = '//uploads.knightlab.com/storymapjs/144be720d2e26f2c517b5ffadf116c6d/tourmap/published.json';
    const urlParams = new URLSearchParams(window.location.search);

	function onStoryMapTitle(e) {
      document.title = "StoryMapJS: " + e.title;
	};

    function getScriptPath(scriptname) {
        var scriptTags = document.getElementsByTagName('script');
        for(var i = 0; i < scriptTags.length; i++) {
            if(scriptTags[i].src.match(scriptname)) {
                script_path = scriptTags[i].src;
                return script_path.split('?')[0].split('/').slice(0, -1).join('/');
            }
        }
        return '';
    }

    function getStartSlide() {
        var slide = 0;
        if (urlParams.has('start_at_slide')) {
            slide = parseInt(urlParams.get('start_at_slide'), 10);
        }
        return slide;
    }

    function urlJoin(url, concat) { // see http://stackoverflow.com/questions/2676178/joining-relative-urls
        function build(parts,container) {
            for (var i = 0, l = parts.length; i < l; i ++) {
                if (parts[i] == '..') {
                    container.pop();
                } else if (parts[i] == '.') {
                    continue;
                } else {
                    container.push(parts[i]);
                }
            }
        }
        var url_parts = [ ];
        build(url.split('/'),url_parts);
        build(concat.split('/'),url_parts);
        return url_parts.join('/');
    }

    function buildStoryMap(data) {
        if (!data || !data.storymap) { return; }
        var options = {
            script_path: getScriptPath(/storymap(-min)?\.js/),
            start_at_slide: getStartSlide()
        };
        var font = "stock:default";
        if(data.font_css) {
            font = data.font_css;
        }
        if(font.indexOf("stock:") == 0) {
            var font_name = font.split(':')[1];
            var base_url = urlJoin(options.script_path,"../css/fonts");
            font = urlJoin(base_url, "font." + font_name + ".css");
        } else if(!font.match('^(http|https|//)')) {
            font = urlJoin(options.script_path, font);
        }
        KLStoryMap.loadCSS(font,function(){ console.log('font loaded: ' + font);});
	    storymap = new KLStoryMap.StoryMap('storymap-embed', data, options, {
            title: onStoryMapTitle
        });
        var mapType = storymap.options.map_type;
        if(mapType && mapType.match('^zoomify.*')) {
            ga('send', 'event', 'StoryMapJS', 'zoomify', document.referrer)
        }
    }

    (function() {
        fetch(storymap_url)
            .then(response => response.json())
            .then(data => buildStoryMap(data));
    })();

    window.onresize = function(event) {
        if(storymap) {
            storymap.updateDisplay();
        }
    } 