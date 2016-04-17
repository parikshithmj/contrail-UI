Backbone.Model.prototype.idAttribute = '_id';

// Backbone Model

var Traffic = Backbone.Model.extend({
	defaults: {
		timestamp :'',
		destination_ip: '',
		destination_vn: '',
		direction_ingress :'',
		protocol:'',
		source_ip: '',
		source_vn:'',
		source_port:'',
		sum_bytes_kb:'',
		sum_packets:''
	}
});

// Backbone Collection

var Traffics = Backbone.Collection.extend({
	url: 'http://localhost:3000/traffics'
});

// instantiate a Collection

var traffics = new Traffics();

// Backbone View for one traffic

var TrafficView = Backbone.View.extend({
	model: new Traffic(),
	tagName: 'tr',
	initialize: function() {
		this.template = _.template($('.traffic-list-template').html());
	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
});

// Backbone View for all traffic

var TrafficsView = Backbone.View.extend({
	model: traffics,
	el: $('.traffic-list'),
	initialize: function() {
		var self = this;
		this.model.on('add', this.render, this);
		this.model.on('reset', this.render, this);
		this.model.on('change', function() {
			setTimeout(function() {
				self.render();
			}, 30);
		},this);
		setInterval(function(){
 		traffics.fetch();
			},3000);
		this.model.fetch({
			success: function(response) {
				_.each(response.toJSON(), function(item) {
					console.log('Successfully GOT data with _id: ' + item._id);
				})
			},
			error: function() {
				console.log('Failed to get data!');
			}
		});
	},
	render: function() {
		var self = this;
		this.$el.html('');
		_.each(this.model.toArray(), function(traffic) {
			self.$el.append((new TrafficView({model: traffic})).render().$el);
		});
		return this;
	}
});

var trafficsView = new TrafficsView();

