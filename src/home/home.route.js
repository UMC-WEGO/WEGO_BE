import express from "express";
import authenticateToken from "../../config/jwt.middleware.js";
import { createRandomTrip, deleteUpcomingTrip, getPopularMissionController, getUpcomingTripsController, savePopularMissionController, saveTripController } from "./home.controller.js";

const router = express.Router();

router.post('', authenticateToken, createRandomTrip);
router.post('/save-trip', authenticateToken, saveTripController);
router.get("/upcoming-trips", authenticateToken, getUpcomingTripsController);
router.delete("/upcoming-trips/:tripId", authenticateToken, deleteUpcomingTrip);
router.get("/popular-missions", authenticateToken, getPopularMissionController);
router.post("/savePopularMission/:missionId", authenticateToken, savePopularMissionController);

export default router;