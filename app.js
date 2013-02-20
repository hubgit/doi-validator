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
	$("<th/>").text("Title").appendTo(head);
	items.append(head);

	var fetchCrossRefData = function(doi, item) {
		$.ajax({
			url: "http://data.crossref.org/" + doi,
			dataType: "json",
			success: function(response) {
				var article = response.feed.entry["pam:message"]["pam:article"];

				var matches = article["prism:publicationDate"].match(/^(\d+)/);
				var date = matches ? matches[1] : article["prism:publicationDate"];

				var year = $("<div/>").text(date);

				var existing = item.find(".year div");
				if (existing.text() != date) {
					existing.addClass("error");
				}

				item.find(".year").append(year);
						
				var title = $("<div/>").text(article["dc:title"]);

				var existing = item.find(".title div");
				if (existing.text().toLowerCase() != article["dc:title"].toLowerCase()) {
					existing.addClass("error");
				}

				item.find(".title").append(title);

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

				var title = $("<div/>").text(data["article-title"]);
				$("<td/>").addClass("title").append(title).appendTo(item);

				items.append(item);

				fetchCrossRefData(data.doi, item);
			}
		}
	});
})();