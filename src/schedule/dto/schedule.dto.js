export const mapAuthenticatedMission = (mission) => {
    return {
        missionId: mission.mission_id,
        tripId: mission.trip_id,
        userId: mission.user_id,
        evidence: mission.evidence,
        authenticatedAt: mission.authenticated_at,
    };
};

export const mapMissionAuthResult = (result) => {
    return {
        id: result.id,
        tripId: result.tripId,
        missionId: result.missionId,
        userId: result.userId,
        evidence: result.evidence,
    };
};
