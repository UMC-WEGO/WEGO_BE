export const randomTripDto = (data) => {
  return {
    tripDates: data.travelDates,
    numberOfPeople: data.numberOfPeople,
    depatrue: data.depature,
    vehicle: data.vehicle,
    duration: data.duration,
  };
};