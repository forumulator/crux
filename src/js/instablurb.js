$(document).ready(function () {
	console.log("Document ready");
	$.get(chrome.extension.getURL('/popover.html'), function(data) {
	    $($.parseHTML(data)).appendTo('body');
	});

	var GENRE = "Genre", brLen = 11, maxShort = 300,
	moreText = "   ...more", lessText = "(less)";

	function attachMoreToggleHandler($moreToggle) {
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
				$(this).show();
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

	function getAuthor() {
		var $authDiv = $(".ff h1[itemprop='name']");
		if ($authDiv.length) {
			return $authDiv.text();
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
					author = getAuthor();
					console.log(blurb);
					$ib.find(".popover-title .name").text(name);
					$ib.find(".popover-title .author").text(author);
					insertBlurb($ib, blurb);
				},
				error: function() {
					retValue = false;
				}
			});
		}
		return retValue;
	}

	function InstaBlurb () {
		console.log("Attaching handlers...");
		$(".ff .sectionright a")
		.on("mouseover", function () {
			console.log("On mouseover");
			if ($(this).children(".insta-blurb").length == 0) {
				var $sample = $(".popover.sample").eq(0);
				$(this).append($sample.clone().
					removeClass("sample").addClass("insta-blurb"));
			}
			var $ib = $(this).children(".insta-blurb").eq(0),
			url = $(this).attr("href");
			if (!fillBlurb($ib, url)) {
				return false;
			}
			$ib.fadeIn("fast");
		}).on("mouseleave", function () {
			console.log("mouseleave");
			var $ib = $(this).children(".insta-blurb").eq(0);
			$ib.fadeOut();
		});
	}

	function setImagesRelative () {
		$(".sectionright > a").css({"position": "relative"});
		return true;
	}

	setImagesRelative();
	InstaBlurb();

});
