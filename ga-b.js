var cybercomTracking = new Object();

(function(){

	var debug = false;// TODO: set this to false for production environment
	var prefix = 'CybercomTracking: ';
	var dataKey = 'cybercomEvent';
	var initVal = 'init';
	var undef = 'undefined';

	function log(msg){
		if (debug || location.hash.indexOf('cybercomTracking') >= 0) console.log(prefix + msg);
	}

	function getJqElem(selector){
		try {
			var elem = $(selector);
			if (typeof(elem) === undef) return null;
			if (elem == null) return null;
			if (typeof(elem.size) === undef) return null;
			if (elem.size() <= 0) return null;
			if (elem.data(dataKey) == initVal) { log('already initialized'); return null; }
			elem.data(dataKey, initVal);
			log('found element: tagName=' + elem[0].tagName + ' id=' + elem.attr('id') + ' class=' + elem.attr('class') + ' href=' + elem.attr('href'));
			if (debug && elem[0].tagName.toLowerCase() == 'a') elem.css('background-color', 'yellow');// TODO: debug info, can be removed
			return elem;
		}
		catch (ex) {
			log(ex.toString());
		}
		return null;
	}

	function trackEvent(domElem, category, action, label) {
		try {
			var jqElem = $(domElem);
			var cssClass = '' + jqElem.attr('class');
			var startPos = cssClass.indexOf('{');
			var endPos = cssClass.indexOf('}');
			if (startPos >= 0 && endPos > startPos)
			{
				var json = cssClass.substr(startPos, endPos - startPos + 1);
				var jsonObj = jQuery.parseJSON(json);
				category = jsonObj.category;
				action = jsonObj.action;
				label = jsonObj.label;
			}
			if(typeof(_gaq) === undef)
				log('_gaq is undefined, CANNOT log');
			else{
				log('log event\ncategory=' + category + '|action=' + action + '|label=' + label);
				_gaq.push(['_trackEvent', category, action, label]);
			}
			if (debug) return confirm('_trackEvent:\n' + category + ',' + action + ',' + label);// TODO: debug info, can be removed
		}
		catch (ex) {
			log(ex.toString());
		}
		return true;
	}




	cybercomTracking.attachEvents = function (selector) {
		log('attaching events to "' + selector + '"');

		var jqRoot = $(selector);

		jqRoot.find('a[href$=".mp4"], a[href$=".mov"]').each(function() {
			var jqElem = getJqElem(this);
			if (jqElem == null) return;
			var url = jqElem.attr('href');
			jqElem.click(function() {
				//return trackEvent(this, 'download movie', escape(url), escape(location.pathname));
				return trackEvent(this, 'download movie', url, location.pathname);
			});
		});

		jqRoot.find('a[href$=".pdf"]').each(function() {
			var jqElem = getJqElem(this);
			if (jqElem == null) return;
			var url = jqElem.attr('href');
			jqElem.click(function() {
				//return trackEvent(this, 'download pdf', escape(url), escape(location.pathname));
				return trackEvent(this, 'download pdf', url, location.pathname);
			});
		});

		jqRoot.find('a[href$=".ppt"]').each(function() {
			var jqElem = getJqElem(this);
			if (jqElem == null) return;
			var url = jqElem.attr('href');
			jqElem.click(function() {
				//return trackEvent(this, 'download ppt', escape(url), escape(location.pathname));
				return trackEvent(this, 'download ppt', url, location.pathname);
			});
		});

		jqRoot.find('a[href^="mailto"]').each(function() {
			var jqElem = getJqElem(this);
			if (jqElem == null) return;
			var url = jqElem.attr('href');
			jqElem.click(function() {
				//return trackEvent(this, 'mailto click', escape(url), escape(location.pathname));
				return trackEvent(this, 'mailto click', url, location.pathname);
			});
		});

        var utm_source = "bona.com";
        var utm_medium = "web";

		jqRoot.find('a[href^="http://"], a[href^="https://"]').each(function() {
			var jqElem = getJqElem(this);
			if (jqElem == null) return;
			var url = jqElem.attr('href');
			var host = location.host;
			if (url.replace('http://', '').replace('https://', '').indexOf(host) < 0) {
                if (url.indexOf("mybonahome.com") >= 0) {
                    var utm_content = "";
                    if (jqElem.parents('.menu-primary-container').size() > 0) {
                        utm_content = "MainNav_";
                    }
                    else if (jqElem.parents('.footer').size() > 0) {// changed from #FooterArea
                        utm_content = "Footer_";
                        var h3 = jqElem.parent().siblings('h3');
                        if (h3 != null && h3.size() > 0) {
                        	utm_content += $.trim(h3.text()) + "_";
						}
                    }
                    else {
                        utm_content = "Content_";
                    }
                    var a_title = jqElem.attr('title');
                    if (a_title != null && a_title != '' && a_title.length > 0) {
                        utm_content += $.trim(a_title);
                    }
                    else {
                        utm_content += $.trim(jqElem.text());
                    }

                    var first = url.indexOf("?") > 0 ? "&" : "?";
                    jqElem.attr('href', url + first
                        + "utm_source=" + escape(utm_source)
                        + "&utm_medium=" + escape(utm_medium)
                        + "&utm_content=" + escape(utm_content));
                }
				jqElem.click(function() {
					//return trackEvent(this, 'outbound click', escape(url), escape(location.pathname));
                    return trackEvent(this, 'outbound click', url, location.pathname);// dont escape these
				});
			}
		});

		jqRoot.find('.track-click').each(function() {
			var jqElem = getJqElem(this);
			if (jqElem == null) return;
			jqElem.click(function() {
				//return trackEvent(this, 'custom click', '', escape(location.pathname));
				return trackEvent(this, 'custom click', '', location.pathname);
			});
		});

		jqRoot.find('form').each(function() {
			var jqElem = getJqElem(this);
			if (jqElem == null) return;
			var url = jqElem.attr('action');
			jqElem.submit(function() {
				//return trackEvent(this, 'form submit', escape(url), escape(location.pathname));
				return trackEvent(this, 'form submit', url, location.pathname);
			});
		});
	}

	if(typeof($) === undef){
		log('no jquery found ($ is undefined), custom GA tracking not initialized');
	}
	else{
		$(document).ready(function($){
			log('document.ready');
			log('typeof(_gaq) = ' + typeof(_gaq));


			if (debug) $('form').addClass('dummy-class-before').addClass('{"category":"test"}').addClass('dummy-class-after');
			if (debug) $('#btnSearch').addClass('track-click').addClass('{"category":"search store","action":"click","label":"city"}');
			cybercomTracking.attachEvents('body');
		});
	}
})();
