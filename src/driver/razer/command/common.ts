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

export async function getHyperspeedSupportList(
	this: RazerBaseDeviceConfig,
	_instance: HIDDevice,
): Promise<RazerPairedDeviceInfo[]> {
	const res = await fetch('/razer/hyperspeed_device.json')
	const data = (await res.json()) as { productId: number; type: RazerDeviceType; name: string }[]

	// if primary transaction_id bit is 0, it's a mouse device, otherwise it's a keyboard device.
	// return the different hyperspeed device list based on the device type.
	const deviceType = (this.hardware.transaction_id & 0x80) === 0 ? 'keyboard' : 'mouse'

	return data.filter((d) => d.type === deviceType).map((d) => ({ productId: d.productId, name: d.name }))
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
