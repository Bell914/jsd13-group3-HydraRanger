export const STATUS_OPTIONS = [
  ['pending', 'รอตรวจสอบ'],
  ['paid', 'ชำระเงินแล้ว'],
  ['processing', 'กำลังเตรียมสินค้า'],
  ['shipped', 'จัดส่งแล้ว'],
  ['completed', 'สำเร็จ'],
  ['cancelled', 'ยกเลิก'],
  ['refunded', 'คืนเงิน']
];

export const NEXT_STATUSES = {
  pending: ['pending', 'paid', 'cancelled'],
  paid: ['paid', 'processing', 'cancelled', 'refunded'],
  processing: ['processing', 'shipped', 'cancelled', 'refunded'],
  shipped: ['shipped', 'completed', 'refunded'],
  completed: ['completed', 'refunded'],
  cancelled: ['cancelled'],
  refunded: ['refunded']
};

export function getNextStatuses(status) {
  return NEXT_STATUSES[status] || [status];
}
