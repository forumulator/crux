$(document).ready(function () {
	console.log("Document ready");
	$.get(chrome.extension.getURL('/popover.html'), function(data) {
	    $($.parseHTML(data)).appendTo('body');
	});

	var GENRE = "Genre", FF_BOOK = "/c/", brLen = 11, maxShort = 300,
	moreText = "   ...more", lessText = "(less)";

	function attachMoreToggleHandler($moreToggle) {
		$moreToggle.show();
		var $par = $moreToggle.parent(), 
		$more = $par.children(".more-content");
		$moreToggle.click(function(event) {
			event.stopPropagation();
			var data = false;
			if ($more.data("more") == false) {
				// Less content shown
				$more.show();
				$(this).text(lessText);
				data = true;
			}
			else {
				$more.hide();
				$(this).text(moreText);
				data = false;
			}
			$more.data("more", data);
			return false;
		});
	}

	function insertBlurb($div, blurbText) {
		var idx = blurbText.lastIndexOf(GENRE);
		var genre = blurbText.slice(idx), blurb = blurbText.slice(0, idx);
		$div.find(".popover-content .genre").html(genre); 
		var bLess = "", bMore = "";
		if (blurb.length - brLen > maxShort) {
			bLess = blurb.slice(0, maxShort);
			bMore = blurb.slice(maxShort);
		}
		else {
			bLess = blurb;
		}
		$div.find(".popover-content .initial-content").html(bLess);
		if (bMore !== "") {
			$div.find(".popover-content .more-content").html(bMore);
			$div.find(".more-toggle").each(function () {
				attachMoreToggleHandler($(this));
			});
		}
		return true;
	}

	function getBlurb($html) {
		$html.find(".ff .blurb a[target='_blank']").remove();
		return $html.find(".ff .blurb").html();
	}

	function getTitle($html) {
		var title = "", $name;
		($name = $html.find(".ff h1[itemprop='name']")).length &&
		(title = $name.text());
		return title;
	}

	function getAuthor($html) {
		var $authDiv = $html.find("span[itemprop='author']");
		if ($authDiv.length) {
			return $authDiv.find("a").text();
		}
		else return "";
	}

	function fillBlurb($ib, url) {
		var retValue = true;
		if ($ib.find(".popover-title .name").text() == "") {
			$.ajax({
				url: url,
				cache: true,
				success: function (data) {
					var $html = $($.parseHTML(data));
					var name = getTitle($html), blurb = getBlurb($html), 
					author = getAuthor($html);

					$ib.find(".popover-title .name").text(name);
					$ib.find(".popover-title .author").text(author);
					
					insertBlurb($ib, blurb);
				},
				error: function() {
					console.log("Error fetching data from: " + url);
					retValue = false;
				}
			});
		}
		return retValue;
	}

	function isBookCover($a) {
		if ($a == undefined) {
			return false;
		}
		else if ($a.parent().hasClass("sectionright")) {
			return true;
		}
		else {
			var re = new RegExp("^\/[a-z]\/$");
			if ($a.children("img").length > 0 && 
				re.test($a.attr("href").slice(0, 3))) {
				return true;
			}
			else {
				return false;
			}			
		}
	}

	function attachInstaBlurbHandler($div) {
		var $activeBlurb;
		$div.css({"position": "relative"});
		$div.on("mouseover", function () {
			console.log("On mouseover");
			if ($(this).children(".insta-blurb").length == 0) {
				var $sample = $(".popover.sample").eq(0);
				$(this).append($sample.clone().
					removeClass("sample").addClass("insta-blurb"));
			}
			if ($activeBlurb != undefined)
				$activeBlurb.hide();			
			var $ib = $(this).children(".insta-blurb").eq(0),
			url = $(this).attr("href");
			$ib.fadeIn("fast");
			$activeBlurb = $ib;
			if (!fillBlurb($ib, url)) {
				return false;
			}
		}).on("mouseleave", function () {
			console.log("mouseleave");
			var $ib = $(this).children(".insta-blurb").eq(0);
			$ib.fadeOut();
		});
	}

	function InstaBlurb() {
		console.log("Attaching insta-blurb handlers...");
		$("a").each(function() {
			if (isBookCover($(this))) {
				attachInstaBlurbHandler($(this));
			}
		});
	}

	InstaBlurb();

});
