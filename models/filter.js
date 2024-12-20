'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Filter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Filter.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Đánh dấu là khóa chính
      autoIncrement: true, // Tùy chọn nếu cần tự động tăng
    },
    name: DataTypes.STRING,
    category: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Filter',
    tableName: 'Filters', // Đảm bảo tên bảng đúng
    timestamps: false, // Nếu không cần timestamps
  });
  return Filter;
};
