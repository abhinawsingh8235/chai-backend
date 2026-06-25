import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// GET /api/v1/healthcheck
// Server chal raha hai ya nahi yeh check karne ke liye
// Koi auth nahi chahiye — public route hai
const healthcheck = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    status: "OK",
                    message: "Server is up and running",
                    timestamp: new Date().toISOString(),
                    uptime: `${Math.floor(process.uptime())} seconds`,
                },
                "Health check passed"
            )
        )
})

export { healthcheck }