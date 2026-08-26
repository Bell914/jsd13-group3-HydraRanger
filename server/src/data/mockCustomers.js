// Mock customers for development only. All identities and contact details are fictional.
export const customerData = [
  {
    id: "CUST-00892", firstName: "อารยา", lastName: "สุขใจ", displayName: "คุณอารยา สุขใจ",
    email: "araya.s@example.com", phone: "081-000-8921", tier: "vip", isActive: true,
    bodyMeasurements: { chest: 81, waist: 64, hip: 89, height: 162, weight: 48, unit: "cm" },
    preferredSize: { tops: "S", bottoms: "S" }, orderCount: 8, totalSpent: 18450,
    joinedAt: "2026-01-15T09:20:00+07:00", lastOrderAt: "2026-08-18T14:32:00+07:00",
    defaultAddress: { recipient: "อารยา สุขใจ", addressLine1: "88/12 ถนนสุขุมวิท", district: "วัฒนา", province: "กรุงเทพมหานคร", postalCode: "10110" }
  },
  {
    id: "CUST-00912", firstName: "ณัฐวุฒิ", lastName: "นามสมมติ", displayName: "คุณณัฐวุฒิ นามสมมติ",
    email: "nattawut.n@example.com", phone: "089-000-9122", tier: "regular", isActive: true,
    bodyMeasurements: { chest: 97, waist: 81, hip: 102, height: 175, weight: 70, unit: "cm" },
    preferredSize: { tops: "M", bottoms: "M" }, orderCount: 2, totalSpent: 3140,
    joinedAt: "2026-02-02T11:05:00+07:00", lastOrderAt: "2026-07-29T10:18:00+07:00",
    defaultAddress: { recipient: "ณัฐวุฒิ นามสมมติ", addressLine1: "19/4 ถนนนิมมานเหมินท์", district: "เมืองเชียงใหม่", province: "เชียงใหม่", postalCode: "50200" }
  },
  {
    id: "CUST-01004", firstName: "ศิรินทร์", lastName: "พัฒนพงษ์", displayName: "คุณศิรินทร์ พัฒนพงษ์",
    email: "sirin.p@example.com", phone: "086-000-1004", tier: "regular", isActive: true,
    bodyMeasurements: null, preferredSize: { tops: null, bottoms: null },
    orderCount: 1, totalSpent: 3800, joinedAt: "2026-08-10T16:40:00+07:00",
    lastOrderAt: "2026-08-12T09:15:00+07:00",
    defaultAddress: { recipient: "ศิรินทร์ พัฒนพงษ์", addressLine1: "55/9 ถนนมิตรภาพ", district: "เมืองขอนแก่น", province: "ขอนแก่น", postalCode: "40000" }
  },
  {
    id: "CUST-01018", firstName: "ธีรภัทร", lastName: "แสงทอง", displayName: "คุณธีรภัทร แสงทอง",
    email: "teerapat.s@example.com", phone: "082-000-1018", tier: "vip", isActive: true,
    bodyMeasurements: { chest: 104, waist: 88, hip: 103, height: 181, weight: 79, unit: "cm" },
    preferredSize: { tops: "L", bottoms: "L" }, orderCount: 11, totalSpent: 24690,
    joinedAt: "2025-11-21T13:12:00+07:00", lastOrderAt: "2026-08-20T18:45:00+07:00",
    defaultAddress: { recipient: "ธีรภัทร แสงทอง", addressLine1: "120/7 ถนนพระราม 9", district: "ห้วยขวาง", province: "กรุงเทพมหานคร", postalCode: "10310" }
  },
  {
    id: "CUST-01027", firstName: "พิมพ์ชนก", lastName: "วัฒนกิจ", displayName: "คุณพิมพ์ชนก วัฒนกิจ",
    email: "pimchanok.w@example.com", phone: "095-000-1027", tier: "regular", isActive: true,
    bodyMeasurements: { chest: 86, waist: 69, hip: 94, height: 166, weight: 53, unit: "cm" },
    preferredSize: { tops: "S", bottoms: "M" }, orderCount: 4, totalSpent: 6870,
    joinedAt: "2026-03-08T08:50:00+07:00", lastOrderAt: "2026-08-05T12:26:00+07:00",
    defaultAddress: { recipient: "พิมพ์ชนก วัฒนกิจ", addressLine1: "41/3 ถนนรัชดาภิเษก", district: "จตุจักร", province: "กรุงเทพมหานคร", postalCode: "10900" }
  },
  {
    id: "CUST-01035", firstName: "กิตติพงศ์", lastName: "เจริญผล", displayName: "คุณกิตติพงศ์ เจริญผล",
    email: "kittipong.c@example.com", phone: "090-000-1035", tier: "regular", isActive: false,
    bodyMeasurements: { chest: 99, waist: 84, hip: 100, height: 173, weight: 74, unit: "cm" },
    preferredSize: { tops: "M", bottoms: "M" }, orderCount: 3, totalSpent: 4570,
    joinedAt: "2026-01-29T20:10:00+07:00", lastOrderAt: "2026-05-14T15:30:00+07:00",
    suspendedAt: "2026-06-01T10:00:00+07:00", suspendedReason: "การชำระเงินผิดปกติ",
    defaultAddress: { recipient: "กิตติพงศ์ เจริญผล", addressLine1: "77/21 ถนนศรีนครินทร์", district: "เมืองสมุทรปราการ", province: "สมุทรปราการ", postalCode: "10270" }
  },
  {
    id: "CUST-01042", firstName: "ชลธิชา", lastName: "บุญมี", displayName: "คุณชลธิชา บุญมี",
    email: "chonticha.b@example.com", phone: "063-000-1042", tier: "regular", isActive: true,
    bodyMeasurements: null, preferredSize: { tops: "M", bottoms: null },
    orderCount: 0, totalSpent: 0, joinedAt: "2026-08-22T17:05:00+07:00",
    lastOrderAt: null,
    defaultAddress: { recipient: "ชลธิชา บุญมี", addressLine1: "9/15 ถนนเลี่ยงเมือง", district: "เมืองนนทบุรี", province: "นนทบุรี", postalCode: "11000" }
  },
  {
    id: "CUST-01056", firstName: "ปรเมศวร์", lastName: "อินทร์แก้ว", displayName: "คุณปรเมศวร์ อินทร์แก้ว",
    email: "paramet.i@example.com", phone: "064-000-1056", tier: "vip", isActive: true,
    bodyMeasurements: { chest: 107, waist: 91, hip: 106, height: 184, weight: 83, unit: "cm" },
    preferredSize: { tops: "L", bottoms: "L" }, orderCount: 7, totalSpent: 13750,
    joinedAt: "2025-12-17T10:44:00+07:00", lastOrderAt: "2026-08-15T19:12:00+07:00",
    defaultAddress: { recipient: "ปรเมศวร์ อินทร์แก้ว", addressLine1: "222/1 ถนนเพชรเกษม", district: "หาดใหญ่", province: "สงขลา", postalCode: "90110" }
  },
  {
    id: "CUST-01063", firstName: "มณีรัตน์", lastName: "ศรีสวัสดิ์", displayName: "คุณมณีรัตน์ ศรีสวัสดิ์",
    email: "maneerat.s@example.com", phone: "098-000-1063", tier: "regular", isActive: true,
    bodyMeasurements: { chest: 91, waist: 74, hip: 99, height: 169, weight: 59, unit: "cm" },
    preferredSize: { tops: "M", bottoms: "M" }, orderCount: 5, totalSpent: 8290,
    joinedAt: "2026-02-25T14:31:00+07:00", lastOrderAt: "2026-08-09T11:48:00+07:00",
    defaultAddress: { recipient: "มณีรัตน์ ศรีสวัสดิ์", addressLine1: "31/6 ถนนพหลโยธิน", district: "เมืองเชียงราย", province: "เชียงราย", postalCode: "57000" }
  },
  {
    id: "CUST-01071", firstName: "ภาคภูมิ", lastName: "ตั้งใจดี", displayName: "คุณภาคภูมิ ตั้งใจดี",
    email: "pakpoom.t@example.com", phone: "092-000-1071", tier: "regular", isActive: true,
    bodyMeasurements: { chest: 94, waist: 78, hip: 95, height: 170, weight: 65, unit: "cm" },
    preferredSize: { tops: "M", bottoms: "S" }, orderCount: 2, totalSpent: 2780,
    joinedAt: "2026-06-12T09:08:00+07:00", lastOrderAt: "2026-08-01T16:52:00+07:00",
    defaultAddress: { recipient: "ภาคภูมิ ตั้งใจดี", addressLine1: "14/8 ถนนแจ้งวัฒนะ", district: "ปากเกร็ด", province: "นนทบุรี", postalCode: "11120" }
  },
  {
    id: "CUST-01084", firstName: "ลลิตา", lastName: "เกษมสุข", displayName: "คุณลลิตา เกษมสุข",
    email: "lalita.k@example.com", phone: "083-000-1084", tier: "vip", isActive: true,
    bodyMeasurements: { chest: 88, waist: 70, hip: 96, height: 164, weight: 54, unit: "cm" },
    preferredSize: { tops: "S", bottoms: "M" }, orderCount: 9, totalSpent: 16240,
    joinedAt: "2025-10-04T12:25:00+07:00", lastOrderAt: "2026-08-23T13:40:00+07:00",
    defaultAddress: { recipient: "ลลิตา เกษมสุข", addressLine1: "66/2 ถนนสาทร", district: "สาทร", province: "กรุงเทพมหานคร", postalCode: "10120" }
  },
  {
    id: "CUST-01099", firstName: "ธนกฤต", lastName: "พูลทรัพย์", displayName: "คุณธนกฤต พูลทรัพย์",
    email: "thanakrit.p@example.com", phone: "088-000-1099", tier: "regular", isActive: true,
    bodyMeasurements: null, preferredSize: { tops: "L", bottoms: "L" },
    orderCount: 1, totalSpent: 1590, joinedAt: "2026-08-19T18:21:00+07:00",
    lastOrderAt: "2026-08-20T08:37:00+07:00",
    defaultAddress: { recipient: "ธนกฤต พูลทรัพย์", addressLine1: "10/20 ถนนบรมราชชนนี", district: "ตลิ่งชัน", province: "กรุงเทพมหานคร", postalCode: "10170" }
  }
];

export const customerStats = {
  total: customerData.length,
  active: customerData.filter((customer) => customer.isActive).length,
  suspended: customerData.filter((customer) => !customer.isActive).length,
  vip: customerData.filter((customer) => customer.tier === "vip").length,
  withMeasurements: customerData.filter((customer) => customer.bodyMeasurements).length,
  totalRevenue: customerData.reduce((sum, customer) => sum + customer.totalSpent, 0)
};

export const customersData = customerData;
