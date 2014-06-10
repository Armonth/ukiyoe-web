module.exports = function(ukiyoe) {

var Image = ukiyoe.db.models("Image");
var Source = ukiyoe.db.models("Source");
var Artist = ukiyoe.db.models("Artist");

var numPerMap = 1000;

var renderSitemap = function(res, sites) {
	res.header("Content-Type", "application/xml");
	res.render("sitemaps/show", {
		sites: sites
	});
};

return {
	index: function(req, res) {
        Image.count().exec(function(err, total) {
			var sitemaps = [
				{ url: site.genURL(req.i18n.getLocale(),
					"/sitemap-sources.xml") },
				{url: site.genURL(req.i18n.getLocale(),
					"/sitemap-artists.xml") }
			];

			for ( var i = 0; i < total; i += numPerMap ) {
				sitemaps.push({
					url: site.genURL(req.i18n.getLocale(),
						"/sitemap-search-" + i + ".xml")
				});
			}

			res.header("Content-Type", "application/xml");
			res.render("sitemaps/index", {
				sitemaps: sitemaps
			});
        });
	},

	search: function(req, res) {
        Image.find().limit(numPerMap).skip(req.params.start).exec(function(err, images) {
			var sites = images.map(function(item) {
				return {
					url: item.getURL(req.i18n.getLocale()),
					image: item.file
				};
			});

			renderSitemap(res, sites);
		});
	},

	sources: function(req, res) {
        Source.find({count: {$gt: 0}}).exec(function(err, sources) {
    		var sites = sources.map(function(source) {
				return {
					url: source.getURL(req.i18n.getLocale())
				};
    		});

    		// Add in the Index Page
    		sites.push({
    			url: site.genURL(req.i18n.getLocale(), "/")
    		});

    		// Add in the Sources Page
    		sites.push({
    			url: site.genURL(req.i18n.getLocale(), "/sources")
    		});

    		// Add in the About Page
    		sites.push({
    			url: site.genURL(req.i18n.getLocale(), "/about")
    		});

    		renderSitemap(res, sites);
        });
	},

	artists: function(req, res) {
        Artist.find({printCount: {$gt: 0}}).exec(function(err, artists) {
    		var sites = artists.map(function(artist) {
				return {
					url: artist.getURL(req.i18n.getLocale())
				};
    		});

    		renderSitemap(res, sites);
        });
	}
};

};