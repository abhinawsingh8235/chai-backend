import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// ─── 1. CREATE TWEET ──────────────────────────────────────────────────────────
// POST /api/v1/tweets
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    if (!content?.trim()) {
        throw new ApiError(400, "Tweet content is required")
    }

    if (content.trim().length > 280) {
        throw new ApiError(400, "Tweet content cannot exceed 280 characters")
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user._id,
    })

    const createdTweet = await Tweet.findById(tweet._id).populate(
        "owner",
        "username avatar fullName"
    )

    if (!createdTweet) {
        throw new ApiError(500, "Failed to create tweet, please try again")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdTweet, "Tweet created successfully"))
})

// ─── 2. GET ALL TWEETS OF A USER ─────────────────────────────────────────────
// GET /api/v1/tweets/user/:userId
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }

    // User exist karta hai ya nahi
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const tweets = await Tweet.aggregate([
        // Stage 1: is user ke saare tweets
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        // Stage 2: owner ki details populate karo
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            fullName: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
            },
        },
        // Stage 3: har tweet ke likes count + isLiked
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes",
            },
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user._id, "$likes.likedBy"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        // Stage 4: likes array remove karo, count hi kaafi hai
        {
            $project: { likes: 0 },
        },
        // Stage 5: newest tweet pehle
        {
            $sort: { createdAt: -1 },
        },
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    tweetsCount: tweets.length,
                    tweets,
                },
                "User tweets fetched successfully"
            )
        )
})

// ─── 3. UPDATE TWEET ──────────────────────────────────────────────────────────
// PATCH /api/v1/tweets/:tweetId
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId")
    }

    if (!content?.trim()) {
        throw new ApiError(400, "New tweet content is required")
    }

    if (content.trim().length > 280) {
        throw new ApiError(400, "Tweet content cannot exceed 280 characters")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    // Sirf owner hi update kar sakta hai
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this tweet")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $set: { content: content.trim() } },
        { new: true }
    ).populate("owner", "username avatar fullName")

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))
})

// ─── 4. DELETE TWEET ──────────────────────────────────────────────────────────
// DELETE /api/v1/tweets/:tweetId
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    // Sirf owner hi delete kar sakta hai
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this tweet")
    }

    await Tweet.findByIdAndDelete(tweetId)

    // Tweet ke saare likes bhi delete karo
    await Like.deleteMany({ tweet: tweetId })

    return res
        .status(200)
        .json(new ApiResponse(200, { tweetId }, "Tweet deleted successfully"))
})

export { createTweet, getUserTweets, updateTweet, deleteTweet }
