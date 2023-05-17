const User = require("../schema/user.schema");

module.exports.getUsersWithPostCount = async (req, res) => {
  try {
    let page = !req.query?.page ? Number(req.query.page) : 10;
    let limit = !req.query?.limit ? Number(req.query.limit) : 10;

    let count = await User.find().count(); 
    const data = await User.aggregate([
      {
        $match: {
        }
      },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'userId',
          as: 'output_post'
        }
      },

      { "$facet": {
        "users": [
          {
            $project: {
              _id: 1,
              name: 1,
              posts: {$size:"$output_post"}
            }},
        { "$skip": limit*(page-1) },
          { "$limit": limit },
        ],
        "pagination": [
          { $count: "totalDocs"},
          {$addFields:{limit: limit}},
          {$addFields:{page: page}},
          {$addFields:{totalPages: Math.ceil(count/limit)}},
          {$addFields:{pagingCounter: limit*(page-1)+1}},
          {$addFields:{hasPrevPage: (page > 1 ? true : false) }},
          {$addFields:{hasNextPage: (page >=(count/limit) ? false :true) }},
          {$addFields:{prevPage: (page <= 1 ? null : page-1)}},
          {$addFields:{nextPage: (page >=(count/limit) ? null :page+1)}}  
        ]
      }}
    ])

    result = {"data":{"users":data[0]["users"],"pagination":data[0]["pagination"][0]}}
    res.status(200).json(result);
  } catch (error) {
    res.send({ error: error.message });
  }
};
