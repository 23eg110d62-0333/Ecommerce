import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { getSizeRecommendation } from "../services/sizeRecommendation.service";

/**
 * Size Recommendation Controller
 * Handles AI size recommendation requests
 */

export async function getSizeRecommendationHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { height, weight, unit, bodyType, fitPreference } = req.body;

    // Validate required fields
    if (!height || !weight || !unit || !bodyType || !fitPreference) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: height, weight, unit, bodyType, fitPreference",
      });
      return;
    }

    // Validate unit
    if (!["metric", "imperial"].includes(unit)) {
      res.status(400).json({
        success: false,
        message: "Unit must be either 'metric' or 'imperial'",
      });
      return;
    }

    // Validate bodyType
    if (!["slim", "regular", "athletic", "curvy"].includes(bodyType)) {
      res.status(400).json({
        success: false,
        message: "Body type must be one of: slim, regular, athletic, curvy",
      });
      return;
    }

    // Validate fitPreference
    if (!["slim", "regular", "loose"].includes(fitPreference)) {
      res.status(400).json({
        success: false,
        message: "Fit preference must be one of: slim, regular, loose",
      });
      return;
    }

    // Get recommendation
    const recommendation = getSizeRecommendation({
      height: Number(height),
      weight: Number(weight),
      unit,
      bodyType,
      fitPreference,
    });

    res.json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate size recommendation",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
