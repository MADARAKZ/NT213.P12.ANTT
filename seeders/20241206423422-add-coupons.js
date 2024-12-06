"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Coupons", [
      {
        code: "WELCOME10",
        percent: 10,
        quantities: 10,
        begin: new Date("2024-12-01"),
        end: new Date("2024-12-31"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: "HOLIDAY50",
        percent: 50,
        quantities: 50,
        begin: new Date("2024-12-10"),
        end: new Date("2024-12-25"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: "NEWYEAR20",
        percent: 20,
        quantities: 200,
        begin: new Date("2024-12-20"),
        end: new Date("2025-01-10"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: "EXPIRED50",
        percent: 50,
        quantities: 10,
        begin: new Date("2024-10-01"),
        end: new Date("2024-11-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Coupons", null, {});
  },
};
