import { printBuffer } from '@/driver/utils'

export enum razer_storage_type {
	runtime = 0x00,
	profile_slot_default = 0x01,
	profile_slot_1 = 0x02,
	profile_slot_2 = 0x03,
	profile_slot_3 = 0x04,
	profile_slot_4 = 0x05,
}

export enum razer_report_status {
	new_command = 0x00,
	command_busy = 0x01,
	command_successful = 0x02,
	command_failure = 0x03,
	command_timeout = 0x04,
	command_not_supported = 0x05,
}

export enum razer_report_type {
	report_buffer_size = 90,
	status_index = 0,
	transaction_id_index = 1,
	remaining_packets_msb_index = 2,
	remaining_packets_lsb_index = 3,
	protocol_type_index = 4,
	args_size_index = 5,
	command_class_index = 6,
	command_id_index = 7,
	args_index = 8, //args start from 8~87,total 80 bytes
	max_args_length = 80,
	crc_index = 88,
	reserved_index = 89,
}

const deviceQueues = new WeakMap<HIDDevice, Promise<unknown>>()

export async function sendCommand(
	device: HIDDevice,
	request: Uint8Array<ArrayBuffer>,
	wait_min: number,
): Promise<DataView<ArrayBufferLike>> {
	const last = deviceQueues.get(device) ?? Promise.resolve()
	const next = last.then(async () => {
		if (!device.opened) await device.open()

		await device.sendFeatureReport(0x00, request)
		await new Promise((resolve) => setTimeout(resolve, wait_min))

		const response = await device.receiveFeatureReport(0x00)
		if (response.byteLength !== razer_report_type.report_buffer_size) {
			throw new Error('Invalid response length')
		}

		if (response.getUint8(razer_report_type.status_index) !== razer_report_status.command_successful) {
			throw new Error(getRazerReportStatus(response.getUint8(razer_report_type.status_index)))
		}

		return new DataView(
			response.buffer,
			response.byteOffset + razer_report_type.args_index,
			response.byteLength - razer_report_type.args_index,
		)
	})

	deviceQueues.set(
		device,
		next.then(
			() => {},
			() => {},
		),
	)

	return next
}

export function buildRazerReport(
	transaction_id: number,
	data_size: number,
	command_class: number,
	command_id: number,
	args?: number[],
) {
	const data = new Uint8Array(razer_report_type.report_buffer_size)

	data[razer_report_type.status_index] = razer_report_status.new_command
	data[razer_report_type.transaction_id_index] = transaction_id
	data[razer_report_type.remaining_packets_msb_index] = 0x00
	data[razer_report_type.remaining_packets_lsb_index] = 0x00
	data[razer_report_type.protocol_type_index] = 0x00
	data[razer_report_type.args_size_index] = data_size
	if (args) {
		const argsLength = Math.min(args.length, razer_report_type.max_args_length)

		for (let i = 0; i < argsLength; i++) {
			data[razer_report_type.args_index + i] = args[i] ?? 0x00
		}
	}
	data[razer_report_type.command_class_index] = command_class
	data[razer_report_type.command_id_index] = command_id
	data[razer_report_type.crc_index] = calculateCRC(data)
	data[razer_report_type.reserved_index] = 0x00

	return data
}

export async function razerTestCommand(
	device: RazerDevice,
	data_size: number,
	command_class: number,
	command_id: number,
	args?: number[],
) {
	const response = await sendCommand(
		device.instance,
		buildRazerReport(device.config.hardware.transaction_id, data_size, command_class, command_id, args),
		device.config.hardware.wait_min,
	)

	printBuffer(
		response.buffer.slice(
			razer_report_type.args_index,
			razer_report_type.args_index + razer_report_type.max_args_length,
		),
	)
}

export const common_command = {
	async getSerial(this: RazerBaseDeviceConfig, instance: HIDDevice): Promise<string> {
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x16, 0x00, 0x82),
			this.hardware.wait_min,
		)

		// serial format: 15 bytes + 1 \0
		const bytes = new Uint8Array(response.buffer, response.byteOffset, 0x16)
		return new TextDecoder('ascii').decode(bytes).replace(/\0+$/, '') // remove padding \0
	},

	async getFirmware(this: RazerBaseDeviceConfig, instance: HIDDevice): Promise<string> {
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x04, 0x00, 0x81),
			this.hardware.wait_min,
		)

		// firmware format: 4 bytes
		return `${response.getUint8(0)}.${response.getUint8(1)}.${response.getUint8(2)}.${response.getUint8(3)}`
	},

	async getBatteryLevel(this: RazerBaseDeviceConfig, instance: HIDDevice): Promise<number> {
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x02, 0x07, 0x80),
			this.hardware.wait_min,
		)

		return Math.round(
			// battery level located at args_index + 1 (total 2 bytes)
			(response.getUint8(1) / 255) * 100,
		)
	},

	async getChargeState(this: RazerBaseDeviceConfig, instance: HIDDevice): Promise<boolean> {
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x02, 0x07, 0x84),
			this.hardware.wait_min,
		)

		// charge state located at args_index + 1, 0 when not charging, 1 when charging
		return response.getUint8(1) === 1
	},

	async getLowBatteryThreshold(this: RazerBaseDeviceConfig, instance: HIDDevice): Promise<number> {
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x01, 0x07, 0x81),
			this.hardware.wait_min,
		)

		// Same as battery level response format
		return Math.round((response.getUint8(0) / 255) * 100)
	},

	async getIdleTime(this: RazerBaseDeviceConfig, instance: HIDDevice): Promise<number> {
		const response = await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x02, 0x07, 0x83),
			this.hardware.wait_min,
		)

		// idle time located at args_index (total 2 bytes), unit is seconds, convert to minutes
		return Math.round(response.getUint16(0, false) / 60)
	},

	async setIdleTime(this: RazerBaseDeviceConfig, instance: HIDDevice, minutes: number): Promise<void> {
		const roundedMinutes = Math.round(minutes)
		if (roundedMinutes < 1 || roundedMinutes > 15) {
			throw new Error('Idle time must be between 1 and 15 minutes')
		}

		const setVal = roundedMinutes * 60
		const args: number[] = []
		let offset = 0
		args[offset++] = (setVal >> 8) & 0xff
		args[offset++] = setVal & 0xff

		await sendCommand(
			instance,
			buildRazerReport(this.hardware.transaction_id, 0x02, 0x07, 0x03, args),
			this.hardware.wait_min,
		)
	},
}

// Private helper functions --

function calculateCRC(data: Uint8Array<ArrayBuffer>) {
	let crc = 0
	for (let i = razer_report_type.remaining_packets_msb_index; i < razer_report_type.crc_index; i++) {
		crc ^= data[i]!
	}
	return crc
}

function getRazerReportStatus(status: number): string {
	switch (status) {
		case razer_report_status.new_command:
			return 'New Command'
		case razer_report_status.command_busy:
			return 'Command Busy'
		case razer_report_status.command_successful:
			return 'Command Successful'
		case razer_report_status.command_failure:
			return 'Command Failure'
		case razer_report_status.command_timeout:
			return 'Command Timeout'
		case razer_report_status.command_not_supported:
			return 'Command Not Supported'
		default:
			return 'Unknown Status'
	}
}
