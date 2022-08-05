require("dotenv").config();

const {
	INTERNAL_SERVER_ERROR_CODE,
	BAD_REQUEST_CODE,
	INVALID_REPLICATE_NUMBER 
} = require("../constants/error");
const { renameObjectKey, logError } = require("../utils")
const deviceModel = require("../models/device.model");

class DeviceController {
	getAll = async (req, res) => {
		try {
			const devices = await deviceModel.getAll();
			const data = devices.map(device => renameObjectKey(
				device, "protocolType", "protocol"
			));
			res.json(data);
		} catch (err) {
			logError(err.message)
			res.status(INTERNAL_SERVER_ERROR_CODE).json({ msg: err.message })
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

	getConfigById = async (req, res) => {
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
