import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return this.store.findRecord('rental', params.rental_id);
  },
  actions: {
    update(rental, params) {
      Object.keys(params).forEach(function(key) {
        if(params[key]!==undefined) {
          rental.set(key,params[key]);
        }
      });
      rental.save();
      this.transitionTo('index');
    },
    destroyRental(rental) {
      var review_deletions = rental.get('reviews').map(function(review) {
        return review.destroyRecord();
      });
      Ember.RSVP.all(review_deletions).then(function() {
        return rental.destroyRecord();
      });
      this.transitionTo('index');
    },
    // It looks like we're saving redundantly, but really we are saving the review to the review section of our json document then we have to save it within that specific rental.
    // there is an issue with the response time it takes to go from ember -> firebase, so we need to use promises to prevent the data from being stored improperly
    saveReview(params) {
      var newReview = this.store.createRecord('review', params); // we store the review in the db (in review section)
      var rental = params.rental; // take rental passed in params, save as variable 'rental'
      rental.get('reviews').addObject(newReview); // we add our newReview into that specific rentals review list
      newReview.save().then(function() { // we save the review into that list, then save the rental
        return rental.save(); // Question: Why are we saving the rental here? Is it not already saved?
      });
      this.transitionTo('rental', rental); // direct back to the rental route
    },
    destroyReview(review) {
      review.destroyRecord();
      this.transitionTo('index');
    }
  }
});
