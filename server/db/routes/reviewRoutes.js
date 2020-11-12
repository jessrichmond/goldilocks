const { Router } = require('express');
const {
  Listing,
  Availability,
  Reviews
} = require('../index');
const reviewRouter = Router();

// TODO: GET ALL REVIEWS: Get all of a user's reviews about them as a GUEST or HOST

reviewRouter
  .get('/getReviews', async (req, res) => {
    const { listingId } = req.body.params;
    const reviews = await Listing.findAll({
      where: {
        id: listingId,
      }
    })
      .then(results => {
        const userId = results.map(info => {
          return info.dataValues.user_id;
        })
        const result = Reviews.findAll({
          order: [
            ['updatedAt', 'DESC'],
          ],
          where: {
            revieweeId: userId,
          },
        })
        return result;
      })
      .catch(err => console.warn(err.message))
    console.info(reviews);
    res.send(reviews);
  })

// TODO: Write a review
reviewRouter
  .post('/newReview', async (req, res) => {
    let { guestRating, hostRating, guestReview, hostReview, isComplete, userId, hostId, avyId } = req.body.params;
    await Availability.findOne({
      where: {
        guest_id: Number(userId)
      }
    })
      .then(({ dataValues }) => {
        hostId = dataValues.host_id;
        avyId = dataValues.id;

        Reviews.create({
          guestRating: guestRating,
          hostRating: hostRating,
          hostComments: hostReview,
          guestComments: guestReview,
          completed: isComplete,
          reviewerId: userId,
          revieweeId: hostId,
          availabilityId: avyId,
        })
          .then(() => {
            res.status(200).send('Review submitted');
          })
          .catch(err => {
            res.status(401).send('You must complete a swap with this user to leave a review.')
          })
      })
      .catch(err => res.send(err.message));

  });

module.exports = {
  reviewRouter,
};
