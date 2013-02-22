(function() {
	var matches = location.search.match(/id=(\d+)/);

	if (!matches) {
		return;
	}

	var id = matches[1];

	var items = $("<table/>");
	$("body").append(items);

	var head = $("<tr/>");
	$("<th/>").text("DOI").appendTo(head);
	$("<th/>").text("Year").appendTo(head);
	$("<th/>").text("Vol").appendTo(head);
	$("<th/>").text("Page").appendTo(head);
	$("<th/>").text("Title").appendTo(head);
	items.append(head);

	var fetchCrossRefData = function(doi, item) {
		$.ajax({
			url: "http://data.crossref.org/" + doi,
			dataType: "json",
			success: function(response) {
				var article = response.feed.entry["pam:message"]["pam:article"];

				// year
				var matches = article["prism:publicationDate"].match(/^(\d+)/);
				var date = matches ? matches[1] : article["prism:publicationDate"];

				var year = $("<div/>").text(date);

				var existing = item.find(".year div");
				if (existing.text() != date) {
					existing.addClass("error");
				}

				item.find(".year").append(year);
						
				// title
				var title = $("<div/>").text(article["dc:title"]);

				var existing = item.find(".title div");
				if (existing.text().toLowerCase() != article["dc:title"].toLowerCase()) {
					existing.addClass("error");
				}

				item.find(".title").append(title);

				// volume
				var volume = $("<div/>").text(article["prism:volume"]);

				var existing = item.find(".volume div");
				if (existing.text() != article["prism:volume"]) {
					existing.addClass("error");
				}

				item.find(".volume").append(volume);

				// issue
				/*
				var issue = $("<div/>").text(article["prism:issue"]);

				var existing = item.find(".issue div");
				if (existing.text() != article["prism:issue"]) {
					existing.addClass("error");
				}

				item.find(".issue").append(issue);
				*/

				// page
				var fpage = $("<div/>").text(article["prism:startingPage"]);

				var existing = item.find(".fpage div");
				if (existing.text() != article["prism:startingPage"]) {
					existing.addClass("error");
				}

				item.find(".fpage").append(fpage);
			},
			error: function() {
				item.find(".doi").addClass("error");
			}
		});
	};

	$.ajax({
		url: "https://peerj.com/articles/" + id + ".xml",
		dataType: "xml",
		success: function(doc) {
			var nodes = doc.evaluate('//ref-list/ref/element-citation/pub-id[@pub-id-type="doi"]', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

			for (var i = 0; i < nodes.snapshotLength; i++) {
				var node = nodes.snapshotItem(i);

				var data = {
					doi: node.textContent
				}
				
				var citation = node.parentNode;

				for (var j = 0; j < citation.childNodes.length; j++) {
					var propertyNode = citation.childNodes[j];
					data[propertyNode.nodeName] = propertyNode.textContent;
				}
				
				var item = $("<tr/>");

				$("<td/>").addClass("doi").text(data.doi).appendTo(item);

				var year = $("<div/>").text(data.year);
				$("<td/>").addClass("year").append(year).appendTo(item);

				var volume = $("<div/>").text(data.volume);
				$("<td/>").addClass("volume").append(volume).appendTo(item);

				//var issue = $("<div/>").text(data.issue);
				//$("<td/>").addClass("issue").append(issue).appendTo(item);

				var fpage = $("<div/>").text(data.fpage);
				$("<td/>").addClass("fpage").append(fpage).appendTo(item);

				var title = $("<div/>").text(data["article-title"]);
				$("<td/>").addClass("title").append(title).appendTo(item);

				items.append(item);

				fetchCrossRefData(data.doi, item);
			}
		}
	});
})();