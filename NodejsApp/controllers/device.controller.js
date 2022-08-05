require("dotenv").config();

const { INTERNAL_SERVER_ERROR_CODE, BAD_REQUEST_CODE, INVALID_REPLICATE_NUMBER } = require("../constants/error");
const { dbRun, dbAll } = require("../models/database");
const { uniqueId, renameObjectKey, logError, handler } = require("../utils")
const deviceModel = require("../models/device.model");

class DeviceController {
	handleErrCreate = async (id) => {
		const getDevice = `SELECT * FROM DEVICE WHERE ID = ?`;
		const device = await dbAll(getDevice, id);

		if (device) {
			const deleteQuery = `DELETE FROM DEVICE WHERE ID = ?`;
			await dbRun(deleteQuery, id);
		}
	};

	setupTagSql = (tagList, protocolName, id) => {
		tagList.forEach(tag => {
			tag.deviceID = id;
		});

		const bracketValue =
			"(" + ",?".repeat(Object.values(tagList[0]).length).slice(1) + "), ";
		const proTagQuery =
			`INSERT INTO ${protocolName}_TAG VALUES ` +
			bracketValue.repeat(tagList.length).slice(0, -2);

		const proTagParams = tagList.map(tag => Object.values(tag)).flat();

		const bracketValueTag = "(" + ",?".repeat(2).slice(1) + "), ";
		const tagQuery =
			`INSERT INTO TAG VALUES ` +
			bracketValueTag.repeat(tagList.length).slice(0, -2);
		const values = [];
		tagList.forEach(tag =>
			values.push({
				deviceID: tag.deviceID,
				name: tag.name,
			})
		);
		const tagParams = values.map((value) => Object.values(value)).flat();

		return { proTagQuery, proTagParams, tagQuery, tagParams };
	};

	getAll = async function (req, res) {
		try {
			const devices = await deviceModel.getAll();
			const data = devices.map(device => renameObjectKey(
				device, "protocolType", "protocol"
			));
			res.json(data);
		} catch (err) {
			// Log message
			res.status(INTERNAL_SERVER_ERROR_CODE).json({ msg: "Query fail" })
		}
	};

	create = async (req, res) => {
		const { data: deviceData, repNum: replicateNumber } = req.body;
		if (replicateNumber < 1) {
			res.status(BAD_REQUEST_CODE).json({ msg: INVALID_REPLICATE_NUMBER })
			return
		}
		
		const protocolName = deviceData.protocol.toUpperCase()
		try {
			const keyList = replicateNumber > 1 ? await deviceModel.createMany(
				deviceData,
				deviceData.config,
				deviceData.tagList,
				replicateNumber,
				protocolName
			) : await deviceModel.createOne(
				deviceData,
				deviceData.config,
				deviceData.tagList,
				protocolName
			)
			res.json({ keyList })
		} catch (err) {
			logError(err.message)
			res.status(INTERNAL_SERVER_ERROR_CODE).json({ msg: err.message })
		}
	}

	getConfigById = async function (req, res) {
		const deviceID = req.query.id;
		const protocolName = req.query.protocol.toUpperCase();
		try {
			const configs = await deviceModel.getConfig(deviceID, protocolName)
			configs.length === 0 ? res.json([]) : res.json(configs[0])
		}
		catch (err) {
			logError(err.message)
			res.status(INTERNAL_SERVER_ERROR_CODE).send({ msg: err.message })
		}
	};

	updateById = async (req, res) => {
		const deviceID = req.query.id;
		const protocolName = req.body.protocol.toUpperCase();
		const tagList = req.body.tagList;

		try {
			await deviceModel.update(deviceID, req.body, req.body.config, tagList, protocolName)
			res.json({ key: deviceID });
		} catch (err) {
			logError(err.message)
			res.status(INTERNAL_SERVER_ERROR_CODE).send({ msg: err.message })
		}
	};

	drop = async function (req, res) {
		const deviceID = req.query.id;
		try {
			await deviceModel.drop(deviceID)
			res.json({ key: deviceID });
		} catch (err) {
			logError(err.message)
			res.status(INTERNAL_SERVER_ERROR_CODE).json({ msg: err.message })
		}
	};
}

const deviceController = new DeviceController()

module.exports = deviceController;
