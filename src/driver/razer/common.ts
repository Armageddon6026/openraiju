export const RAZER_VENDOR_ID = 0x1532

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
	crc_index = 88,
	reserved_index = 89,
}

export async function sendCommand(
	device: HIDDevice,
	request: Uint8Array<ArrayBuffer>,
	wait_min: number = 500,
): Promise<DataView<ArrayBufferLike>> {
	if (!device.opened) {
		await device.open()
	}

	await device.sendFeatureReport(0x00, request)
	await new Promise((resolve) => setTimeout(resolve, wait_min))

	return device.receiveFeatureReport(0x00)
}

export function buildRazerReport(
	transaction_id: number,
	data_size: number,
	command_class: number,
	command_id: number,
) {
	const data = new Uint8Array(razer_report_type.report_buffer_size)

	data[razer_report_type.status_index] = 0x00
	data[razer_report_type.transaction_id_index] = transaction_id
	data[razer_report_type.remaining_packets_msb_index] = 0x00
	data[razer_report_type.remaining_packets_lsb_index] = 0x00
	data[razer_report_type.protocol_type_index] = 0x00
	data[razer_report_type.args_size_index] = data_size
	for (let i = 0; i < data_size; i++) {
		data[razer_report_type.args_index + i] = 0x00
	}
	data[razer_report_type.command_class_index] = command_class
	data[razer_report_type.command_id_index] = command_id
	data[razer_report_type.crc_index] = calculateCRC(data)
	data[razer_report_type.reserved_index] = 0x00

	return data
}

function calculateCRC(data: Uint8Array<ArrayBuffer>) {
	let crc = 0
	for (
		let i = razer_report_type.remaining_packets_msb_index;
		i < razer_report_type.crc_index;
		i++
	) {
		crc ^= data[i]!
	}
	return crc
}
