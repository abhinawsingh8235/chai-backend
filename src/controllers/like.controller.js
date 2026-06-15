import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// ─── 1. TOGGLE LIKE ON VIDEO ──────────────────────────────────────────────────
// POST /api/v1/likes/toggle/v/:videoId
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    // Check if like already exists for this user + video combo
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id,
    })

    if (existingLike) {
        // Already liked → remove it (unlike)
        await Like.findByIdAndDelete(existingLike._id)
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Video unliked"))
    }

    // Not liked yet → create like
    await Like.create({
        video: videoId,
        likedBy: req.user._id,
    })

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true }, "Video liked"))
})

// ─── 2. TOGGLE LIKE ON COMMENT ────────────────────────────────────────────────
// POST /api/v1/likes/toggle/c/:commentId
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id,
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Comment unliked"))
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user._id,
    })

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true }, "Comment liked"))
})

// ─── 3. TOGGLE LIKE ON TWEET ──────────────────────────────────────────────────
// POST /api/v1/likes/toggle/t/:tweetId
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id,
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Tweet unliked"))
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user._id,
    })

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true }, "Tweet liked"))
})

// ─── 4. GET ALL LIKED VIDEOS OF CURRENT USER ──────────────────────────────────
// GET /api/v1/likes/videos
const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        // Stage 1: only likes by current user that are on a video
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true, $ne: null },
            },
        },
        // Stage 2: join with videos collection to get video details
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    // Only return published videos
                    { $match: { isPublished: true } },
                    // Populate video owner info
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
                        $addFields: { owner: { $first: "$owner" } },
                    },
                ],
            },
        },
        // Stage 3: unwind — flatten the video array (each like has 1 video)
        {
            $unwind: "$video",
        },
        // Stage 4: reshape the output — return video object directly
        {
            $replaceRoot: { newRoot: "$video" },
        },
        // Stage 5: newest liked first
        {
            $sort: { createdAt: -1 },
        },
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideos,
                "Liked videos fetched successfully"
            )
        )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
}