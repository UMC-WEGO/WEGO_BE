import express from "express";
import authenticateToken from "../../config/jwt.middleware.js";
import { createRandomTrip, deleteUpcomingTrip, getPopularMissionController, getUpcomingTripsController, savePopularMissionController, saveTripController } from "./home.controller.js";

const router = express.Router();

router.post('', authenticateToken, createRandomTrip);
router.post('/home/save-trip', authenticateToken, saveTripController);
router.get("/home/upcoming-trips", authenticateToken, getUpcomingTripsController);
router.delete("/home/upcoming-trips/:tripId", authenticateToken, deleteUpcomingTrip);
router.get("/home/popular-missions", authenticateToken, getPopularMissionController);
router.post("/home/savePopularMission/:missionId", authenticateToken, savePopularMissionController);

export default router;