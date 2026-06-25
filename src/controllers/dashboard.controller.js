import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// ─── 1. GET CHANNEL STATS ─────────────────────────────────────────────────────
// GET /api/v1/dashboard/stats
// Returns: total videos, total views, total subscribers, total likes
const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user._id

    // ── Stat 1: Total subscribers ──────────────────────────────────────────────
    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId,
    })

    // ── Stats 2, 3, 4: Video-related stats via aggregation ────────────────────
    // Single pipeline pe saari video stats ek saath nikalo
    const videoStats = await Video.aggregate([
        // Stage 1: sirf is channel ke videos
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId),
            },
        },
        // Stage 2: har video ke likes laao
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "videoLikes",
            },
        },
        // Stage 3: group karo — total videos, total views, total likes
        {
            $group: {
                _id: null,                                      // sab ek group mein
                totalVideos: { $sum: 1 },                       // har document = 1 video
                totalViews: { $sum: "$views" },                 // views field ka sum
                totalLikes: { $sum: { $size: "$videoLikes" } }, // har video ke likes count ka sum
            },
        },
        // Stage 4: _id field hatao response se
        {
            $project: {
                _id: 0,
                totalVideos: 1,
                totalViews: 1,
                totalLikes: 1,
            },
        },
    ])

    // Agar channel ne abhi koi video upload nahi ki
    const {
        totalVideos = 0,
        totalViews = 0,
        totalLikes = 0,
    } = videoStats[0] || {}

    const stats = {
        totalSubscribers,
        totalVideos,
        totalViews,
        totalLikes,
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, stats, "Channel stats fetched successfully")
        )
})

// ─── 2. GET CHANNEL VIDEOS ────────────────────────────────────────────────────
// GET /api/v1/dashboard/videos
// Returns: all videos of logged-in channel with likes count + publish status
const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user._id

    const videos = await Video.aggregate([
        // Stage 1: sirf is channel ke videos
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId),
            },
        },
        // Stage 2: har video ke likes count nikalo
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            },
        },
        // Stage 3: har video ke comments count bhi nikalo
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments",
            },
        },
        // Stage 4: useful fields add karo
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                commentsCount: { $size: "$comments" },
            },
        },
        // Stage 5: unnecessary arrays hatao
        {
            $project: {
                likes: 0,
                comments: 0,
            },
        },
        // Stage 6: newest video pehle
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
                    totalVideos: videos.length,
                    videos,
                },
                "Channel videos fetched successfully"
            )
        )
})

export { getChannelStats, getChannelVideos }