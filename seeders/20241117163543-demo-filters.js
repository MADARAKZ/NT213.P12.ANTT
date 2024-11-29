'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Filters', [
      { id: 1, name: 'bath sun', category: 'amenities', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'spa', category: 'amenities', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'free parking', category: 'amenities', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: 'airport check', category: 'amenities', createdAt: new Date(), updatedAt: new Date() },
      { id: 5, name: 'internet', category: 'amenities', createdAt: new Date(), updatedAt: new Date() },
      { id: 6, name: 'pool overview', category: 'amenities', createdAt: new Date(), updatedAt: new Date() },
      { id: 7, name: 'Khu vực ăn uống', category: 'amenities', createdAt: new Date(), updatedAt: new Date() },
      { id: 8, name: 'Bar', category: 'amenities', createdAt: new Date(), updatedAt: new Date() },
      { id: 9, name: 'Cafes', category: 'amenities', createdAt: new Date(), updatedAt: new Date() },
      { id: 10, name: 'Giữ hành lý', category: 'amenities', createdAt: new Date(), updatedAt: new Date() },
      { id: 11, name: 'Báo thức', category: 'amenities', createdAt: new Date(), updatedAt: new Date() },
      { id: 12, name: 'Phòng họp', category: 'amenities', createdAt: new Date(), updatedAt: new Date() },
      { id: 13, name: 'view city', category: 'amenities', createdAt: new Date(), updatedAt: new Date() },
      { id: 14, name: 'smoking area', category: 'amenities', createdAt: new Date(), updatedAt: new Date() },
      { id: 15, name: 'Phòng tắm riêng tư', category: 'amenities', createdAt: new Date(), updatedAt: new Date() },
      { id: 16, name: 'Máy lạnh', category: 'amenities', createdAt: new Date(), updatedAt: new Date() },
      { id: 17, name: 'Lễ tân 24/7', category: 'amenities', createdAt: new Date(), updatedAt: new Date() },

      // Room amenities filters (id từ 18 đến 23)
      { id: 18, name: 'air conditioning', category: 'room_amenity', createdAt: new Date(), updatedAt: new Date() },
      { id: 19, name: 'washing machine', category: 'room_amenity', createdAt: new Date(), updatedAt: new Date() },
      { id: 20, name: 'TV', category: 'room_amenity', createdAt: new Date(), updatedAt: new Date() },
      { id: 21, name: 'bathtub', category: 'room_amenity', createdAt: new Date(), updatedAt: new Date() },
      { id: 22, name: 'fridge', category: 'room_amenity', createdAt: new Date(), updatedAt: new Date() },
      { id: 23, name: 'balcony', category: 'room_amenity', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Filters', null, {});
  }
};
