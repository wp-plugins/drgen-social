Object.extend = function (destination, source) {
	for (var property in source) {
		destination[property] = source[property];
	}

    return destination;
};

BeSocial = Object.extend({
	addQuery: function (params, separator, join) {
		var query = [];

		separator = separator || '=';
		join = join || '&';

		for (var param in params) {
			if (params[param]) {
				query.push(param.toString() + separator + encodeURIComponent(params[param]));
			}
		}
		return query.join(join);
	},

	addScript: function (source) {
		var script = document.createElement('script');

		script.charSet = 'utf-8';
		script.src = source;
		script.async = true;

		(document.getElementsByTagName('HEAD')[0] || document.documentElement).appendChild(script);
	},

	addCounter: function (id, count) {
		var button = document.getElementById('besocial-' + id),
			meta = document.createElement('span'),
			stat = document.createElement('span');

		meta.className = 'besocial-meta';
		meta.appendChild(document.createTextNode('\u00A0'));

		stat.className = 'besocial-stat';
		stat.appendChild(document.createTextNode(count));

		button.appendChild(meta);
		button.appendChild(stat);
		button.target = '_blank';
	},

	facebookAPI: function () {
		var urls = [];
		urls.push(this.url);
		if (this.twitter_url !== '') {
			urls.push(this.twitter_url);
		}

		this.addScript('http://api.facebook.com/restserver.php?' + this.addQuery({
			v: '1.0',
			method: 'fql.query',
			query: 'select total_count from link_stat where url in("' + urls.join('","') + '")',
			format: 'json',
			callback: 'BeSocial.facebookResponse'
		}));
	},

	facebookResponse: function (data) {
		var count = 0,
			i = data.length - 1;

		for (; i >= 0; i--) {
			count += parseInt(data[i].total_count, 10);
		}

		this.addCounter('facebook', count);
	},

	tweetmemeAPI: function () {
		this.addScript('http://api.tweetmeme.com/url_info.jsonc?' + this.addQuery({
			url: this.url,
			callback: 'BeSocial.tweetmemeResponse'
		}));
	},

	tweetmemeResponse: function (data) {
		var count = 0;

		if (data.status === 'success') {
			count = data.story.url_count || 0;
		}

		this.addCounter('twitter', count);
	},

	bitacorasAPI: function () {
		this.addScript('http://api.bitacoras.com/anotacion/' + this.addQuery({
			key: this.bitacoras_apikey,
			url: this.url,
			format: 'json',
			callback: 'BeSocial.bitacorasResponse'
		}, '/', '/'));
	},

	bitacorasResponse: function (data) {
		var count = data.data.votos || 0;
		this.addCounter('bitacoras', count);
	},

	meneameAPI: function () {
		this.addScript('http://meneame.net/api/url.php?' + this.addQuery({
			url: this.url,
			jsonp: 'BeSocial.meneameResponse'
		}));
	},

	meneameResponse: function (data) {
		if (data.status === 'OK') {
			var button = document.getElementById('besocial-meneame'),
				item = button.parentNode,
				count = 0,
				i = 0,
				j = data.data.length;

			for (; i < j; i++) {
				if (data.data[i].status === 'published' || data.data[i].status === 'queued') {
					button.href = data.data[i].url;
					this.addCounter('meneame', data.data[i].votes + data.data[i].anonymous);
					return;
				}
			}

			item.parentNode.removeChild(item);
		} else {
			this.addCounter('meneame', 0);
		}
	},

	deliciousAPI: function () {
		this.addScript('http://feeds.delicious.com/v2/json/urlinfo/data?' + this.addQuery({
			url: this.url,
			callback: 'BeSocial.deliciousResponse'
		}));
	},

	deliciousResponse: function (data) {
		var count = 0;
		if (data.length > 0) {
			count = data[0].total_posts;
		}
		this.addCounter('delicious', count);
	},


	buzzAPI: function () {
		this.addScript('http://www.google.com/buzz/api/buzzThis/buzzCounter?' + this.addQuery({
			url: this.url,
			callback: 'BeSocial.buzzResponse'
		}));
	},

	buzzResponse: function (data) {
		var count = 0;
		if (data[this.url] > 0) {
			count = data[this.url];
		}
		this.addCounter('buzz', count);
	},

	init: function () {
		this.url = window.location.href.replace(/(?:#.*)?$/, '');

		if (this.twitter_active === '1') {
			this.tweetmemeAPI();
		}
		if (this.facebook_active === '1') {
			this.facebookAPI();
		}
		if (this.bitacoras_active === '1') {
			this.bitacorasAPI();
		}
		if (this.meneame_active === '1') {
			this.meneameAPI();
		}
		if (this.delicious_active === '1') {
			this.deliciousAPI();
		}
		if (this.reddit_active === '1') {
			this.redditAPI();
		}
		if (this.buzz_active === '1') {
			this.buzzAPI();
		}
	}
}, BeSocial);

BeSocial.init();
